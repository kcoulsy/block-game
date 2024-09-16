import './style.css'
import * as THREE from 'three';
import { World } from './World';
import { Player } from './Player';
import { Controls } from './Controls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new World(scene);
const player = new Player(camera);
const controls = new Controls(player);

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

const mouse = new THREE.Vector2();

function onMouseMove(event: MouseEvent) {
  // Calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Update placeholder block position
  const { target: targetBlock, debug } = player.getTargetBlock(world.blockMeshes, mouse);
  world.updatePlaceholderBlock(targetBlock);

  // Update debug display
  debugDisplay.textContent = `Camera Position: (${debug.cameraPosition.x.toFixed(2)}, ${debug.cameraPosition.y.toFixed(2)}, ${debug.cameraPosition.z.toFixed(2)})
Ray Direction: (${debug.rayDirection.x.toFixed(2)}, ${debug.rayDirection.y.toFixed(2)}, ${debug.rayDirection.z.toFixed(2)})
Intersections: ${debug.intersections}
${targetBlock 
  ? `Target Block:
    Position: (${targetBlock.position.x.toFixed(2)}, ${targetBlock.position.y.toFixed(2)}, ${targetBlock.position.z.toFixed(2)})
    Normal: (${targetBlock.normal.x.toFixed(2)}, ${targetBlock.normal.y.toFixed(2)}, ${targetBlock.normal.z.toFixed(2)})`
  : 'No block targeted'}`;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
