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

  getTargetBlock(blockMeshes: THREE.Mesh[], mouse: THREE.Vector2): { 
    target: { position: THREE.Vector3, normal: THREE.Vector3 } | null,
    debug: {
      cameraPosition: THREE.Vector3,
      rayDirection: THREE.Vector3,
      intersections: number,
      firstIntersection?: THREE.Intersection
    }
  } {
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(blockMeshes, false);

    const debug = {
      cameraPosition: this.camera.position.clone(),
      rayDirection: this.raycaster.ray.direction.clone(),
      intersections: intersects.length,
      firstIntersection: intersects[0]
    };

    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      const normal = intersects[0].face?.normal;

      if (normal) {
        const blockPosition = new THREE.Vector3()
          .copy(intersectionPoint)
          .sub(normal.multiplyScalar(0.5))
          .floor();

        return {
          target: { position: blockPosition, normal: normal },
          debug
        };
      }
    }

    return { target: null, debug };
  }
}