import * as THREE from 'three';

/**
 * Lightweight Spring-Damper & Cloth Physics Solver for Three.js Character Clothing & Accessories.
 * Simulates rotational inertia, centripetal sway, spring damping, gravity, and aerodynamic flutter
 * on capes, scarves, dog tags, and radio antennas when the 3D character is rotated or moved.
 */

export interface PhysicsNode {
  position: THREE.Vector3;
  prevPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  pinned: boolean;
  restPos: THREE.Vector3;
}

export interface SpringConstraint {
  nodeA: PhysicsNode;
  nodeB: PhysicsNode;
  restLength: number;
  stiffness: number;
}

export class ClothingPhysicsSystem {
  private lastRotationY: number = 0;
  private angularVelocityY: number = 0;
  private angularAccelerationY: number = 0;
  private prevAngularVelY: number = 0;

  // 1. Cape Cloth Mesh & Verlet Grid
  public capeGroup: THREE.Group;
  private capeMesh: THREE.Mesh | null = null;
  private capeGeometry: THREE.PlaneGeometry | null = null;
  private capeGridRows: number = 6;
  private capeGridCols: number = 5;
  private capeNodes: PhysicsNode[][] = [];
  private capeConstraints: SpringConstraint[] = [];

  // 2. Commando Scarf Tails (Pendulum Springs)
  public scarfGroup: THREE.Group;
  private scarfLeftTail: THREE.Group | null = null;
  private scarfRightTail: THREE.Group | null = null;
  private scarfLeftRot: THREE.Vector2 = new THREE.Vector2(0, 0); // x, z
  private scarfLeftVel: THREE.Vector2 = new THREE.Vector2(0, 0);
  private scarfRightRot: THREE.Vector2 = new THREE.Vector2(0, 0);
  private scarfRightVel: THREE.Vector2 = new THREE.Vector2(0, 0);

  // 3. Military Dog Tags Pendulum
  public dogTagGroup: THREE.Group;
  private dogTagMesh: THREE.Group | null = null;
  private dogTagRot: THREE.Vector2 = new THREE.Vector2(0, 0); // pitch (x), roll (z)
  private dogTagVel: THREE.Vector2 = new THREE.Vector2(0, 0);

  // 4. Flexible Antenna
  public antennaMesh: THREE.Mesh | null = null;
  private antennaBend: number = 0; // x-axis
  private antennaBendVel: number = 0;

  // Settings & Physics Parameters
  public enabled: boolean = true;
  public stiffness: number = 0.88;
  public damping: number = 0.92;
  public gravity: number = -0.003;
  public windStrength: number = 0.008;
  public capeColorHex: number = 0x365314;

  constructor(camoColorHex: number = 0x365314) {
    this.capeColorHex = camoColorHex;
    this.capeGroup = new THREE.Group();
    this.scarfGroup = new THREE.Group();
    this.dogTagGroup = new THREE.Group();

    this.initCapeMesh();
    this.initScarfTails();
    this.initDogTags();
    this.initAntenna();
  }

