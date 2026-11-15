import * as THREE from 'three';

export function createVolumetricCloudMaterial() {
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
    uniform vec3 uSkyColor;
    uniform float uTime;
    uniform float uCloudDensity;
    uniform float uCloudAltitude;

    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    // Simplex noise approximation
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float total = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        total += amp * snoise(p);
        p *= 2.05;
        amp *= 0.5;
      }
      return total;
    }

    void main() {
      vec2 uvCoords = vWorldPosition.xz * 0.0015 + vec2(uTime * 0.008, uTime * 0.004);
      float density = fbm(uvCoords);
      density = smoothstep(-0.1, 0.6, density);

      // Height falloff
      float heightGradient = 1.0 - smoothstep(100.0, 450.0, abs(vWorldPosition.y - uCloudAltitude));
      float finalAlpha = density * heightGradient * uCloudDensity;

      // Phase scattering (Henyey-Greenstein approximation)
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float cosTheta = dot(viewDir, -uSunDirection);
      float g = 0.55; // Forward scatter
      float phase = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5) / (4.0 * 3.14159);

      // Golden-hour rim lighting
      vec3 sunScatter = uSunColor * phase * 2.8;
      vec3 ambientSky = uSkyColor * 0.8;
      vec3 cloudBaseColor = mix(ambientSky, sunScatter, smoothstep(0.0, 0.8, dot(vNormal, uSunDirection)));
      cloudBaseColor += vec3(1.0, 0.75, 0.5) * pow(max(0.0, dot(vNormal, uSunDirection)), 2.0) * 0.6;

      if (finalAlpha < 0.01) discard;

      gl_FragColor = vec4(cloudBaseColor, finalAlpha * 0.85);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSunDirection: { value: new THREE.Vector3(0.8, 0.3, -0.5).normalize() },
      uSunColor: { value: new THREE.Color(0xffa252) },
      uSkyColor: { value: new THREE.Color(0x386599) },
      uTime: { value: 0 },
      uCloudDensity: { value: 0.95 },
      uCloudAltitude: { value: 280.0 }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}
