import { Player } from './Player';

export class Controls {
  private player: Player;
  private keys: { [key: string]: boolean } = {};

  constructor(player: Player) {
    this.player = player;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent) {
    this.keys[e.code] = true;
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
  }

  update() {
    const moveSpeed = 0.1;

    if (this.keys['KeyW']) this.player.move(0, 0, -moveSpeed);
    if (this.keys['KeyS']) this.player.move(0, 0, moveSpeed);
    if (this.keys['KeyA']) this.player.move(-moveSpeed, 0, 0);
    if (this.keys['KeyD']) this.player.move(moveSpeed, 0, 0);
    if (this.keys['Space']) this.player.move(0, moveSpeed, 0);
    if (this.keys['ShiftLeft']) this.player.move(0, -moveSpeed, 0);
  }
}