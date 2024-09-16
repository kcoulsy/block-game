import * as THREE from 'three';
import { BlockType, CHUNK_SIZE, BLOCK_COLORS } from './config';

type Chunk = BlockType[][][];

export class World {
  private scene: THREE.Scene;
  private chunks: Map<string, Chunk> = new Map();
  private placeholderBlock: THREE.LineSegments;
  public blockMeshes: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.placeholderBlock = new THREE.LineSegments();
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
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

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
            
            // Add edges to the cube
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            cube.add(edges);

            this.scene.add(cube);
            this.blockMeshes.push(cube);
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

  updatePlaceholderBlock(targetBlock: { position: THREE.Vector3, placementPosition: THREE.Vector3 } | null) {
    if (targetBlock && this.isValidPlacement(targetBlock.placementPosition)) {
      this.placeholderBlock.position.copy(targetBlock.placementPosition);
      this.placeholderBlock.visible = true;
    } else {
      this.placeholderBlock.visible = false;
    }
  }

  placeBlock(position: THREE.Vector3, blockType: BlockType) {
    if (!this.isValidPlacement(position)) return;

    const chunkX = Math.floor(position.x / CHUNK_SIZE.WIDTH);
    const chunkZ = Math.floor(position.z / CHUNK_SIZE.DEPTH);
    const chunkKey = `${chunkX},${chunkZ}`;

    let chunk = this.chunks.get(chunkKey);
    if (!chunk) {
      chunk = this.generateChunk(chunkX, chunkZ);
      this.chunks.set(chunkKey, chunk);
    }

    const localX = Math.floor(position.x) % CHUNK_SIZE.WIDTH;
    const localY = Math.floor(position.y);
    const localZ = Math.floor(position.z) % CHUNK_SIZE.DEPTH;

    chunk[localX][localZ][localY] = blockType;
    this.renderSingleBlock(chunkX, chunkZ, localX, localY, localZ, blockType);
  }

  private renderSingleBlock(chunkX: number, chunkZ: number, x: number, y: number, z: number, blockType: BlockType) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: BLOCK_COLORS[blockType] });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      chunkX * CHUNK_SIZE.WIDTH + x,
      y,
      chunkZ * CHUNK_SIZE.DEPTH + z
    );

    // Add edges to the cube
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cube.add(edges);

    this.scene.add(cube);
    this.blockMeshes.push(cube);
  }

  private isValidPlacement(position: THREE.Vector3): boolean {
    const chunkX = Math.floor(position.x / CHUNK_SIZE.WIDTH);
    const chunkZ = Math.floor(position.z / CHUNK_SIZE.DEPTH);
    const chunkKey = `${chunkX},${chunkZ}`;

    const chunk = this.chunks.get(chunkKey);
    if (!chunk) return true; // Allow placement in new chunks

    const localX = Math.floor(position.x) % CHUNK_SIZE.WIDTH;
    const localY = Math.floor(position.y);
    const localZ = Math.floor(position.z) % CHUNK_SIZE.DEPTH;

    return localX >= 0 && localX < CHUNK_SIZE.WIDTH &&
           localY >= 0 && localY < CHUNK_SIZE.HEIGHT &&
           localZ >= 0 && localZ < CHUNK_SIZE.DEPTH &&
           chunk[localX][localZ][localY] === BlockType.AIR;
  }

  removeBlock(position: THREE.Vector3) {
    const chunkX = Math.floor(position.x / CHUNK_SIZE.WIDTH);
    const chunkZ = Math.floor(position.z / CHUNK_SIZE.DEPTH);
    const chunkKey = `${chunkX},${chunkZ}`;

    const chunk = this.chunks.get(chunkKey);
    if (!chunk) return; // Block is not in any existing chunk

    const localX = Math.floor(position.x) % CHUNK_SIZE.WIDTH;
    const localY = Math.floor(position.y);
    const localZ = Math.floor(position.z) % CHUNK_SIZE.DEPTH;

    if (localX >= 0 && localX < CHUNK_SIZE.WIDTH &&
        localY >= 0 && localY < CHUNK_SIZE.HEIGHT &&
        localZ >= 0 && localZ < CHUNK_SIZE.DEPTH) {
      chunk[localX][localZ][localY] = BlockType.AIR;
      this.removeBlockMesh(position);
    }
  }

  private removeBlockMesh(position: THREE.Vector3) {
    const blockMesh = this.blockMeshes.find(mesh => 
      mesh.position.x === position.x &&
      mesh.position.y === position.y &&
      mesh.position.z === position.z
    );

    if (blockMesh) {
      this.scene.remove(blockMesh);
      this.blockMeshes = this.blockMeshes.filter(mesh => mesh !== blockMesh);
    }
  }
}