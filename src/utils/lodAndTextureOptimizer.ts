import * as THREE from 'three';
import { performanceOptimizer } from './performanceOptimizer';

export type LODQualityLevel = 'high' | 'medium' | 'low';

export interface LODModelParams {
  highDetailDistance?: number;
  mediumDetailDistance?: number;
  lowDetailDistance?: number;
}

class LODAndTextureOptimizer {
  private currentQuality: LODQualityLevel = 'high';
  private textureCache: Map<string, THREE.Texture> = new Map();
  private geometryPool: Map<string, THREE.BufferGeometry> = new Map();
  private materialPool: Map<string, THREE.Material> = new Map();

  constructor() {
    this.autoDetectDeviceQuality();
  }

  public autoDetectDeviceQuality(): LODQualityLevel {
    const config = performanceOptimizer.getConfig();
    if (config.isLowEndDevice) {
      this.currentQuality = 'low';
    } else {
      const isMobile =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad/i.test(navigator.userAgent);
      this.currentQuality = isMobile ? 'medium' : 'high';
    }
    return this.currentQuality;
  }

  public getQuality(): LODQualityLevel {
    return this.currentQuality;
  }

  public setQuality(quality: LODQualityLevel) {
    this.currentQuality = quality;
  }

  /**
   * Returns optimal geometry segment multipliers depending on device LOD quality
   */
  public getSegmentMultiplier(): number {
    switch (this.currentQuality) {
      case 'low':
        return 0.35; // ~8-12 segments
      case 'medium':
        return 0.6; // ~16-20 segments
      case 'high':
      default:
        return 1.0; // 32 segments
    }
  }

  /**
   * Clamps WebGL pixel ratio to conserve GPU memory and battery on mobile
   */
  public getOptimalPixelRatio(windowRatio: number = 1.0): number {
    const raw = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    switch (this.currentQuality) {
      case 'low':
        return Math.min(raw, 1.0);
      case 'medium':
        return Math.min(raw, 1.25);
      case 'high':
      default:
        return Math.min(raw, 2.0);
    }
  }

  /**
   * Recycle and fetch pooled BufferGeometry to prevent GC pressure and memory spikes
   */
  public getCachedGeometry<T extends THREE.BufferGeometry>(
    key: string,
    factory: () => T
  ): T {
    if (!this.geometryPool.has(key)) {
      this.geometryPool.set(key, factory());
    }
    return this.geometryPool.get(key)!.clone() as T;
  }

  /**
   * Creates a THREE.LOD container node wrapping high, medium, and low mesh variants
   */
  public createLODNode(
    highMesh: THREE.Object3D,
    mediumMesh?: THREE.Object3D,
    lowMesh?: THREE.Object3D,
    params: LODModelParams = {}
  ): THREE.LOD {
    const lod = new THREE.LOD();
    const dHigh = params.highDetailDistance ?? 0;
    const dMedium = params.mediumDetailDistance ?? 5;
    const dLow = params.lowDetailDistance ?? 12;

    lod.addLevel(highMesh, dHigh);

    if (mediumMesh) {
      lod.addLevel(mediumMesh, dMedium);
    } else {
      lod.addLevel(highMesh, dMedium);
    }

    if (lowMesh) {
      lod.addLevel(lowMesh, dLow);
    } else if (mediumMesh) {
      lod.addLevel(mediumMesh, dLow);
    } else {
      lod.addLevel(highMesh, dLow);
    }

    return lod;
  }

  /**
   * Clamps frame delta to prevent animation jumps, physics glitches, or lag spikes during heavy loading
   */
  public clampDelta(rawDelta: number, maxDelta: number = 0.0333): number {
    if (isNaN(rawDelta) || rawDelta <= 0) return 0.0166;
    return Math.min(rawDelta, maxDelta);
  }

  /**
   * Safely disposes a WebGLRenderer, clearing render lists, shadow maps, DOM elements, and WebGL contexts
   */
  public disposeRenderer(renderer: THREE.WebGLRenderer | null) {
    if (!renderer) return;

    try {
      renderer.renderLists.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      // Force WebGL context loss to immediately free VRAM
      if (renderer.forceContextLoss) {
        renderer.forceContextLoss();
      }
    } catch (err) {
      console.warn('WebGL renderer disposal warning:', err);
    }
  }

