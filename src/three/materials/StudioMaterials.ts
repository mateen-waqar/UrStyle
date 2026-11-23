import * as THREE from "three";

export const StudioMannequinMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#e2d6cc"),
  roughness: 0.65,
  metalness: 0.05,
});

export const StudioFloorMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#161514"),
  roughness: 0.85,
  metalness: 0.1,
});

export function createGarmentMaterial(color: string, roughness = 0.7, metalness = 0.1) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
  });
}
