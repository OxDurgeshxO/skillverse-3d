import * as THREE from 'three';

export function createCircuitVeinMaterial(veinColorHex = 0x00d4ff, baseColorHex = 0x0b0e14) {
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = `
    uniform vec3 uVeinColor;
    uniform vec3 uBaseColor;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      // Circuit grid pattern
      vec2 grid = fract(vUv * 16.0);
      float lineX = step(0.92, grid.x) + step(grid.x, 0.08);
      float lineY = step(0.92, grid.y) + step(grid.y, 0.08);
      float circuit = clamp(lineX + lineY, 0.0, 1.0);

      // Pulse along circuits
      float pulse = sin(vUv.x * 20.0 + vUv.y * 20.0 - uTime * 4.0) * 0.5 + 0.5;
      pulse = pow(pulse, 4.0);

      // Fresnel rim
      vec3 V = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, V)), 2.0);

      vec3 emissive = uVeinColor * circuit * (1.2 + pulse * 2.5);
      vec3 finalColor = uBaseColor + emissive + uVeinColor * fresnel * 0.4;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uVeinColor: { value: new THREE.Color(veinColorHex) },
      uBaseColor: { value: new THREE.Color(baseColorHex) },
      uTime: { value: 0 }
    }
  });
}
