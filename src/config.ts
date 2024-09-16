export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  // Add more block types as needed
}

export const CHUNK_SIZE = {
  WIDTH: 16,
  HEIGHT: 50,
  DEPTH: 16,
};

export const BLOCK_COLORS = {
  [BlockType.AIR]: 0x000000,    // Transparent
  [BlockType.GRASS]: 0x00FF00,  // Green
  [BlockType.DIRT]: 0x8B4513,   // Brown
  [BlockType.STONE]: 0x808080,  // Gray
  [BlockType.WOOD]: 0x8B4513,   // Brown
  [BlockType.LEAVES]: 0x00FF00, // Green
  // Add colors for new block types
};