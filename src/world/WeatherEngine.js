import * as THREE from 'three';

/**
 * Procedural Weather & Atmospheric Optics Engine (Major 2)
 * Simulates real-time atmospheric states: CLEAR (Golden Hour), OVERCAST (Cloud Stratosphere),
 * RAIN (Volumetric Rainstorm with 6,000 particle streaks), and TWILIGHT (Aurora Twilight).
 */
export class WeatherEngine {
  constructor(scene, worldManager, postProcessing = null, audioEngine = null) {
    this.scene = scene;
    this.worldManager = worldManager;
    this.postProcessing = postProcessing;
    this.audioEngine = audioEngine;

    this.currentWeather = 'CLEAR'; // 'CLEAR' | 'OVERCAST' | 'RAIN' | 'TWILIGHT'
    this.weatherBlend = 0.0;
    this.targetWeather = 'CLEAR';

    this.rainParticles = null;
    this.rainGeometry = null;
    this.rainCount = 5000;

    if (this.scene) {
      this.initRainParticles();
    }
  }

  initRainParticles() {
    this.rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    const spread = 140;
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      velocities[i] = 45 + Math.random() * 30; // 45-75 m/s terminal drop speed
    }

    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.35,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.rainParticles = new THREE.Points(this.rainGeometry, rainMat);
    this.rainParticles.frustumCulled = false;
    this.scene.add(this.rainParticles);
  }

  setWeather(type) {
    const valid = ['CLEAR', 'OVERCAST', 'RAIN', 'TWILIGHT'];
    if (!valid.includes(type)) return;
    this.targetWeather = type;
  }

  toggleWeather() {
    const sequence = ['CLEAR', 'OVERCAST', 'RAIN', 'TWILIGHT'];
    const nextIdx = (sequence.indexOf(this.targetWeather) + 1) % sequence.length;
    this.setWeather(sequence[nextIdx]);
    return this.targetWeather;
  }

  update(delta, time, camera) {
    // Smooth transition between weather modes
    if (this.currentWeather !== this.targetWeather) {
      this.weatherBlend += delta * 1.5;
      if (this.weatherBlend >= 1.0) {
        this.currentWeather = this.targetWeather;
        this.weatherBlend = 0.0;
      }
    }

    const isRaining = this.currentWeather === 'RAIN' || (this.targetWeather === 'RAIN' && this.weatherBlend > 0.1);
    const rainFactor = isRaining ? (this.currentWeather === 'RAIN' ? 1.0 : this.weatherBlend) : 0.0;

    // 1. Update volumetric rain particle positions
    if (this.rainParticles && this.rainGeometry) {
      this.rainParticles.material.opacity = THREE.MathUtils.lerp(this.rainParticles.material.opacity, isRaining ? 0.75 : 0.0, delta * 3.0);

      if (this.rainParticles.material.opacity > 0.01 && camera) {
        // Anchor rain volume around active camera
        this.rainParticles.position.x = camera.position.x;
        this.rainParticles.position.z = camera.position.z;

        const positions = this.rainGeometry.attributes.position.array;
        const velocities = this.rainGeometry.attributes.velocity.array;

        for (let i = 0; i < this.rainCount; i++) {
          positions[i * 3 + 1] -= velocities[i] * delta;
          positions[i * 3 + 0] += Math.sin(time * 2.0 + i) * delta * 2.0; // Wind gust drift

          // Wrap raindrops above camera when hitting ground
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 80;
            positions[i * 3 + 0] = (Math.random() - 0.5) * 140;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
          }
        }
        this.rainGeometry.attributes.position.needsUpdate = true;
      }
    }

    // 2. Modulate PostProcessing lens condensation
    if (this.postProcessing) {
      const activeCondensation = Math.max(rainFactor, (camera && camera.position.y > 220) ? Math.min(1.0, (camera.position.y - 220) / 180) : 0.0);
      this.postProcessing.setRainIntensity(activeCondensation, time);
    }

    // 3. Modulate lighting & sky dome tint based on weather
    if (this.worldManager && this.worldManager.sunLight) {
      if (this.currentWeather === 'RAIN' || this.targetWeather === 'RAIN') {
        this.worldManager.sunLight.color.lerp(new THREE.Color(0x64748b), delta * 2.0);
      } else if (this.currentWeather === 'TWILIGHT' || this.targetWeather === 'TWILIGHT') {
        this.worldManager.sunLight.color.lerp(new THREE.Color(0xf43f5e), delta * 2.0);
      } else if (this.currentWeather === 'OVERCAST' || this.targetWeather === 'OVERCAST') {
        this.worldManager.sunLight.color.lerp(new THREE.Color(0x94a3b8), delta * 2.0);
      } else {
        this.worldManager.sunLight.color.lerp(new THREE.Color(0xfff7ed), delta * 2.0);
      }
    }
  }

  dispose() {
    if (this.rainGeometry) this.rainGeometry.dispose();
    if (this.rainParticles && this.rainParticles.material) this.rainParticles.material.dispose();
    if (this.rainParticles && this.scene) this.scene.remove(this.rainParticles);
  }
}
