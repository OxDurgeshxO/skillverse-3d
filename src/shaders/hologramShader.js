import * as THREE from 'three';

export function createHologramMaterial(baseColorHex = 0x00e5ff) {
  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uOpacity;

    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Horizontal scanlines
      float scanline = sin(vUv.y * 120.0 + uTime * 6.0) * 0.5 + 0.5;
      scanline = pow(scanline, 1.5);

      // Vertical data flow
      float dataGrid = sin(vUv.x * 40.0) * sin(vUv.y * 30.0 - uTime * 2.0);
      dataGrid = step(0.3, dataGrid) * 0.3;

      // Fresnel edge glow
      vec3 V = normalize(cameraPosition - vWorldPosition);
      float fresnel = 1.0 - max(0.0, dot(vNormal, V));
      fresnel = pow(fresnel, 2.5);

      // Chromatic aberration fringe
      vec3 col = uColor;
      col.r += sin(vUv.y * 80.0 + uTime) * 0.1;
      col.b += cos(vUv.y * 80.0 - uTime) * 0.1;

      float alpha = (fresnel * 0.8 + scanline * 0.35 + dataGrid + 0.15) * uOpacity;

      gl_FragColor = vec4(col * (1.2 + fresnel * 1.5), clamp(alpha, 0.0, 0.95));
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(baseColorHex) },
      uTime: { value: 0 },
      uOpacity: { value: 0.85 }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
}
