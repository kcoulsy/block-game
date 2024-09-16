import * as THREE from 'three';
import { CHUNK_SIZE, BlockType } from './config';
import { World } from './World';

export class Player {
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster;
  private velocity: THREE.Vector3;
  private world: World;
  private gravity: number = -9.8;
  private jumpForce: number = 5;
  private isOnGround: boolean = false;
  private moveDirection: THREE.Vector3;
  private selectedBlockType: BlockType = BlockType.DIRT;

  constructor(camera: THREE.Camera, world: World) {
    this.camera = camera;
    // Spawn the player above the highest block (which is at y=15 in our current terrain generation)
    this.camera.position.set(8, 25, 8); // Increased y to 25 to ensure player starts above terrain
    this.raycaster = new THREE.Raycaster();
    this.velocity = new THREE.Vector3();
    this.moveDirection = new THREE.Vector3();
    this.world = world;
  }

  move(x: number, y: number, z: number) {
    this.moveDirection.set(x, y, z);
  }

  jump() {
    if (this.isOnGround) {
      this.velocity.y = this.jumpForce;
      this.isOnGround = false;
    }
  }

  private startTime: number = 0;

  update(deltaTime: number) {
    this.startTime += deltaTime;

    // Apply gravity after a short delay
    if (this.startTime > 0.5) {
      this.velocity.y += this.gravity * deltaTime;
    }

    // Apply movement
    const moveSpeed = 5; // Adjust this value to change movement speed
    this.velocity.x = this.moveDirection.x * moveSpeed;
    this.velocity.z = this.moveDirection.z * moveSpeed;

    // Check for collisions and adjust velocity
    this.handleCollisions();

    // Update position
    this.camera.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Reset move direction
    this.moveDirection.set(0, 0, 0);
  }

  private handleCollisions() {
    const positions = [
      new THREE.Vector3(0, -1, 0), // Below
      new THREE.Vector3(0, 1, 0),  // Above
      new THREE.Vector3(-1, 0, 0), // Left
      new THREE.Vector3(1, 0, 0),  // Right
      new THREE.Vector3(0, 0, -1), // Front
      new THREE.Vector3(0, 0, 1),  // Back
    ];

    this.isOnGround = false;

    for (const position of positions) {
      const checkPos = this.camera.position.clone().add(position);
      const block = this.world.getBlockAt(checkPos);

      if (block !== BlockType.AIR) {
        if (position.y === -1) {
          this.isOnGround = true;
          this.velocity.y = Math.max(0, this.velocity.y);
        } else if (position.y === 1) {
          this.velocity.y = Math.min(0, this.velocity.y);
        }

        if (position.x !== 0) {
          this.velocity.x = 0;
        }

        if (position.z !== 0) {
          this.velocity.z = 0;
        }
      }
    }
  }

  setRotation(rotation: THREE.Quaternion) {
    this.camera.setRotationFromQuaternion(rotation);
  }

  getTargetBlock(blockMeshes: THREE.Mesh[]): { 
    target: { position: THREE.Vector3, placementPosition: THREE.Vector3 } | null,
    debug: {
      cameraPosition: THREE.Vector3,
      rayDirection: THREE.Vector3,
      intersections: number
    }
  } {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = this.raycaster.intersectObjects(blockMeshes, false);

    const debug = {
      cameraPosition: this.camera.position.clone(),
      rayDirection: this.raycaster.ray.direction.clone(),
      intersections: intersects.length
    };

    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      const normal = intersects[0].face?.normal;

      if (normal) {
        const blockPosition = new THREE.Vector3().copy(intersects[0].object.position);
        const placementPosition = blockPosition.clone().add(normal);

        return {
          target: { position: blockPosition, placementPosition: placementPosition },
          debug
        };
      }
    }

    return { target: null, debug };
  }

  setSelectedBlockType(blockType: BlockType) {
    this.selectedBlockType = blockType;
  }

  getSelectedBlockType(): BlockType {
    return this.selectedBlockType;
  }
}