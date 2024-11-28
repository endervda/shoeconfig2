import * as THREE from 'three';
import './style.css';

// gsap
import gsap from 'gsap';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// GLTFLoader
const loader = new GLTFLoader();

loader.load( 'public/models/untitled.glb', function ( gltf ) {
	// change material to standard white (.traverse)
	gltf.scene.traverse((child) => {
		if (child.isMesh) {
			child.material = new THREE.MeshStandardMaterial({ 
				color: 0xffffff,
			});
		}
	});
	// log the names of all objects in the model
	gltf.scene.traverse((child) => {
		console.log(child.name);
	});
	// rotate model 90 degrees
	gltf.scene.rotation.y = Math.PI / 2;
	// scale 0.01
	gltf.scene.scale.set(15, 15, 15);
	// move down y
	scene.add( gltf.scene );
  }
);

camera.position.z = 5;
console.log(camera.position);

// load cubemap
const loaderCube = new THREE.CubeTextureLoader();
const texture = loaderCube.load([
	'public/textures/px.png',
	'public/textures/nx.png',
	'public/textures/py.png',
	'public/textures/ny.png',
	'public/textures/pz.png',
	'public/textures/nz.png',
]);
scene.background = texture;


// ray caster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = null;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


// OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { emissive } from 'three/webgpu';
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Disable left and right click controls
// Disable left and right click controls
controls.mouseButtons = {
    LEFT: null, // Disable left click
    MIDDLE: null,
    RIGHT: null // Disable right click
};

// point light
const pointLight = new THREE.PointLight(0xffffff, 10);
pointLight.position.set(1, 2, 2);
scene.add(pointLight);

// Function to handle GSAP animation
function animateCustomization(partName) {
    let targetPosition = { z: 3, y: 1.5 }; // Default target position

    switch (partName) {
        case 'laces':
            targetPosition = { z: 3, y: 1.5 };
            break;
        case 'inside':
            targetPosition = { z: 2.5, y: 1.2 };
            break;
        case 'outside_1':
            targetPosition = { z: 2.8, y: 1.3 };
            break;
        case 'outside_2':
            targetPosition = { z: 2.9, y: 1.4 };
            break;
        case 'outside_3':
            targetPosition = { z: 3.1, y: 1.6 };
            break;
        case 'sole_bottom':
            targetPosition = { z: 3.2, y: 1.7 };
            break;
        case 'sole_top':
            targetPosition = { z: 3.3, y: 1.8 };
            break;
    }

    gsap.to(camera.position, { 
        z: targetPosition.z, 
        y: targetPosition.y,
        duration: 1 
    });

    gsap.to(".colors", {
        bottom: 0,
        duration: 1
    });
}

// Mouse click event
window.addEventListener('click', (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const firstIntersect = intersects[0];

    if (firstIntersect) {
        const partName = firstIntersect.object.name;
        const parts = ['laces', 'inside', 'outside_1', 'outside_2', 'outside_3', 'sole_bottom', 'sole_top'];

        if (parts.includes(partName)) {
            currentIntersect = firstIntersect;
            animateCustomization(partName);
        }
    } else {
        // Reset camera position if no object is clicked
        gsap.to(camera.position, { 
            x: 0, 
            y: 0, 
            z: 5, 
            duration: 1 
        });
		// hide color menu
		gsap.to(".colors", {
			bottom: -100,
			duration: 1
		});
    }
});

// Hover effect
let previousIntersect = null;

function handleHover() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const partName = firstIntersect.object.name;
        const parts = ['laces', 'inside', 'outside_1', 'outside_2', 'outside_3', 'sole_bottom', 'sole_top'];

        if (parts.includes(partName)) {
            if (previousIntersect && previousIntersect !== firstIntersect.object) {
                previousIntersect.material.emissive.set(0x000000); // Reset previous intersect emissive color
            }
            firstIntersect.object.material.emissive.set(0xff0000); // Set hover emissive color to reddish
            previousIntersect = firstIntersect.object;
        }
    } else {
        if (previousIntersect) {
            previousIntersect.material.emissive.set(0x000000); // Reset previous intersect emissive color
            previousIntersect = null;
        }
    }
}

// Mouse move event
window.addEventListener('mousemove', (event) => {	
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// if .orderBtn is pressed alert('Order placed') in the alert show all of the parts that have been customized with their colors
document.querySelector('.orderBtn').addEventListener('click', () => {
	const parts = ['laces', 'inside', 'outside_1', 'outside_2', 'outside_3', 'sole_bottom', 'sole_top'];
	let customizedParts = [];

	parts.forEach((part) => {
		scene.traverse((child) => {
			if (child.isMesh && child.name === part) {
				customizedParts.push({
					part: child.name,
					color: child.material.color.getHexString()
				});
			}
		});
	});

	let message = 'Order placed!\n';
	customizedParts.forEach((customizedPart) => {
		message += `${customizedPart.part}: ${customizedPart.color}\n`;
	});

	alert(message);
});




// Color menu click event
document.querySelectorAll('.color').forEach((color) => {
    color.addEventListener('click', (event) => {
        const dataColor = event.target.getAttribute('data-color');
        if (currentIntersect) {
            currentIntersect.object.material.color.set(dataColor);
            currentIntersect.object.material.metalness = 0.2;
            currentIntersect.object.material.roughness = 0.2;
        }
    });
});

// Animation loop
function animate() {
    controls.update();
    handleHover();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Log the camera position on startup
console.log(camera.position);