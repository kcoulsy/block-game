import * as THREE from 'three';
import { BlockType, CHUNK_SIZE, BLOCK_COLORS } from './config';

type Chunk = BlockType[][][];

export class World {
  private scene: THREE.Scene;
  private chunks: Map<string, Chunk> = new Map();
  private placeholderBlock: THREE.LineSegments;
  public blockMeshes: THREE.Mesh[] = []; // Add this line

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.placeholderBlock = new THREE.LineSegments(); // Initialize here
    this.generateTerrain();
    this.createPlaceholderBlock();
  }

  private generateTerrain() {
    // Generate a single chunk for now
    const chunkX = 0;
    const chunkZ = 0;
    const chunk = this.generateChunk(chunkX, chunkZ);
    this.chunks.set(`${chunkX},${chunkZ}`, chunk);
    this.renderChunk(chunkX, chunkZ, chunk);
  }

  private generateChunk(chunkX: number, chunkZ: number): Chunk {
    const chunk: Chunk = [];

    for (let x = 0; x < CHUNK_SIZE.WIDTH; x++) {
      chunk[x] = [];
      for (let z = 0; z < CHUNK_SIZE.DEPTH; z++) {
        chunk[x][z] = [];
        for (let y = 0; y < CHUNK_SIZE.HEIGHT; y++) {
          if (y < 10) {
            chunk[x][z][y] = BlockType.STONE;
          } else if (y < 15) {
            chunk[x][z][y] = BlockType.DIRT;
          } else if (y === 15) {
            chunk[x][z][y] = BlockType.GRASS;
          } else {
            chunk[x][z][y] = BlockType.AIR;
          }
        }
      }
    }

    return chunk;
  }

  private renderChunk(chunkX: number, chunkZ: number, chunk: Chunk) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    for (let x = 0; x < CHUNK_SIZE.WIDTH; x++) {
      for (let z = 0; z < CHUNK_SIZE.DEPTH; z++) {
        for (let y = 0; y < CHUNK_SIZE.HEIGHT; y++) {
          const blockType = chunk[x][z][y];
          if (blockType !== BlockType.AIR) {
            const material = new THREE.MeshBasicMaterial({ color: BLOCK_COLORS[blockType] });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
              chunkX * CHUNK_SIZE.WIDTH + x,
              y,
              chunkZ * CHUNK_SIZE.DEPTH + z
            );
            this.scene.add(cube);
            this.blockMeshes.push(cube); // Add this line
          }
        }
      }
    }
  }

  private createPlaceholderBlock() {
    const geometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    this.placeholderBlock = new THREE.LineSegments(edges, material);
    this.placeholderBlock.visible = false;
    this.scene.add(this.placeholderBlock);
  }

  updatePlaceholderBlock(targetBlock: { position: THREE.Vector3, normal: THREE.Vector3 } | null) {
    if (targetBlock) {
      const { position, normal } = targetBlock;
      const placeholderPosition = position.clone().add(normal).add(new THREE.Vector3(0.5, 0.5, 0.5));
      this.placeholderBlock.position.copy(placeholderPosition);
      this.placeholderBlock.visible = true;
    } else {
      this.placeholderBlock.visible = false;
    }
  }
}