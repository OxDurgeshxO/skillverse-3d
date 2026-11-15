import * as THREE from 'three';
import { PlanetTerrain } from './PlanetTerrain.js';
import { TransitNetwork } from './TransitNetwork.js';
import { TechCity } from './zones/TechCity.js';
import { AIResearchValley } from './zones/AIResearchValley.js';
import { CreativeArtDistrict } from './zones/CreativeArtDistrict.js';
import { MedicalCareCity } from './zones/MedicalCareCity.js';
import { EngineeringHarbor } from './zones/EngineeringHarbor.js';
import { GreenAgricultureFields } from './zones/GreenAgricultureFields.js';
import { AdventureMountains } from './zones/AdventureMountains.js';
import { OceanExplorationCoast } from './zones/OceanExplorationCoast.js';
import { SpaceLaunchBase } from './zones/SpaceLaunchBase.js';
import { AncientHistoryRuins } from './zones/AncientHistoryRuins.js';
import { SportsArena } from './zones/SportsArena.js';
import { GlobalLearningUniversity } from './zones/GlobalLearningUniversity.js';
import { createVolumetricCloudMaterial } from '../shaders/volumetricCloudShader.js';

export class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.zones = {};
    this.isNight = false;
    this.timeOfDay = 17.5; // Default: 17:30 (Golden hour)
    this.autoCycle = false;
    this.cycleSpeed = 0.2; // Hours per second if auto-cycle enabled
    this.festivalIntensity = 0.0;
    this.festivalPillars = [];

    this.initLighting();
    this.initCelestialAtmosphere();
    this.initTerrain();
    this.initClouds();
    this.initZones();
    this.initTransit();
    this.initFestivalPillars();
  }

  initLighting() {
    // Golden Hour Directional Sunlight (14° elevation, warm golden tone)
    this.sunLight = new THREE.DirectionalLight(0xffa756, 3.2);
    this.sunLight.position.set(350, 180, -220);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 1200;
    this.sunLight.shadow.camera.left = -160;
    this.sunLight.shadow.camera.right = 160;
    this.sunLight.shadow.camera.top = 160;
    this.sunLight.shadow.camera.bottom = -160;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Soft Sky & Ground Ambient Light
    this.hemiLight = new THREE.HemisphereLight(0x4778b0, 0x1a2e3b, 1.2);
    this.scene.add(this.hemiLight);

    // Warm Sunset Rim Light for skyscraper silhouettes
    this.rimLight = new THREE.DirectionalLight(0xf472b6, 0.8);
    this.rimLight.position.set(-400, 100, 300);
    this.scene.add(this.rimLight);

    // Atmospheric Mist Fog blending horizon into sky dome
    this.scene.fog = new THREE.FogExp2(0x28384d, 0.00075);
  }

  initCelestialAtmosphere() {
    // Inverted celestial sky dome (2600m radius) with realistic golden hour Rayleigh/Mie scattering
    const skyGeom = new THREE.SphereGeometry(2600, 32, 24);
    this.skyDomeMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunPos;
        uniform float uNightIntensity;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float y = max(0.0, dir.y);

          // Golden Hour: Zenith (twilight blue) -> Mid sky (soft azure) -> Horizon (golden sunset peach/amber)
          vec3 zenithDay = vec3(0.06, 0.12, 0.24);
          vec3 midSkyDay = vec3(0.22, 0.45, 0.72);
          vec3 horizonDay = vec3(0.98, 0.68, 0.35); // 3200K warm golden hour

          // Night Festival: Deep cosmic midnight indigo
          vec3 zenithNight = vec3(0.01, 0.02, 0.06);
          vec3 midSkyNight = vec3(0.02, 0.04, 0.12);
          vec3 horizonNight = vec3(0.05, 0.08, 0.18);

          vec3 zenith = mix(zenithDay, zenithNight, uNightIntensity);
          vec3 midSky = mix(midSkyDay, midSkyNight, uNightIntensity);
          vec3 horizon = mix(horizonDay, horizonNight, uNightIntensity);

          vec3 sky = mix(horizon, midSky, pow(y, 0.4));
          sky = mix(sky, zenith, pow(y, 1.4));

          // Sun disc & solar aureole glow (fades out at night)
          vec3 sunDir = normalize(uSunPos);
          float sunDot = max(0.0, dot(dir, sunDir));
          float sunGlow = pow(sunDot, 8.0) * 0.7 + pow(sunDot, 90.0) * 1.8;
          sky += vec3(1.0, 0.85, 0.55) * sunGlow * (1.0 - uNightIntensity);

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      uniforms: {
        uSunPos: { value: new THREE.Vector3(350, 180, -220) },
        uNightIntensity: { value: 0.0 }
      },
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(skyGeom, this.skyDomeMat);
    this.scene.add(this.skyDome);
  }

  initTerrain() {
    this.terrain = new PlanetTerrain(this.scene);
  }

  initClouds() {
    const cloudGeom = new THREE.PlaneGeometry(1400, 1400, 32, 32);
    cloudGeom.rotateX(-Math.PI / 2);
    this.cloudMaterial = createVolumetricCloudMaterial();
    this.cloudMesh = new THREE.Mesh(cloudGeom, this.cloudMaterial);
    this.cloudMesh.position.y = 280;
    this.scene.add(this.cloudMesh);
  }

  initZones() {
    this.zones.techCity = new TechCity(this.scene);
    this.zones.aiValley = new AIResearchValley(this.scene);
    this.zones.artDistrict = new CreativeArtDistrict(this.scene);
    this.zones.medicalCity = new MedicalCareCity(this.scene);
    this.zones.harbor = new EngineeringHarbor(this.scene);
    this.zones.agriculture = new GreenAgricultureFields(this.scene);
    this.zones.mountains = new AdventureMountains(this.scene);
    this.zones.ocean = new OceanExplorationCoast(this.scene);
    this.zones.spaceBase = new SpaceLaunchBase(this.scene);
    this.zones.ruins = new AncientHistoryRuins(this.scene);
    this.zones.arena = new SportsArena(this.scene);
    this.zones.university = new GlobalLearningUniversity(this.scene);
  }

  initTransit() {
    this.transit = new TransitNetwork(this.scene);
  }

  initFestivalPillars() {
    // 8 Towering Volumetric Holographic Searchlights for Night Light Festival
    const pillarConfigs = [
      { x: -30, z: -30, color: 0x00f0ff },
      { x: 30, z: 25, color: 0xff007f },
      { x: 0, z: 45, color: 0x38bdf8 },
      { x: -120, z: 120, color: 0xec4899 },
      { x: -240, z: -160, color: 0xa855f7 },
      { x: 80, z: -120, color: 0x3b82f6 },
      { x: 130, z: 110, color: 0x10b981 },
      { x: 420, z: -260, color: 0xf59e0b }
    ];

    pillarConfigs.forEach((cfg, idx) => {
      const beamGeom = new THREE.CylinderGeometry(0.5, 6, 320, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(cfg.x, 160, cfg.z);
      this.scene.add(beam);
      this.festivalPillars.push({ mesh: beam, mat: beamMat, baseX: cfg.x, baseZ: cfg.z, idx });
    });
  }

  toggleFestival() {
    this.isNight = !this.isNight;
    this.timeOfDay = this.isNight ? 23.0 : 17.5;
    this.applyAstronomicalSun(this.timeOfDay);
    return this.isNight;
  }

  /**
   * Continuous 24-Hour Astronomical Day/Night Cycle
   * @param {number} hours - Time in hours [0.0 - 24.0]
   */
  setTimeOfDay(hours) {
    this.timeOfDay = Math.max(0, Math.min(24, hours));
    this.isNight = (this.timeOfDay < 5.5 || this.timeOfDay > 19.5);
    this.applyAstronomicalSun(this.timeOfDay);
  }

  applyAstronomicalSun(hours) {
    // Astronomical angle: 0h = midnight (-Z/nadir), 6h = dawn (+X), 12h = solar noon (+Y zenith), 18h = sunset (-X)
    const solarAngle = ((hours - 6.0) / 24.0) * Math.PI * 2.0;

    const sunDist = 520;
    const sunX = Math.cos(solarAngle) * sunDist;
    const sunY = Math.sin(solarAngle) * sunDist * 0.85;
    const sunZ = -Math.sin(solarAngle * 0.5) * 260;

    if (this.sunLight) {
      this.sunLight.position.set(sunX, sunY, sunZ);
      
      // Daylight vs Golden Hour vs Night color & intensity ramp
      if (hours >= 11.0 && hours <= 14.0) {
        // High Noon: Crisp daylight white (6500K)
        this.sunLight.color.setHex(0xffffff);
        this.sunLight.intensity = 3.6;
      } else if ((hours >= 5.5 && hours < 8.0) || (hours >= 16.5 && hours <= 19.5)) {
        // Golden Hour / Sunrise (3200K warm gold & peach)
        this.sunLight.color.setHex(0xffa756);
        this.sunLight.intensity = 2.8;
      } else if (hours < 5.0 || hours > 20.0) {
        // Deep Midnight: Cool moonlight blue
        this.sunLight.color.setHex(0x60a5fa);
        this.sunLight.intensity = 0.4;
      } else {
        // Twilight transitions
        this.sunLight.color.setHex(0xf472b6);
        this.sunLight.intensity = 1.4;
      }
    }

    if (this.skyDomeMat && this.skyDomeMat.uniforms) {
      this.skyDomeMat.uniforms.uSunPos.value.set(sunX, Math.max(sunY, 10), sunZ);
      const nightFactor = (hours < 6.0) ? (6.0 - hours) / 6.0 : (hours > 18.0) ? (hours - 18.0) / 6.0 : 0.0;
      this.skyDomeMat.uniforms.uNightIntensity.value = Math.max(0.0, Math.min(1.0, nightFactor));
    }
  }

  update(delta, time, sequencerTime = -1) {
    if (this.autoCycle) {
      this.timeOfDay = (this.timeOfDay + delta * this.cycleSpeed) % 24.0;
      this.applyAstronomicalSun(this.timeOfDay);
    }
    if (this.terrain) this.terrain.update(time);
    if (this.transit) this.transit.update(delta, time, sequencerTime);
    if (this.cloudMaterial && this.cloudMaterial.uniforms) {
      this.cloudMaterial.uniforms.uTime.value = time;
    }

    // Smooth Day/Night & Festival transition
    const targetIntensity = this.isNight ? 1.0 : 0.0;
    this.festivalIntensity = THREE.MathUtils.lerp(this.festivalIntensity, targetIntensity, delta * 2.0);

    // Adjust lighting
    if (this.sunLight) {
      this.sunLight.intensity = THREE.MathUtils.lerp(3.2, 0.35, this.festivalIntensity);
      this.sunLight.position.y = THREE.MathUtils.lerp(180, -50, this.festivalIntensity);
    }
    if (this.hemiLight) {
      this.hemiLight.intensity = THREE.MathUtils.lerp(1.2, 0.45, this.festivalIntensity);
    }
    if (this.scene.fog) {
      this.scene.fog.color.lerpColors(new THREE.Color(0x28384d), new THREE.Color(0x020617), this.festivalIntensity);
    }
    if (this.skyDomeMat && this.skyDomeMat.uniforms) {
      this.skyDomeMat.uniforms.uNightIntensity.value = this.festivalIntensity;
    }

    // Animate sweeping festival light pillars
    this.festivalPillars.forEach(p => {
      p.mat.opacity = this.festivalIntensity * 0.45;
      p.mesh.rotation.x = Math.sin(time * 0.6 + p.idx) * 0.12;
      p.mesh.rotation.z = Math.cos(time * 0.6 + p.idx) * 0.12;
    });

    // Update each active zone
    Object.values(this.zones).forEach(z => {
      if (z && typeof z.update === 'function') {
        z.update(time);
      }
    });
  }
}
