import * as THREE from 'three';

export function createWetPavementMaterial() {
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
    uniform vec3 uSunDirection;
    uniform vec3 uSunColor;
    uniform vec3 uNeonColor;
    uniform float uTime;

    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    // Procedural noise for asphalt grain & puddles
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      // Scale coordinates
      vec2 uvCoords = vWorldPosition.xz * 0.4;
      float grain = noise(uvCoords * 20.0) * 0.15;
      float puddleNoise = noise(uvCoords * 1.5);
      float isPuddle = smoothstep(0.42, 0.58, puddleNoise);

      // Asphalt base color: dark charcoal, darker inside puddles
      vec3 dryAsphalt = vec3(0.08, 0.085, 0.09) + grain;
      vec3 wetAsphalt = vec3(0.02, 0.025, 0.03);
      vec3 surfaceColor = mix(dryAsphalt, wetAsphalt, isPuddle * 0.8 + 0.2);

      // Normal perturbance for grain vs mirror flat puddles
      vec3 N = vNormal;
      if (isPuddle < 0.5) {
        N.x += (noise(uvCoords * 30.0) - 0.5) * 0.08;
        N.z += (noise(uvCoords * 30.0 + 10.0) - 0.5) * 0.08;
        N = normalize(N);
      }

      // Fresnel reflection
      vec3 V = normalize(cameraPosition - vWorldPosition);
      float NdotV = max(0.0, dot(N, V));
      float fresnel = 0.04 + 0.96 * pow(1.0 - NdotV, 5.0);

      // Specular reflections: Golden-hour sun reflection
      vec3 L = normalize(uSunDirection);
      vec3 H = normalize(L + V);
      float NdotH = max(0.0, dot(N, H));
      float roughness = mix(0.65, 0.05, isPuddle);
      float specPower = mix(14.0, 320.0, isPuddle);
      float sunSpec = pow(NdotH, specPower) * (isPuddle * 4.2 + 0.35);

      // Cool teal ambient shadows & 3200K Planckian amber highlights
      vec3 coolTealShadow = vec3(0.02, 0.08, 0.12);
      vec3 warmAmberHighlight = vec3(1.0, 0.68, 0.32);

      // Ambient sky reflection: teal in shadows, warm amber toward horizon
      vec3 skyReflectColor = mix(vec3(0.04, 0.15, 0.22), warmAmberHighlight * 0.95, pow(1.0 - V.y, 2.4));
      vec3 reflections = skyReflectColor * fresnel * (isPuddle * 2.2 + 0.35);
      reflections += warmAmberHighlight * sunSpec * 1.5;

      // Puddle edge wetness darkening with cool teal ambient tint
      surfaceColor = mix(surfaceColor, coolTealShadow, (1.0 - isPuddle) * 0.35);

      // Subtle neon signs reflection along street
      float neonFlicker = sin(vWorldPosition.z * 0.2 + uTime * 3.0) * 0.5 + 0.5;
      vec3 neonReflect = uNeonColor * pow(max(0.0, sin(vWorldPosition.x * 0.15)), 4.0) * isPuddle * 0.65 * neonFlicker;

      vec3 finalColor = surfaceColor + reflections + neonReflect;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSunDirection: { value: new THREE.Vector3(0.8, 0.3, -0.5).normalize() },
      uSunColor: { value: new THREE.Color(0xffaa52) }, // 3200K warm amber
      uNeonColor: { value: new THREE.Color(0x00e5ff) },
      uTime: { value: 0 }
    }
  });
}
