import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Package } from 'lucide-react';
import { lodAndTextureOptimizer } from '../utils/lodAndTextureOptimizer';

interface ThreeCrateCanvasProps {
  type: 'supply' | 'elite' | 'mystery';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  phase?: 'dropping' | 'shaking' | 'exploding' | 'revealed';
  className?: string;
  autoRotate?: boolean;
}

export const ThreeCrateCanvas: React.FC<ThreeCrateCanvasProps> = ({
  type,
  rarity = 'common',
  phase = 'dropping',
  className = 'w-full h-48',
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cleanupFn = () => {};

    try {
      const width = container.clientWidth || 300;
      const height = container.clientHeight || 240;

      // 1. Scene, Camera, Renderer Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 1.9, 4.4);
      camera.lookAt(0, 0.1, 0);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(lodAndTextureOptimizer.getOptimalPixelRatio());
      renderer.shadowMap.enabled = lodAndTextureOptimizer.getQuality() !== 'low';
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.appendChild(renderer.domElement);

      // 2. Color Palette mapping based on rarity or crate type
      let primaryColor = 0x1e293b; // common: slate
      let accentColor = 0x64748b;
      let glowColor = 0x94a3b8;

      if (rarity === 'rare' || type === 'mystery') {
        primaryColor = 0x0369a1; // Sky blue
        accentColor = 0x38bdf8;
        glowColor = 0x0ea5e9;
      } else if (rarity === 'epic') {
        primaryColor = 0x6b21a8; // Purple
        accentColor = 0xc084fc;
        glowColor = 0xa855f7;
      } else if (rarity === 'legendary' || type === 'elite') {
        primaryColor = 0xb45309; // Gold/Amber
        accentColor = 0xfbbf24;
        glowColor = 0xf59e0b;
      }

      // 3. Ambient and Scene Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
      dirLight1.position.set(4, 6, 5);
      dirLight1.castShadow = true;
      scene.add(dirLight1);

      const rimLight = new THREE.DirectionalLight(accentColor, 1.2);
      rimLight.position.set(-3, 2, -3);
      scene.add(rimLight);

      // Core Glowing Light inside the crate base
      const coreLight = new THREE.PointLight(glowColor, 2.0, 8);
      coreLight.position.set(0, 0.15, 0);
      scene.add(coreLight);

      // 4. Build Assembly Group
      const crateGroup = new THREE.Group();

      // BASE GROUP (Stay stationary except for parent shake)
      const baseGroup = new THREE.Group();
      
      const baseBodyGeo = new THREE.BoxGeometry(1.6, 0.55, 1.2);
      const baseBodyMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.35,
        metalness: 0.75,
      });
      const baseBodyMesh = new THREE.Mesh(baseBodyGeo, baseBodyMat);
      baseBodyMesh.position.y = -0.275;
      baseBodyMesh.castShadow = true;
      baseBodyMesh.receiveShadow = true;
      baseGroup.add(baseBodyMesh);

      // Base Metal Corners / Reinforcements
      const cornerGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
      const cornerMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.2,
        metalness: 0.9,
      });

      const baseCornerPositions = [
        [-0.8, -0.45, 0.6],
        [0.8, -0.45, 0.6],
        [-0.8, -0.45, -0.6],
        [0.8, -0.45, -0.6],
      ];
      baseCornerPositions.forEach(([cx, cy, cz]) => {
        const cornerMesh = new THREE.Mesh(cornerGeo, cornerMat);
        cornerMesh.position.set(cx, cy, cz);
        baseGroup.add(cornerMesh);
      });

      // Internal glowing core cylinder mesh (visible when opened)
      const coreMeshGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
      const coreMeshMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });
      const coreMesh = new THREE.Mesh(coreMeshGeo, coreMeshMat);
      coreMesh.position.set(0, 0.05, 0);
      baseGroup.add(coreMesh);

      crateGroup.add(baseGroup);

      // LID HINGE GROUP (Allows rotation around the back edge)
      const lidHingeGroup = new THREE.Group();
      lidHingeGroup.position.set(0, 0.02, -0.6); // Hinge pivot at the back edge

      const lidMeshGroup = new THREE.Group();
      lidMeshGroup.position.set(0, 0.25, 0.6); // Offset center to align correctly

      // Lid main box body
      const lidBodyGeo = new THREE.BoxGeometry(1.6, 0.5, 1.2);
      const lidBodyMesh = new THREE.Mesh(lidBodyGeo, baseBodyMat);
      lidBodyMesh.castShadow = true;
      lidMeshGroup.add(lidBodyMesh);

      // Lid metal frames & handles
      const lidCornerPositions = [
        [-0.8, 0.25, -0.6],
        [0.8, 0.25, -0.6],
        [-0.8, 0.25, 0.6],
        [0.8, 0.25, 0.6],
      ];
      lidCornerPositions.forEach(([lx, ly, lz]) => {
        const cornerMesh = new THREE.Mesh(cornerGeo, cornerMat);
        cornerMesh.position.set(lx, ly, lz);
        lidMeshGroup.add(cornerMesh);
      });

      // Latch/Lock on the front center
      const lockLatchGeo = new THREE.BoxGeometry(0.18, 0.32, 0.12);
      const lockLatchMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.15,
        metalness: 0.95,
      });
      const lockLatchMesh = new THREE.Mesh(lockLatchGeo, lockLatchMat);
      lockLatchMesh.position.set(0, -0.25, 0.62);
      lidMeshGroup.add(lockLatchMesh);

      lidHingeGroup.add(lidMeshGroup);
      crateGroup.add(lidHingeGroup);

      // Energy Ring under the crate
      const ringGeo = new THREE.TorusGeometry(1.3, 0.03, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -0.55;
      crateGroup.add(ringMesh);

      scene.add(crateGroup);

      // 5. Dynamic Particle System Array (Physical Debris Fountain)
      interface PhysicalParticle {
        mesh: THREE.Mesh;
        vx: number;
        vy: number;
        vz: number;
        life: number;
        rotSpeedX: number;
        rotSpeedY: number;
      }
      const particles: PhysicalParticle[] = [];

      // Particle geometry
      const particleGeo = new THREE.TetrahedronGeometry(0.09, 0);

      const spawnParticleExplosion = () => {
        const count = 48;
        for (let i = 0; i < count; i++) {
          const particleMat = new THREE.MeshStandardMaterial({
            color: glowColor,
            emissive: glowColor,
            emissiveIntensity: 2.0,
            roughness: 0.1,
            metalness: 0.9,
          });
          const pMesh = new THREE.Mesh(particleGeo, particleMat);
          
          // Initial position inside open core
          pMesh.position.set(
            (Math.random() - 0.5) * 0.5,
            0.1,
            (Math.random() - 0.5) * 0.3
          );
          scene.add(pMesh);

          // Physical velocities (upward volcano burst)
          const angle = Math.random() * Math.PI * 2;
          const horizontalSpeed = 0.06 + Math.random() * 0.12;
          particles.push({
            mesh: pMesh,
            vx: Math.cos(angle) * horizontalSpeed * 0.5,
            vy: 0.14 + Math.random() * 0.22,
            vz: Math.sin(angle) * horizontalSpeed * 0.5,
            life: 1.0,
            rotSpeedX: (Math.random() - 0.5) * 8,
            rotSpeedY: (Math.random() - 0.5) * 8,
          });
        }
      };

      // Trigger blast immediately if rendering already in open state
      if (phase === 'exploding' || phase === 'revealed') {
        spawnParticleExplosion();
      }

      // 6. Animation Loop with realistic physics and state machine
      let reqId: number;
      const clock = new THREE.Clock();

      let lastPhase = phase;
      let targetLidAngle = 0;
      let glowDecaySpeed = 0.05;

      const animate = () => {
        reqId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Detect phase changes
        if (phase !== lastPhase) {
          if (phase === 'exploding') {
            spawnParticleExplosion();
            coreLight.intensity = 24.0; // Flash intensity
          }
          lastPhase = phase;
        }

        // State Machine Lid Target Rotations & Light Behavior
        if (phase === 'dropping' || phase === 'shaking') {
          targetLidAngle = 0;
          // Pulsing pre-opening energy
          coreLight.intensity = 1.8 + Math.sin(elapsedTime * 15) * 0.8;
        } else {
          // opening & revealed
          targetLidAngle = -Math.PI * 0.65; // Fold completely backwards
          // Soft slow shimmer decay for opened state
          if (coreLight.intensity > 8.0) {
            coreLight.intensity -= glowDecaySpeed;
          } else {
            coreLight.intensity = 8.0 + Math.sin(elapsedTime * 4) * 1.5;
          }
        }

        // Shaking state jitter physics
        let shakeOffset = new THREE.Vector3(0, 0, 0);
        let lidShake = 0;
        if (phase === 'shaking') {
          shakeOffset.set(
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.08
          );
          lidShake = Math.sin(elapsedTime * 65) * 0.12; // Fast lid rattle
        }

        // Smoothly lerp lid rotation
        lidHingeGroup.rotation.x = THREE.MathUtils.lerp(
          lidHingeGroup.rotation.x,
          targetLidAngle + lidShake,
          0.12
        );

        // Position & Rotate Main Crate Group
        if (autoRotate && phase === 'revealed') {
          // Slow graceful rotate after reveal
          crateGroup.rotation.y = elapsedTime * 0.5;
        } else if (phase === 'shaking') {
          crateGroup.rotation.y = Math.sin(elapsedTime * 8) * 0.1;
        } else {
          crateGroup.rotation.y = 0;
        }

        // Floating bounce
        crateGroup.position.copy(shakeOffset);
        crateGroup.position.y += Math.sin(elapsedTime * 2.5) * 0.07;

        // Energy Ring expansion
        const ringScale = 1 + Math.sin(elapsedTime * 3.5) * 0.06;
        ringMesh.scale.set(ringScale, ringScale, ringScale);

        // Physical Particle Update
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.mesh.position.x += p.vx;
          p.mesh.position.y += p.vy;
          p.mesh.position.z += p.vz;

          // Apply physics gravity & air resistance
          p.vy -= 0.007;
          p.vx *= 0.97;
          p.vz *= 0.97;

          p.mesh.rotation.x += p.rotSpeedX * 0.01;
          p.mesh.rotation.y += p.rotSpeedY * 0.01;

          // Decay life & scale
          p.life -= 0.013;
          if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            if (Array.isArray(p.mesh.material)) {
              p.mesh.material.forEach((m) => m.dispose());
            } else {
              p.mesh.material.dispose();
            }
            particles.splice(i, 1);
          } else {
            p.mesh.scale.setScalar(p.life);
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container) return;
        const newW = container.clientWidth || 300;
        const newH = container.clientHeight || 240;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };

      window.addEventListener('resize', handleResize);

      cleanupFn = () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        
        // Remove particles from scene
        particles.forEach((p) => {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          if (Array.isArray(p.mesh.material)) {
            p.mesh.material.forEach((m) => m.dispose());
          } else {
            p.mesh.material.dispose();
          }
        });

        lodAndTextureOptimizer.disposeHierarchy(scene);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.warn('WebGL Crate Opening failed, using 2D fallback:', err);
      setWebglFailed(true);
    }

    return () => {
      cleanupFn();
    };
  }, [type, rarity, phase, autoRotate]);

  if (webglFailed) {
    const fallbackColors = {
      supply: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      elite: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      mystery: 'text-sky-400 bg-sky-500/10 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
    };

    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#111c14] to-[#0a100c] border border-[#2a4531]/40 rounded-2xl text-center p-4 ${className}`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 border ${fallbackColors[type]} animate-pulse`}>
          <Package className="w-7 h-7" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-gray-200">
          {type === 'elite' ? 'Elite' : type === 'mystery' ? 'Mystery' : 'Supply'} Box
        </span>
        <span className="text-[10px] text-gray-400 mt-1">
          {phase === 'dropping' ? 'قادم من المظلة...' : phase === 'shaking' ? 'يهتز ويستعد للانفجار! 💥' : 'تم فتح الصندوق بنجاح! 🔓'}
        </span>
      </div>
    );
  }

  return <div ref={mountRef} className={`relative overflow-hidden cursor-grab active:cursor-grabbing ${className}`} />;
};

export default ThreeCrateCanvas;