  /**
   * Builds a multi-segment cloth plane mesh for the Tactical Cape
   */
  private initCapeMesh() {
    const width = 0.65;
    const height = 0.85;
    this.capeGeometry = new THREE.PlaneGeometry(width, height, this.capeGridCols - 1, this.capeGridRows - 1);
    
    // Position vertices facing backwards
    this.capeGeometry.rotateY(Math.PI);

    const capeMat = new THREE.MeshStandardMaterial({
      color: this.capeColorHex,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    this.capeMesh = new THREE.Mesh(this.capeGeometry, capeMat);
    this.capeMesh.castShadow = true;
    this.capeGroup.add(this.capeMesh);

    // Build Verlet nodes for cape grid
    const dx = width / (this.capeGridCols - 1);
    const dy = height / (this.capeGridRows - 1);

    this.capeNodes = [];
    for (let r = 0; r < this.capeGridRows; r++) {
      const row: PhysicsNode[] = [];
      for (let c = 0; c < this.capeGridCols; c++) {
        const x = (c - (this.capeGridCols - 1) / 2) * dx;
        const y = -r * dy;
        const z = -0.02;

        const pos = new THREE.Vector3(x, y, z);
        const node: PhysicsNode = {
          position: pos.clone(),
          prevPosition: pos.clone(),
          velocity: new THREE.Vector3(0, 0, 0),
          pinned: r === 0, // Top row is pinned to shoulder attachments
          restPos: pos.clone(),
        };
        row.push(node);
      }
      this.capeNodes.push(row);
    }

    // Build structural & shear spring constraints
    this.capeConstraints = [];
    for (let r = 0; r < this.capeGridRows; r++) {
      for (let c = 0; c < this.capeGridCols; c++) {
        const nodeA = this.capeNodes[r][c];

        // Horizontal neighbor
        if (c < this.capeGridCols - 1) {
          const nodeB = this.capeNodes[r][c + 1];
          this.capeConstraints.push({
            nodeA,
            nodeB,
            restLength: nodeA.restPos.distanceTo(nodeB.restPos),
            stiffness: 0.9,
          });
        }
        // Vertical neighbor
        if (r < this.capeGridRows - 1) {
          const nodeB = this.capeNodes[r + 1][c];
          this.capeConstraints.push({
            nodeA,
            nodeB,
            restLength: nodeA.restPos.distanceTo(nodeB.restPos),
            stiffness: 0.9,
          });
        }
      }
    }

    // Attach cape to back shoulders position
    this.capeGroup.position.set(0, 1.32, -0.2);
  }

  /**
   * Builds Commando Scarf Tails with articulated segments
   */
  private initScarfTails() {
    const scarfMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Crimson red commando scarf
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    // Left Tail
    this.scarfLeftTail = new THREE.Group();
    const tail1Geo = new THREE.BoxGeometry(0.08, 0.35, 0.02);
    tail1Geo.translate(0, -0.175, 0);
    const leftTailMesh = new THREE.Mesh(tail1Geo, scarfMat);
    this.scarfLeftTail.add(leftTailMesh);
    this.scarfLeftTail.position.set(-0.12, 1.48, -0.18);

    // Right Tail
    this.scarfRightTail = new THREE.Group();
    const rightTailMesh = new THREE.Mesh(tail1Geo, scarfMat);
    this.scarfRightTail.add(rightTailMesh);
    this.scarfRightTail.position.set(0.08, 1.48, -0.18);

    this.scarfGroup.add(this.scarfLeftTail, this.scarfRightTail);
  }

  /**
   * Builds Military Dog Tags Pendulum
   */
  private initDogTags() {
    this.dogTagMesh = new THREE.Group();

    // Silver Chain
    const chainGeo = new THREE.TorusGeometry(0.12, 0.008, 8, 20, Math.PI);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.15,
    });
    const chain = new THREE.Mesh(chainGeo, metalMat);
    chain.position.set(0, 0, 0.02);
    chain.rotation.x = Math.PI / 2;

    // Dog Tag 1 & 2
    const tagGeo = new THREE.BoxGeometry(0.045, 0.08, 0.006);
    const tag1 = new THREE.Mesh(tagGeo, metalMat);
    tag1.position.set(-0.015, -0.12, 0.02);
    tag1.rotation.z = -0.1;

    const tag2 = new THREE.Mesh(tagGeo, metalMat);
    tag2.position.set(0.015, -0.13, 0.025);
    tag2.rotation.z = 0.1;

    this.dogTagMesh.add(chain, tag1, tag2);
    this.dogTagMesh.position.set(0, 1.35, 0.22);
    this.dogTagGroup.add(this.dogTagMesh);
  }

  /**
   * Builds Flexible Antenna
   */
  private initAntenna() {
    const antGeo = new THREE.CylinderGeometry(0.01, 0.018, 0.38, 8);
    antGeo.translate(0, 0.19, 0);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    this.antennaMesh = new THREE.Mesh(antGeo, metalMat);
    this.antennaMesh.position.set(-0.22, 1.25, -0.22);
  }

