import * as THREE from 'three';
import { Player } from './Player';

export class Controls {
  private player: Player;
  private keys: { [key: string]: boolean } = {};
  private pitch: number = 0;
  private yaw: number = 0;
  private sensitivity: number = 0.002;

  constructor(player: Player, domElement: HTMLElement) {
    this.player = player;
    this.setupEventListeners(domElement);
  }

  private setupEventListeners(domElement: HTMLElement) {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    domElement.requestPointerLock = domElement.requestPointerLock || (domElement as any).mozRequestPointerLock;
    domElement.onclick = () => domElement.requestPointerLock();
  }

  private onKeyDown(e: KeyboardEvent) {
    this.keys[e.code] = true;
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
  }

  private onMouseMove(e: MouseEvent) {
    if (document.pointerLockElement === e.target) {
      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }
  }

  update() {
    const moveSpeed = 0.1;
    const direction = new THREE.Vector3();

    if (this.keys['KeyW']) direction.z -= 1;
    if (this.keys['KeyS']) direction.z += 1;
    if (this.keys['KeyA']) direction.x -= 1;
    if (this.keys['KeyD']) direction.x += 1;
    if (this.keys['Space']) direction.y += 1;
    if (this.keys['ShiftLeft']) direction.y -= 1;

    direction.normalize().multiplyScalar(moveSpeed);

    // Create a quaternion for the pitch rotation (around X-axis)
    const pitchQuaternion = new THREE.Quaternion();
    pitchQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);

    // Create a quaternion for the yaw rotation (around Y-axis)
    const yawQuaternion = new THREE.Quaternion();
    yawQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    // Combine the rotations
    const combinedQuaternion = new THREE.Quaternion();
    combinedQuaternion.multiplyQuaternions(yawQuaternion, pitchQuaternion);

    // Apply the rotation to the direction vector
    direction.applyQuaternion(yawQuaternion);

    this.player.move(direction.x, direction.y, direction.z);
    this.player.setRotation(combinedQuaternion);
  }
}