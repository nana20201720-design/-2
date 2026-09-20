import * as THREE from 'three';
import { ThreeSoldierBuilder } from '../game/threeSoldierBuilder';
import { CharacterState } from '../types';

/**
 * CharacterManager: A robust controller for handling 3D model lifecycle,
 * loading states, and automatic fallbacks to 2D representations.
 */
export class CharacterManager {
  private soldierMeshes: Map<string, ThreeSoldierBuilder>;

  constructor(soldierMeshes: Map<string, ThreeSoldierBuilder>) {
    this.soldierMeshes = soldierMeshes;
  }

  /**
   * Ensures the character mesh is visible. 
   * If GLTF is requested but not loaded, it guarantees the fallback is visible.
   */
  public updateCharacterVisibility(char: CharacterState, sBuilder: ThreeSoldierBuilder) {
    if (char.isDead || char.health <= 0) {
      sBuilder.root.visible = false;
      return;
    }

    // Logic: If GLTF is requested, ensure procedural meshes are hidden ONLY if fully loaded.
    // If not loaded yet, or load failed, ensure procedural meshes are visible.
    const isGLTFRequested = !!char.gltfModelUrl;
    
    // Fallback if loading failed OR not yet loaded
    const shouldShowFallback = !isGLTFRequested || sBuilder.isGLTFLoadingFailed || !sBuilder.isGLTFLoaded;
    
    if (isGLTFRequested && !sBuilder.isGLTFLoadingFailed && sBuilder.isGLTFLoaded) {
      // GLTF fully loaded and ready
      sBuilder.root.visible = true;
      sBuilder.headGroup.visible = false;
      sBuilder.torsoGroup.visible = false;
      sBuilder.rightArmGroup.visible = false;
      sBuilder.leftArmGroup.visible = false;
    } else {
      // Fallback: Either GLTF not requested, or still loading/failed
      sBuilder.root.visible = true;
      sBuilder.headGroup.visible = true;
      sBuilder.torsoGroup.visible = true;
      sBuilder.rightArmGroup.visible = true;
      sBuilder.leftArmGroup.visible = true;
      
      // If gltf model was partially added, hide it during fallback
      if (sBuilder.gltfModelGroup) {
        sBuilder.gltfModelGroup.visible = false;
      }
    }
  }
}
