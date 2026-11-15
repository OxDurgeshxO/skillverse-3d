import * as THREE from 'three';

export class SpaceLaunchBase {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(420, 2, -260); // Coastal launch promontory
    this.steamParticles = [];
    this.rocket = null;
    this.isLaunching = false;
    this.launchVelocity = 0;
    this.countdownTimer = 0;
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // Concrete Launch Pad (Raised octagonal platform)
    const padGeom = new THREE.CylinderGeometry(35, 40, 5, 8);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1
    });
    const pad = new THREE.Mesh(padGeom, padMat);
    pad.position.set(0, 2.5, 0);
    pad.receiveShadow = true;
    this.group.add(pad);

    // Gantry Service Tower (Red-and-white steel truss tower)
    const towerGeom = new THREE.BoxGeometry(6, 95, 6);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.8,
      roughness: 0.3
    });
    const gantry = new THREE.Mesh(towerGeom, towerMat);
    gantry.position.set(-16, 50, 0);
    gantry.castShadow = true;
    this.group.add(gantry);

    // Swing-arm umbilicals connecting tower to rocket
    for (let a = 0; a < 3; a++) {
      const armGeom = new THREE.BoxGeometry(14, 1.2, 1.5);
      const arm = new THREE.Mesh(armGeom, towerMat);
      arm.position.set(-8, 35 + a * 24, 0);
      this.group.add(arm);
    }

    // Heavy-Lift Reusable Orbital Rocket (White fuselage with black interstage and gold fairing)
    const rocketGroup = new THREE.Group();
    rocketGroup.position.set(0, 5, 0);

    // First Stage booster
    const stage1Geom = new THREE.CylinderGeometry(4.5, 4.5, 55, 32);
    const rocketMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.6,
      roughness: 0.2
    });
    const stage1 = new THREE.Mesh(stage1Geom, rocketMat);
    stage1.position.y = 27.5;
    stage1.castShadow = true;
    rocketGroup.add(stage1);

    // Black Interstage ring
    const interGeom = new THREE.CylinderGeometry(4.52, 4.52, 6, 32);
    const interMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
    const inter = new THREE.Mesh(interGeom, interMat);
    inter.position.y = 58;
    rocketGroup.add(inter);

    // Second Stage
    const stage2Geom = new THREE.CylinderGeometry(4.5, 4.5, 22, 32);
    const stage2 = new THREE.Mesh(stage2Geom, rocketMat);
    stage2.position.y = 72;
    rocketGroup.add(stage2);

    // Payload Fairing (Cone nose)
    const fairingGeom = new THREE.ConeGeometry(4.5, 16, 32);
    const fairing = new THREE.Mesh(fairingGeom, rocketMat);
    fairing.position.y = 91;
    rocketGroup.add(fairing);

    // Engine Nozzles at base
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9 });
    for (let e = 0; e < 5; e++) {
      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3, 16, 1, true), engineMat);
      if (e === 0) {
        nozzle.position.set(0, 0, 0);
      } else {
        const angle = ((e - 1) / 4) * Math.PI * 2;
        nozzle.position.set(Math.cos(angle) * 2.5, 0, Math.sin(angle) * 2.5);
      }
      rocketGroup.add(nozzle);
    }

    this.rocket = rocketGroup;
    this.group.add(rocketGroup);

    // Booster Flame Plume Mesh (hidden until liftoff)
    const flameGeom = new THREE.ConeGeometry(5.2, 28, 16);
    flameGeom.rotateX(Math.PI);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.0 });
    this.boosterFlame = new THREE.Mesh(flameGeom, flameMat);
    this.boosterFlame.position.set(0, -14, 0);
    this.rocket.add(this.boosterFlame);

    // Hemispherical Mission Control Telemetry Dome
    const mcGeom = new THREE.SphereGeometry(18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const mcMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.4,
      roughness: 0.3
    });
    const mc = new THREE.Mesh(mcGeom, mcMat);
    mc.position.set(65, 0, 30);
    mc.castShadow = true;
    this.group.add(mc);

    // Giant Parabolic Radar Dish
    const dishGeom = new THREE.CylinderGeometry(10, 2, 4, 24, 1, true);
    dishGeom.rotateX(Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2
    });
    this.dish = new THREE.Mesh(dishGeom, dishMat);
    this.dish.position.set(65, 24, 30);
    this.group.add(this.dish);

    // Cryogenic Steam Venting Particle System
    const steamCount = 30;
    const pGeom = new THREE.SphereGeometry(1.5, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    });

    for (let s = 0; s < steamCount; s++) {
      const p = new THREE.Mesh(pGeom, pMat);
      p.position.set(
        (Math.random() - 0.5) * 6,
        15 + Math.random() * 60,
        (Math.random() - 0.5) * 6
      );
      this.group.add(p);
      this.steamParticles.push({
        mesh: p,
        speedY: 0.3 + Math.random() * 0.4,
        driftX: (Math.random() - 0.5) * 0.2,
        initialY: 15
      });
    }
  }

  launch() {
    this.isLaunching = true;
    this.launchVelocity = 2.0;
  }

  resetRocket() {
    this.isLaunching = false;
    this.launchVelocity = 0;
    if (this.rocket) this.rocket.position.set(0, 5, 0);
    if (this.boosterFlame) this.boosterFlame.material.opacity = 0.0;
  }

  update(time, delta = 0.016) {
    if (this.dish) {
      this.dish.rotation.y = time * 0.2;
    }

    // Rocket Ascent Physics & Booster Flame
    if (this.isLaunching && this.rocket) {
      this.launchVelocity += delta * 18.0;
      this.rocket.position.y += this.launchVelocity * delta;

      if (this.boosterFlame) {
        this.boosterFlame.material.opacity = 0.85 + Math.sin(time * 30.0) * 0.15;
        this.boosterFlame.scale.set(
          1.0 + Math.sin(time * 40.0) * 0.15,
          1.0 + Math.cos(time * 35.0) * 0.2,
          1.0 + Math.sin(time * 40.0) * 0.15
        );
      }

      // Loop after reaching mesosphere (y > 900m)
      if (this.rocket.position.y > 900) {
        this.resetRocket();
      }
    }

    this.steamParticles.forEach(p => {
      p.mesh.position.y += p.speedY;
      p.mesh.position.x += p.driftX;
      p.mesh.scale.multiplyScalar(1.008);
      if (p.mesh.position.y > 85) {
        p.mesh.position.y = p.initialY;
        p.mesh.position.x = (Math.random() - 0.5) * 4;
        p.mesh.scale.set(1, 1, 1);
      }
    });
  }
}
