import * as THREE from 'three';

export class SportsArena {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(-220, 4, 30);
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // 1. Exterior White Titanium Lattice Facade (Modern Olympic stadium style)
    const facadeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.8,
      roughness: 0.25
    });

    const stadiumGeom = new THREE.CylinderGeometry(36, 44, 18, 36, 1, true);
    const stadium = new THREE.Mesh(stadiumGeom, facadeMat);
    stadium.position.y = 9;
    stadium.scale.set(1.35, 1.0, 1.0); // Elliptical stadium form
    stadium.castShadow = true;
    this.group.add(stadium);

    // Diagrid exterior ribbing trusses
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.2 });
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 19, 0.8),
        ribMat
      );
      const rx = Math.cos(angle) * 40 * 1.35;
      const rz = Math.sin(angle) * 40;
      rib.position.set(rx, 9, rz);
      rib.rotation.y = -angle;
      rib.rotation.z = (Math.cos(angle) > 0 ? -0.1 : 0.1);
      this.group.add(rib);
    }

    // Kinetic Retractable Glass Crown Roof Ring
    const roofMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      transparent: true,
      opacity: 0.4,
      roughness: 0.08,
      metalness: 0.9
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(34, 1.6, 8, 36), roofMat);
    ring1.rotateX(Math.PI / 2);
    ring1.scale.set(1.32, 1.0, 1.0);
    ring1.position.y = 18;
    this.group.add(ring1);

    // 2. Interior Seating Bowl & Bleachers
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    for (let tier = 1; tier <= 3; tier++) {
      const tierGeom = new THREE.CylinderGeometry(24 + tier * 3, 22 + tier * 3, 2.5, 32, 1, true);
      const tierMesh = new THREE.Mesh(tierGeom, bowlMat);
      tierMesh.position.y = 3 + tier * 2.2;
      tierMesh.scale.set(1.32, 1.0, 1.0);
      this.group.add(tierMesh);
    }

    // 3. Athletic Running Track (Terracotta red)
    const trackGeom = new THREE.CylinderGeometry(23, 23, 0.25, 32);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.85 });
    const track = new THREE.Mesh(trackGeom, trackMat);
    track.position.y = 0.5;
    track.scale.set(1.3, 1.0, 1.0);
    this.group.add(track);

    // 4. Emerald Grass Pitch
    const pitchGeom = new THREE.BoxGeometry(40, 0.35, 22);
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const pitch = new THREE.Mesh(pitchGeom, pitchMat);
    pitch.position.y = 0.6;
    this.group.add(pitch);

    // White pitch markings
    const lineGeom = new THREE.PlaneGeometry(38, 20);
    lineGeom.rotateX(-Math.PI / 2);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    const lines = new THREE.Mesh(lineGeom, lineMat);
    lines.position.y = 0.78;
    this.group.add(lines);

    // 5. Corner Floodlight Towers
    const floodlightMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const lightEmitterMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    [
      [-42, 28],
      [42, 28],
      [-42, -28],
      [42, -28]
    ].forEach(([fx, fz]) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 26, 8), floodlightMat);
      tower.position.set(fx, 13, fz);
      this.group.add(tower);

      const lightHead = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.2, 0.8), lightEmitterMat);
      lightHead.position.set(fx, 25.5, fz);
      lightHead.lookAt(-220 + fx * 0.2, 8, 30 + fz * 0.2);
      this.group.add(lightHead);
    });

    // 6. Holographic Training Display Rings
    this.ringGroup = new THREE.Group();
    for (let r = 0; r < 3; r++) {
      const ringGeom = new THREE.TorusGeometry(5 + r * 4, 0.2, 8, 32);
      ringGeom.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const rMesh = new THREE.Mesh(ringGeom, ringMat);
      rMesh.position.y = 9 + r * 2.8;
      this.ringGroup.add(rMesh);
    }
    this.group.add(this.ringGroup);
  }

  update(time) {
    if (this.ringGroup) {
      this.ringGroup.rotation.y = time * 0.35;
    }
  }
}
