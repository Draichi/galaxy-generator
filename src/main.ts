import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

interface GalaxyGenerator {
  numberOfParticles: number;
  size: number;
  radius: number;
  branches: number;
  spin: number;
  randomness: number;
  randomnessPower: number;
}

const gui = new GUI();

const canvas = document.querySelector("canvas#webgl") as HTMLElement;

const scene = new THREE.Scene();

let material: THREE.PointsMaterial;
let geometry: THREE.BufferGeometry;
let points: THREE.Points;

const galaxyGenerator = ({
  numberOfParticles,
  size,
  radius,
  branches,
  spin,
  randomness,
  randomnessPower,
}: GalaxyGenerator) => {
  if (points) {
    material.dispose();
    geometry.dispose();
    scene.remove(points);
  }
  geometry = new THREE.BufferGeometry();
  const numberOfDimensions = 3; // x, y, z
  const positions = new Float32Array(numberOfParticles * numberOfDimensions);

  for (let i = 0; i < numberOfParticles; i++) {
    const x = i * numberOfDimensions;
    const y = x + 1;
    const z = x + 2;
    const particleRadius = Math.random() * radius;
    const spinAngle = particleRadius * spin;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? -1 : 1);
    const randomY =
      Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? -1 : 1);
    const randomZ =
      Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? -1 : 1);

    positions[x] = Math.cos(branchAngle + spinAngle) * particleRadius + randomX;
    positions[y] = randomY;
    positions[z] = Math.sin(branchAngle + spinAngle) * particleRadius + randomZ;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};
const galaxyParams: GalaxyGenerator = {
  numberOfParticles: 1000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.02,
  randomnessPower: 3,
};
galaxyGenerator(galaxyParams);

gui
  .add(galaxyParams, "numberOfParticles")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(() => galaxyGenerator(galaxyParams));
gui
  .add(galaxyParams, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(() => galaxyGenerator(galaxyParams));
gui
  .add(galaxyParams, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(() => galaxyGenerator(galaxyParams));
gui
  .add(galaxyParams, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(() => galaxyGenerator(galaxyParams));
gui
  .add(galaxyParams, "spin")
  .min(-5)
  .max(5)
  .step(0.01)
  .onFinishChange(() => galaxyGenerator(galaxyParams));
gui
  .add(galaxyParams, "randomness")
  .min(0)
  .max(2)
  .step(0.01)
  .onFinishChange(() => galaxyGenerator(galaxyParams));
gui
  .add(galaxyParams, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(() => galaxyGenerator(galaxyParams));

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  1,
  100
);
camera.position.set(3, 5, 10);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const tick = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