  /**
   * Safely disposes all textures, materials, geometries, and light objects in a Three.js hierarchy
   * Crucial for eliminating memory leaks on mobile devices during screen navigation
   */
  public disposeHierarchy(root: THREE.Object3D) {
    if (!root) return;

    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => this.disposeMaterial(mat));
          } else {
            this.disposeMaterial(mesh.material);
          }
        }
      } else if ((child as THREE.Light).isLight) {
        const light = child as THREE.Light;
        if (light.dispose) {
          light.dispose();
        }
      }
    });

    while (root.children.length > 0) {
      const obj = root.children[0];
      root.remove(obj);
    }
  }

  private downscaleTexture(texture: THREE.Texture, maxDim: number = 1024): THREE.Texture {
    const image = texture.image as any;
    if (!image || (image.width <= maxDim && image.height <= maxDim)) return texture;

    const canvas = document.createElement('canvas');
    const scale = Math.min(maxDim / image.width, maxDim / image.height);
    canvas.width = Math.floor(image.width * scale);
    canvas.height = Math.floor(image.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return texture;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.name = texture.name + '_downscaled';
    newTexture.wrapS = texture.wrapS;
    newTexture.wrapT = texture.wrapT;
    newTexture.magFilter = texture.magFilter;
    newTexture.minFilter = texture.minFilter;
    newTexture.anisotropy = texture.anisotropy;
    if ((texture as any).colorSpace) (newTexture as any).colorSpace = (texture as any).colorSpace;

    texture.dispose();
    return newTexture;
  }

  private disposeMaterial(mat: THREE.Material) {
    mat.dispose();

    // Dispose attached textures
    const stdMat = mat as any;
    const textureKeys = [
      'map',
      'lightMap',
      'bumpMap',
      'normalMap',
      'specularMap',
      'envMap',
      'alphaMap',
      'aoMap',
      'displacementMap',
      'emissiveMap',
      'roughnessMap',
      'metalnessMap',
    ];

    textureKeys.forEach((key) => {
      if (stdMat[key] && typeof stdMat[key].dispose === 'function') {
        stdMat[key].dispose();
      }
    });
  }

  /**
   * Loads a GLTF/GLB model from a URL and caches it to optimize network and memory usage
   */
  public async loadGLTF(url: string): Promise<any> {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          // Apply automatic material, texture and LOD optimizations on loaded GLTF meshes!
          gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // Apply texture downscaling
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(mat => {
                  const mapProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'aoMap', 'emissiveMap'];
                  mapProps.forEach(prop => {
                    if (mat[prop] && mat[prop].isTexture) {
                      mat[prop] = this.downscaleTexture(mat[prop]);
                    }
                  });
                });
              }

              // Force performance-friendly materials if quality is low
              if (this.currentQuality === 'low' && child.material) {
                const oldMat = child.material;
                child.material = new THREE.MeshBasicMaterial({
                  color: oldMat.color,
                  map: oldMat.map,
                  transparent: oldMat.transparent,
                  opacity: oldMat.opacity,
                });
                oldMat.dispose();
              } else if (child.material) {
                // Ensure proper roughness and metalness for high-quality standard look
                child.material.roughness = 0.45;
                child.material.metalness = 0.25;
              }
            }
          });
          resolve(gltf);
        },
        undefined,
        (err) => reject(err)
      );
    });
  }

  /**
   * Loads multiple GLTF models with timeout handling.
   * If a model fails to load or times out, it is marked as failed, allowing fallback.
   */
  public async loadGLTFModelsWithTimeout(
    models: { id: string; url: string }[],
    timeoutMs: number = 5000
  ): Promise<Map<string, { gltf: any | null; failed: boolean }>> {
    const results = new Map<string, { gltf: any | null; failed: boolean }>();

    const loadPromises = models.map(async (model) => {
      try {
        const gltf = await Promise.race([
          this.loadGLTF(model.url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout loading ${model.url}`)), timeoutMs)
          ),
        ]);
        results.set(model.id, { gltf, failed: false });
      } catch (err) {
        console.warn(`Asset loading failed for ${model.id}:`, err);
        results.set(model.id, { gltf: null, failed: true });
      }
    });

    await Promise.all(loadPromises);
    return results;
  }

  /**
   * Safely clones a loaded GLTF scene including skinned meshes and skeleton bone rigs
   */
  public cloneGLTFScene(gltf: any): THREE.Group {
    const scene = gltf.scene;
    const clone = scene.clone(true);
    
    // Remap bones for skinned meshes so cloned animations bind perfectly!
    const clonedSkinnedMeshes: THREE.SkinnedMesh[] = [];
    const clonedBones: Record<string, THREE.Bone> = {};
    
    clone.traverse((node: any) => {
      if (node.isBone) {
        clonedBones[node.name] = node;
      }
      if (node.isSkinnedMesh) {
        clonedSkinnedMeshes.push(node);
      }
    });
    
    clonedSkinnedMeshes.forEach((mesh) => {
      if (mesh.skeleton) {
        const remappedBones = mesh.skeleton.bones.map((bone: any) => {
          return clonedBones[bone.name] || bone;
        });
        mesh.bind(new THREE.Skeleton(remappedBones, mesh.skeleton.boneInverses), mesh.matrixWorld);
      }
    });
    
    return clone;
  }

  public clearPools() {
    this.geometryPool.forEach((geo) => geo.dispose());
    this.geometryPool.clear();

    this.materialPool.forEach((mat) => mat.dispose());
    this.materialPool.clear();

    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
  }
}

export const lodAndTextureOptimizer = new LODAndTextureOptimizer();