  /**
   * Updates Cape cloth material color when skin/camo changes
   */
  public updateCapeColor(hexColor: number) {
    this.capeColorHex = hexColor;
    if (this.capeMesh) {
      (this.capeMesh.material as THREE.MeshStandardMaterial).color.setHex(hexColor);
    }
  }

  /**
   * Main Physics Tick: Solves rotational inertia, spring damping, and Verlet cloth integration.
   * Call this every animation frame passing current character rotation Y and frame delta time.
   */
  public update(currentRotationY: number, deltaSec: number = 0.016) {
    if (!this.enabled) return;

    // 1. Calculate Angular Velocity & Angular Acceleration
    let deltaRotY = currentRotationY - this.lastRotationY;
    
    // Normalize angle difference (-PI to PI)
    while (deltaRotY > Math.PI) deltaRotY -= Math.PI * 2;
    while (deltaRotY < -Math.PI) deltaRotY += Math.PI * 2;

    this.angularVelocityY = deltaRotY / Math.max(0.001, deltaSec);
    this.angularAccelerationY = (this.angularVelocityY - this.prevAngularVelY) / Math.max(0.001, deltaSec);

    this.lastRotationY = currentRotationY;
    this.prevAngularVelY = this.angularVelocityY;

    // Inertial Force vectors
    // Rotation creates a trailing tangential force in -angularVelocity direction
    const rotationalInertiaForce = -this.angularVelocityY * 0.028;
    const centrifugalForce = Math.min(0.25, Math.abs(this.angularVelocityY) * 0.015);
    const windFlutter = Math.sin(Date.now() * 0.008) * this.windStrength;

    // 2. VERLET INTEGRATION FOR CAPE CLOTH
    if (this.capeMesh && this.capeGeometry) {
      const time = Date.now() * 0.005;

      for (let r = 0; r < this.capeGridRows; r++) {
        for (let c = 0; c < this.capeGridCols; c++) {
          const node = this.capeNodes[r][c];
          if (node.pinned) continue; // Top row attached to shoulders

          // Calculate Verlet velocity
          const velX = (node.position.x - node.prevPosition.x) * this.damping;
          const velY = (node.position.y - node.prevPosition.y) * this.damping;
          const velZ = (node.position.z - node.prevPosition.z) * this.damping;

          node.prevPosition.copy(node.position);

          // Apply forces: Gravity + Rotational Inertia + Centrifugal outward billow + Aerodynamic wave
          const forceX = rotationalInertiaForce * (r / this.capeGridRows) + Math.sin(time + r * 0.5) * 0.002;
          const forceY = this.gravity;
          const forceZ = -centrifugalForce * (r / this.capeGridRows) - Math.abs(rotationalInertiaForce) * 0.012 + windFlutter * (r / 2);

          node.position.x += velX + forceX;
          node.position.y += velY + forceY;
          node.position.z += velZ + forceZ;
        }
      }

      // Satisfy Spring Distance Constraints (Relaxation iterations)
      const iterations = 3;
      for (let iter = 0; iter < iterations; iter++) {
        for (const constraint of this.capeConstraints) {
          const { nodeA, nodeB, restLength } = constraint;
          const delta = new THREE.Vector3().subVectors(nodeB.position, nodeA.position);
          const currentDist = delta.length();
          if (currentDist === 0) continue;

          const diff = (currentDist - restLength) / currentDist;
          const correction = delta.multiplyScalar(0.5 * diff * this.stiffness);

          if (!nodeA.pinned) nodeA.position.add(correction);
          if (!nodeB.pinned) nodeB.position.sub(correction);
        }
      }

      // Update Cape Mesh Geometry Vertices
      const posAttr = this.capeGeometry.attributes.position as THREE.BufferAttribute;
      let vertIdx = 0;
      for (let r = 0; r < this.capeGridRows; r++) {
        for (let c = 0; c < this.capeGridCols; c++) {
          const node = this.capeNodes[r][c];
          posAttr.setXYZ(vertIdx, node.position.x, node.position.y, node.position.z);
          vertIdx++;
        }
      }
      posAttr.needsUpdate = true;
      this.capeGeometry.computeVertexNormals();
    }

    // 3. COMMANDO SCARF PENDULUM SPRING DYNAMICS
    if (this.scarfLeftTail && this.scarfRightTail) {
      // Left Scarf Tail
      const leftSpringAccX = (-this.scarfLeftRot.x * 12.0 - rotationalInertiaForce * 40.0) - this.scarfLeftVel.x * 6.0;
      const leftSpringAccZ = (-this.scarfLeftRot.y * 12.0 + centrifugalForce * 30.0) - this.scarfLeftVel.y * 6.0;

      this.scarfLeftVel.x += leftSpringAccX * deltaSec;
      this.scarfLeftVel.y += leftSpringAccZ * deltaSec;

      this.scarfLeftRot.x += this.scarfLeftVel.x * deltaSec;
      this.scarfLeftRot.y += this.scarfLeftVel.y * deltaSec;

      this.scarfLeftTail.rotation.z = this.scarfLeftRot.x + Math.sin(Date.now() * 0.006) * 0.08;
      this.scarfLeftTail.rotation.x = this.scarfLeftRot.y;

      // Right Scarf Tail (Slightly out of phase for organic look)
      const rightSpringAccX = (-this.scarfRightRot.x * 12.0 - rotationalInertiaForce * 40.0) - this.scarfRightVel.x * 6.0;
      const rightSpringAccZ = (-this.scarfRightRot.y * 12.0 + centrifugalForce * 30.0) - this.scarfRightVel.y * 6.0;

      this.scarfRightVel.x += rightSpringAccX * deltaSec;
      this.scarfRightVel.y += rightSpringAccZ * deltaSec;

      this.scarfRightRot.x += this.scarfRightVel.x * deltaSec;
      this.scarfRightRot.y += this.scarfRightVel.y * deltaSec;

      this.scarfRightTail.rotation.z = this.scarfRightRot.x + Math.cos(Date.now() * 0.007) * 0.08;
      this.scarfRightTail.rotation.x = this.scarfRightRot.y;
    }

    // 4. MILITARY DOG TAGS PENDULUM SWAY
    if (this.dogTagMesh) {
      const dogTagSpringAccX = (-this.dogTagRot.x * 16.0 - Math.abs(rotationalInertiaForce) * 25.0) - this.dogTagVel.x * 8.0;
      const dogTagSpringAccZ = (-this.dogTagRot.y * 16.0 + rotationalInertiaForce * 45.0) - this.dogTagVel.y * 8.0;

      this.dogTagVel.x += dogTagSpringAccX * deltaSec;
      this.dogTagVel.y += dogTagSpringAccZ * deltaSec;

      this.dogTagRot.x += this.dogTagVel.x * deltaSec;
      this.dogTagRot.y += this.dogTagVel.y * deltaSec;

      this.dogTagMesh.rotation.x = this.dogTagRot.x;
      this.dogTagMesh.rotation.z = this.dogTagRot.y;
    }

    // 5. FLEXIBLE ANTENNA BEND & WOBBLE
    if (this.antennaMesh) {
      const antAcc = (-this.antennaBend * 25.0 - rotationalInertiaForce * 60.0) - this.antennaBendVel * 9.0;
      this.antennaBendVel += antAcc * deltaSec;
      this.antennaBend += this.antennaBendVel * deltaSec;
      this.antennaMesh.rotation.z = this.antennaBend;
    }
  }

  /**
   * Resets cloth grid & pendulums to rest positions
   */
  public reset() {
    this.scarfLeftRot.set(0, 0);
    this.scarfLeftVel.set(0, 0);
    this.scarfRightRot.set(0, 0);
    this.scarfRightVel.set(0, 0);
    this.dogTagRot.set(0, 0);
    this.dogTagVel.set(0, 0);
    this.antennaBend = 0;
    this.antennaBendVel = 0;

    for (let r = 0; r < this.capeGridRows; r++) {
      for (let c = 0; c < this.capeGridCols; c++) {
        const node = this.capeNodes[r][c];
        node.position.copy(node.restPos);
        node.prevPosition.copy(node.restPos);
        node.velocity.set(0, 0, 0);
      }
    }
  }
}
