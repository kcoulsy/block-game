import './style.css'
import * as THREE from 'three';
import { World } from './World';
import { Player } from './Player';
import { Controls } from './Controls';
import { BlockType, CHUNK_SIZE } from './config';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new World(scene);
const player = new Player(camera);
const controls = new Controls(player, renderer.domElement);

// Create debug display
const debugDisplay = document.createElement('div');
debugDisplay.style.position = 'absolute';
debugDisplay.style.top = '10px';
debugDisplay.style.left = '10px';
debugDisplay.style.color = 'white';
debugDisplay.style.fontFamily = 'monospace';
debugDisplay.style.fontSize = '14px';
debugDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
debugDisplay.style.padding = '5px';
document.body.appendChild(debugDisplay);

// Create crosshair
const crosshair = document.createElement('div');
crosshair.style.position = 'absolute';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.width = '20px';
crosshair.style.height = '20px';
crosshair.style.backgroundColor = 'transparent';
crosshair.style.border = '2px solid white';
crosshair.style.borderRadius = '50%';
crosshair.style.transform = 'translate(-50%, -50%)';
crosshair.style.pointerEvents = 'none';
document.body.appendChild(crosshair);

function onMouseMove(event: MouseEvent) {
  // Calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

function onMouseClick(event: MouseEvent) {
  const { target: targetBlock } = player.getTargetBlock(world.blockMeshes);
  if (targetBlock) {
    if (event.button === 0) { // Left click
      world.placeBlock(targetBlock.placementPosition, BlockType.DIRT);
    } else if (event.button === 2) { // Right click
      world.removeBlock(targetBlock.position);
    }
  }
}

window.addEventListener('click', onMouseClick, false);
window.addEventListener('contextmenu', (e) => {
  e.preventDefault(); // Prevent the default context menu
  onMouseClick(e);
}, false);

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Update placeholder block position
  const { target: targetBlock, debug } = player.getTargetBlock(world.blockMeshes);
  world.updatePlaceholderBlock(targetBlock);

  // Update debug display
  debugDisplay.textContent = `Camera Position: (${debug.cameraPosition.x.toFixed(2)}x, ${debug.cameraPosition.y.toFixed(2)}y, ${debug.cameraPosition.z.toFixed(2)}z)
Ray Direction: (${debug.rayDirection.x.toFixed(2)}x, ${debug.rayDirection.y.toFixed(2)}y, ${debug.rayDirection.z.toFixed(2)}z)
Intersections: ${debug.intersections}
${targetBlock 
  ? `Target Block:
    Position: (${targetBlock.position.x.toFixed(2)}x, ${targetBlock.position.y.toFixed(2)}y, ${targetBlock.position.z.toFixed(2)}z)
    Placement: (${targetBlock.placementPosition.x.toFixed(2)}x, ${targetBlock.placementPosition.y.toFixed(2)}y, ${targetBlock.placementPosition.z.toFixed(2)}z)`
  : 'No block targeted'}`;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
