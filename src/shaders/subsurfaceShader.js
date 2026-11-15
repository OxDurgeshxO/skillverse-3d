import * as THREE from 'three';

/**
 * Sub-Surface Scattering & Biological Skin Shader Material
 * Simulates soft subsurface light penetration through skin tissue (ears, hands, face)
 * and technical weave fabric of the explorer's parka.
 */
export function createSubsurfaceMaterial(baseColorHex, sssColorHex = 0xff7b61, roughness = 0.55) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: baseColorHex,
    roughness: roughness,
    metalness: 0.1,
    transmission: 0.22,      // Light enters surface
    thickness: 0.45,         // Depth of scattering layer
    attenuationColor: new THREE.Color(sssColorHex), // Warm reddish-orange subcutaneous scattering
    attenuationDistance: 0.65,
    clearcoat: 0.15,
    clearcoatRoughness: 0.4
  });

  return mat;
}

/**
 * Polycarbonate Crystalline Visor Shader with Internal Refraction & SSS
 */
export function createVisorMaterial(tintColorHex = 0x09090b, transmission = 0.6) {
  return new THREE.MeshPhysicalMaterial({
    color: tintColorHex,
    roughness: 0.05,
    metalness: 0.85,
    transmission: transmission,
    ior: 1.58,              // Refractive index of optical polycarbonate
    thickness: 0.5,
    attenuationColor: new THREE.Color(0x38bdf8),
    attenuationDistance: 0.8,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });
}
