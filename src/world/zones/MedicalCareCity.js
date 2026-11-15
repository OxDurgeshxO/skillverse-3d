import * as THREE from 'three';

export class MedicalCareCity {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(130, 4, 110);
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // Clinical white polymer and glass materials
    const hospitalMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdf4,
      roughness: 0.15,
      metalness: 0.1
    });

    // Main Hospital Arc building
    const arcGeom = new THREE.CylinderGeometry(25, 25, 45, 32, 1, false, 0, Math.PI * 0.8);
    const mainHospital = new THREE.Mesh(arcGeom, hospitalMat);
    mainHospital.position.set(0, 22.5, 0);
    mainHospital.castShadow = true;
    this.group.add(mainHospital);

    // Glowing Green Medical Crosses on tower facings
    const crossGroup = new THREE.Group();
    const crossBar1 = new THREE.BoxGeometry(6, 1.8, 0.4);
    const crossBar2 = new THREE.BoxGeometry(1.8, 6, 0.4);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const b1 = new THREE.Mesh(crossBar1, crossMat);
    const b2 = new THREE.Mesh(crossBar2, crossMat);
    crossGroup.add(b1);
    crossGroup.add(b2);
    crossGroup.position.set(0, 36, 26);
    this.group.add(crossGroup);

    // Diagnostic Pavilion
    const diagGeom = new THREE.BoxGeometry(28, 16, 20);
    const diag = new THREE.Mesh(diagGeom, hospitalMat);
    diag.position.set(-25, 8, -15);
    diag.castShadow = true;
    this.group.add(diag);

    // Emergency Response Helipad
    const padGeom = new THREE.CylinderGeometry(10, 10, 1, 32);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const pad = new THREE.Mesh(padGeom, padMat);
    pad.position.set(25, 12, -15);
    this.group.add(pad);

    // Helipad "H" marking
    const hMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 8), hMat);
    h1.position.set(22, 12.6, -15);
    const h2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 8), hMat);
    h2.position.set(28, 12.6, -15);
    const h3 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 1.2), hMat);
    h3.position.set(25, 12.6, -15);
    this.group.add(h1);
    this.group.add(h2);
    this.group.add(h3);

    // Pulsing green beacon ring around helipad
    const beaconGeom = new THREE.TorusGeometry(10, 0.2, 8, 32);
    beaconGeom.rotateX(Math.PI / 2);
    this.beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const beacon = new THREE.Mesh(beaconGeom, this.beaconMat);
    beacon.position.set(25, 12.6, -15);
    this.group.add(beacon);
  }

  update(time) {
    if (this.beaconMat) {
      const pulse = Math.sin(time * 4.0) * 0.4 + 0.6;
      this.beaconMat.color.setRGB(0.1 * pulse, 0.8 * pulse, 0.4 * pulse);
    }
  }
}
