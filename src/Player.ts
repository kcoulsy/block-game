import * as THREE from 'three';
import { CHUNK_SIZE } from './config';

export class Player {
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.camera.position.set(8, 17, 8);
    this.raycaster = new THREE.Raycaster();
  }

  move(x: number, y: number, z: number) {
    this.camera.position.x += x;
    this.camera.position.y += y;
    this.camera.position.z += z;
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
}