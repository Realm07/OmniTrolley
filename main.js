import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let mouseDownPosition = null;
let newTexture;
let originalTexture;

newTexture = new THREE.TextureLoader().load('/public/arcade2/textures/newTexture.jpg', (texture) => {
  texture.flipY = false;
});
originalTexture = new THREE.TextureLoader().load('/public/arcade2/textures/Untitled1.jpg', (texture) => {
  texture.flipY = false;
});

function updateTexture(mesh) {
  if (mesh === buttonMeshFwd) {
    // Update with new texture
    screenMesh.material.map = newTexture;
  } else if (mesh === buttonMeshBack) {
    // Revert to original texture
    screenMesh.material.map = originalTexture;
  } else {
    // Ignore other meshes
    return;
  }
  screenMesh.material.needsUpdate = true;
}
const onMouseDown = (event) => {
  mouseDownPosition = {
    x: event.clientX,
    y: event.clientY,
  };

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

const onMouseUp = (event) => {
  const mouseUpPosition = {
    x: event.clientX,
    y: event.clientY,
  };

  const positionDelta = {
    x: mouseUpPosition.x - mouseDownPosition.x,
    y: mouseUpPosition.y - mouseDownPosition.y,
  };

  const threshold = 20; // Set the threshold here (e.g., 20 pixels)
  const isSignificantMovement = Math.abs(positionDelta.x) > threshold || Math.abs(positionDelta.y) > threshold;
//'D:/Work/Website 2/public/arcade2/textures/
  if (!isSignificantMovement) 
{
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      for (const intersect of intersects) {
        const mesh = intersect.object;
        console.log(`Mesh name: ${mesh.name}`);
        if (mesh === buttonMeshFwd || mesh === buttonMeshBack) {
          updateTexture(mesh);
          break; // Stop iterating after handling Fwd or Back
        }
        // Log the mesh's children
        if (mesh.children.length > 0) {
          for (const child of mesh.children) {
            console.log(`  Child name: ${child.name}`);
          }
        }
    
        // Break out of the loop after logging the first mesh
        break;
      }
    }
};
}

window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(15, 5, 0);

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.3,
  0.1,
  0.1
);
composer.addPass(bloomPass);

renderer.outputColorSpace = THREE.SRGBColorSpace;
let buttonMeshFwd = null;
let buttonMeshBack = null;
let screenMesh = null;

const loader = new GLTFLoader().setPath('public/OmniTrolley/');
loader.load('scene.gltf', (gltf) => {
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    // Set casting and receiving shadows for all meshes
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = true;
    }
  });

  // Log the name of all meshes
  mesh.traverse((child) => {
    if (child.isMesh && child.name) {
      console.log(`Mesh name: ${child.name}`);

      // Check the name and perform actions
      if (child.name === 'butFwd') {
        console.log(`Found mesh "butFwd":`);
        buttonMeshFwd = child;
      } else if (child.name === 'screen') {
        console.log(`Found mesh "screen":`);
        screenMesh = child;
        screenMesh.material.map = originalTexture;
      } else if (child.name === 'butBack') {
        console.log(`Found mesh "butBack":`);
        buttonMeshBack = child;
        
    }
}});

  // Set the scene's position and add it to the scene
  mesh.position.set(0, 0.1, 0);
  mesh.rotation.set(0, 0, 0);
  mesh.scale.set(0.7, 0.7, 0.7);
  scene.add(mesh);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  document.getElementById('progress').innerHTML = `LOADING ${Math.max(xhr.loaded / xhr.total, 1) * 100}/100`;
});


// Create GridHelper
/*const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.position.set(0, 0, 0); // Place the grid at the origin
scene.add(gridHelper);

// Create AxesHelper
const axesHelper = new THREE.AxesHelper(5);
axesHelper.position.set(0, 0, 0); // Place the axes at the origin
scene.add(axesHelper);*/


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Remove unused controls
// window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.minDistance = 4;
controls.maxDistance = 200;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.75;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 3, 0);
controls.update();

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;
controls2.zoomSpeed = 0.3;

const groundGeometry = new THREE.PlaneGeometry(40, 40, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);

// Define material properties in a separate object
const groundMaterialProperties = {
  color: 0x555555,
  side: THREE.DoubleSide
};
const groundMaterial = new THREE.MeshStandardMaterial(groundMaterialProperties);

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

for (let i = 0; i < 5; i++) {
  const spotLight = new THREE.SpotLight(0xffffff, 1, 100, 0.22, 1);
  spotLight.castShadow = true;
  spotLight.shadow.bias = -0.0001;

  // Set positions based on their index
  switch (i) {
    case 0:
      spotLight.position.set(0, 25, 0);
      break;
    case 1:
      spotLight.position.set(-25, 25, 0);
      break;
    case 2:
      spotLight.position.set(0, 25, 25);
      break;
    case 3:
      spotLight.position.set(0, 25, -25);
      break;
    case 4:
      spotLight.position.set(10, 0, 15);
      spotLight.intensity = 0.45; // Adjust intensity for last light
      break;
  }

  scene.add(spotLight);
}


function animate() {
  requestAnimationFrame(animate);
  const target = controls.target;
  controls.update();
  controls2.target.set(target.x, target.y, target.z);
  controls2.update();
  // renderer.render(scene, camera);
  composer.render();
}

animate();

