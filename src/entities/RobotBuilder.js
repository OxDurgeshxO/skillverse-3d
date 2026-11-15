import * as THREE from 'three';
import { createCircuitVeinMaterial } from '../shaders/circuitShader.js';
import { createHologramMaterial } from '../shaders/hologramShader.js';

export class RobotBuilder {
  constructor() {
    this.sharedGeometries = {
      head: new THREE.SphereGeometry(1, 16, 16),
      torso: new THREE.BoxGeometry(1.6, 2.2, 1.2),
      limb: new THREE.CylinderGeometry(0.3, 0.3, 1.8, 12),
      joint: new THREE.SphereGeometry(0.4, 12, 12),
      eye: new THREE.PlaneGeometry(0.35, 0.2)
    };

    // Cache canvas badge textures
    this.badgeTextures = {};
  }

  createArticulatedArm(shellMat, jointMat) {
    const limbGroup = new THREE.Group();
    limbGroup.position.y = -1.0;

    // Upper bicep
    const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.9, 12), shellMat);
    bicep.position.y = 0.45;
    limbGroup.add(bicep);

    // Titanium elbow joint
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), jointMat);
    elbow.position.y = 0;
    limbGroup.add(elbow);

    // Forearm armor sleeve
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.20, 0.9, 12), shellMat);
    forearm.position.y = -0.45;
    limbGroup.add(forearm);

    // Robotic wrist & hand
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 8), jointMat);
    wrist.position.y = -0.92;
    limbGroup.add(wrist);

    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.32), jointMat);
    hand.position.y = -1.02;
    limbGroup.add(hand);

    return limbGroup;
  }

  createArticulatedLeg(jointMat, shellMat, includeFoot = true) {
    const legGroup = new THREE.Group();
    legGroup.position.y = -0.9;

    // Upper thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.9, 12), jointMat);
    thigh.position.y = 0.45;
    legGroup.add(thigh);

    // Titanium knee joint
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), jointMat);
    knee.position.y = 0;
    legGroup.add(knee);

    // Armored shin / calf
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.9, 12), shellMat);
    shin.position.y = -0.45;
    legGroup.add(shin);

    // Planted foot with rubberized tread sole
    if (includeFoot) {
      const footMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85, metalness: 0.2 });
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.85), footMat);
      foot.position.set(0, -0.95, 0.18);
      legGroup.add(foot);
    }

    return legGroup;
  }

  /**
   * Create a floating billboarding holographic skill badge above robot's head
   */
  createSkillBadge(name, colorHex) {
    if (typeof document === 'undefined') {
      const spriteMat = new THREE.SpriteMaterial({ color: 0x38bdf8 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.4, 0.35, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Rounded pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 16);
    ctx.fill();
    ctx.stroke();

    // Skill Name Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase(), 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
  }

  /**
   * Build a single humanoid skill robot at exact metric scale (0.25m - 0.35m)
   * @param {string} type Skill robot identifier
   * @returns {THREE.Group}
   */
  createRobot(type) {
    const robot = new THREE.Group();
    robot.name = `robot_${type}`;

    let targetHeight = 0.28;
    let displayName = "Skill Robot";
    let primaryColor = 0xf8fafc;
    let secondaryColor = 0x38bdf8;
    let eyeColor = 0x00f0ff;
    let badgeColor = "#38bdf8";
    let isMatteBlack = false;

    switch (type) {
      case 'coding':
        targetHeight = 0.28;
        displayName = "Coding Robot";
        primaryColor = 0x09090b;
        secondaryColor = 0x0284c7;
        eyeColor = 0x00f0ff;
        badgeColor = "#00f0ff";
        isMatteBlack = true;
        break;
      case 'ai_ml':
        targetHeight = 0.30;
        displayName = "AI & ML Robot";
        primaryColor = 0xf8fafc;
        secondaryColor = 0x8b5cf6;
        eyeColor = 0xc084fc;
        badgeColor = "#c084fc";
        break;
      case 'web_dev':
        targetHeight = 0.27;
        displayName = "Web Dev Robot";
        primaryColor = 0xd1d5db;
        secondaryColor = 0xf59e0b;
        eyeColor = 0x38bdf8;
        badgeColor = "#38bdf8";
        break;
      case 'cybersecurity':
        targetHeight = 0.32;
        displayName = "Cybersecurity Robot";
        primaryColor = 0x1e293b;
        secondaryColor = 0xdc2626;
        eyeColor = 0xef4444;
        badgeColor = "#ef4444";
        break;
      case 'medicine':
        targetHeight = 0.26;
        displayName = "Medicine Robot";
        primaryColor = 0xffffff;
        secondaryColor = 0x10b981;
        eyeColor = 0x34d399;
        badgeColor = "#34d399";
        break;
      case 'engineering':
        targetHeight = 0.34;
        displayName = "Engineering Robot";
        primaryColor = 0xf97316;
        secondaryColor = 0x334155;
        eyeColor = 0xfacc15;
        badgeColor = "#f97316";
        break;
      case 'design':
        targetHeight = 0.27;
        displayName = "Design Robot";
        primaryColor = 0xe0e7ff;
        secondaryColor = 0xec4899;
        eyeColor = 0xf43f5e;
        badgeColor = "#ec4899";
        break;
      case 'business':
        targetHeight = 0.29;
        displayName = "Business Robot";
        primaryColor = 0x1e3a8a;
        secondaryColor = 0x0284c7;
        eyeColor = 0x60a5fa;
        badgeColor = "#60a5fa";
        break;
      case 'teaching':
        targetHeight = 0.28;
        displayName = "Teaching Robot";
        primaryColor = 0xffedd5;
        secondaryColor = 0xb45309;
        eyeColor = 0xfbbf24;
        badgeColor = "#fbbf24";
        break;
      case 'communication':
        targetHeight = 0.26;
        displayName = "Comm Robot";
        primaryColor = 0x99f6e4;
        secondaryColor = 0x0f766e;
        eyeColor = 0x2dd4bf;
        badgeColor = "#2dd4bf";
        break;
      case 'travel':
        targetHeight = 0.31;
        displayName = "Travel Robot";
        primaryColor = 0x3f6212;
        secondaryColor = 0xa16207;
        eyeColor = 0x84cc16;
        badgeColor = "#84cc16";
        break;
      case 'sports':
        targetHeight = 0.30;
        displayName = "Sports Robot";
        primaryColor = 0x09090b;
        secondaryColor = 0x22c55e;
        eyeColor = 0x4ade80;
        badgeColor = "#4ade80";
        break;
      case 'art':
        targetHeight = 0.28;
        displayName = "Art Robot";
        primaryColor = 0xfef08a;
        secondaryColor = 0xd946ef;
        eyeColor = 0xa855f7;
        badgeColor = "#d946ef";
        break;
      case 'music':
        targetHeight = 0.29;
        displayName = "Music Robot";
        primaryColor = 0x020617;
        secondaryColor = 0xeab308;
        eyeColor = 0xfacc15;
        badgeColor = "#facc15";
        break;
      case 'agriculture':
        targetHeight = 0.33;
        displayName = "Agriculture Robot";
        primaryColor = 0x166534;
        secondaryColor = 0x854d0e;
        eyeColor = 0xa3e635;
        badgeColor = "#a3e635";
        break;
      case 'cooking':
        targetHeight = 0.25;
        displayName = "Cooking Robot";
        primaryColor = 0xf1f5f9;
        secondaryColor = 0xe11d48;
        eyeColor = 0xf87171;
        badgeColor = "#f87171";
        break;
      case 'science':
        targetHeight = 0.28;
        displayName = "Science Robot";
        primaryColor = 0xf8fafc;
        secondaryColor = 0x0284c7;
        eyeColor = 0x38bdf8;
        badgeColor = "#38bdf8";
        break;
      case 'space':
        targetHeight = 0.35;
        displayName = "Space Robot";
        primaryColor = 0xf1f5f9;
        secondaryColor = 0xd97706;
        eyeColor = 0x38bdf8;
        badgeColor = "#f59e0b";
        break;
    }

    // Material setups: PBR ceramic & titanium
    const shellMat = isMatteBlack
      ? createCircuitVeinMaterial(0x00f0ff, 0x0b0e14)
      : new THREE.MeshStandardMaterial({
          color: primaryColor,
          roughness: 0.25,
          metalness: 0.4
        });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Brushed titanium
      metalness: 0.85,
      roughness: 0.2
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });

    // Torso with contoured ceramic armor, power reactor core, and lumbar actuator
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 2.4;

    const chest = new THREE.Mesh(this.sharedGeometries.torso, shellMat);
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Glowing arc-reactor chest core
    const coreGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 16);
    coreGeom.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const chestCore = new THREE.Mesh(coreGeom, coreMat);
    chestCore.position.set(0, 0.2, 0.62);
    torsoGroup.add(chestCore);

    // Carbon waist actuator joint
    const waistGeom = new THREE.CylinderGeometry(0.55, 0.65, 0.6, 12);
    const waistMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5, metalness: 0.8 });
    const waist = new THREE.Mesh(waistGeom, waistMat);
    waist.position.y = -1.1;
    torsoGroup.add(waist);

    robot.add(torsoGroup);

    // Head with communication sensor pods
    const headGroup = new THREE.Group();
    headGroup.position.y = 4.2;

    const head = new THREE.Mesh(this.sharedGeometries.head, shellMat);
    head.castShadow = true;
    headGroup.add(head);

    // Lateral comm/audio sensor pods
    const podGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 12);
    podGeom.rotateZ(Math.PI / 2);
    const podL = new THREE.Mesh(podGeom, jointMat);
    podL.position.set(-1.02, 0, 0);
    headGroup.add(podL);
    const podR = new THREE.Mesh(podGeom, jointMat);
    podR.position.set(1.02, 0, 0);
    headGroup.add(podR);

    // Curved Polycarbonate Visor
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: (type === 'space') ? 0xf59e0b : 0x09090b,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const visorGeom = new THREE.SphereGeometry(1.02, 16, 16, 0, Math.PI, 0, Math.PI * 0.6);
    visorGeom.rotateY(Math.PI / 2);
    const visor = new THREE.Mesh(visorGeom, visorMat);
    visor.position.z = 0.1;
    headGroup.add(visor);

    // Expressive LED Eyes
    const leftEye = new THREE.Mesh(this.sharedGeometries.eye, eyeMat);
    leftEye.position.set(-0.35, 0.1, 1.05);
    const rightEye = new THREE.Mesh(this.sharedGeometries.eye, eyeMat);
    rightEye.position.set(0.35, 0.1, 1.05);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Neural Dome for AI & ML Robot
    if (type === 'ai_ml') {
      const neuralDomeMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.8,
        wireframe: true
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.08, 12, 12), neuralDomeMat);
      headGroup.add(dome);
    }

    robot.add(headGroup);

    // Articulated Arms (ball joint shoulder + compound articulated limb)
    const armLeft = new THREE.Group();
    armLeft.position.set(-1.2, 3.2, 0);
    const shoulderL = new THREE.Mesh(this.sharedGeometries.joint, jointMat);
    const armLimbL = this.createArticulatedArm(shellMat, jointMat);
    armLeft.add(shoulderL);
    armLeft.add(armLimbL);
    robot.add(armLeft);

    const armRight = new THREE.Group();
    armRight.position.set(1.2, 3.2, 0);
    const shoulderR = new THREE.Mesh(this.sharedGeometries.joint, jointMat);
    const armLimbR = this.createArticulatedArm(shellMat, jointMat);
    armRight.add(shoulderR);
    armRight.add(armLimbR);
    robot.add(armRight);

    // Articulated Legs (ball joint hip + compound articulated leg with rubberized foot sole)
    const legLeft = new THREE.Group();
    legLeft.position.set(-0.6, 1.3, 0);
    const hipL = new THREE.Mesh(this.sharedGeometries.joint, jointMat);
    const legLimbL = this.createArticulatedLeg(jointMat, shellMat, type !== 'travel');
    legLeft.add(hipL);
    legLeft.add(legLimbL);
    robot.add(legLeft);

    const legRight = new THREE.Group();
    legRight.position.set(0.6, 1.3, 0);
    const hipR = new THREE.Mesh(this.sharedGeometries.joint, jointMat);
    const legLimbR = this.createArticulatedLeg(jointMat, shellMat, type !== 'travel');
    legRight.add(hipR);
    legRight.add(legLimbR);
    robot.add(legRight);

    robot.userData = {
      type,
      displayName,
      targetHeight,
      armLeft,
      armRight,
      legLeft,
      legRight,
      headGroup
    };

    // Unique Signature Accessories & Tool Rigs
    this.addSignatureAccessories(robot, type);

    // Overhead Floating Holographic Skill Badge
    const badge = this.createSkillBadge(displayName, badgeColor);
    badge.position.set(0, 6.2, 0);
    robot.add(badge);
    robot.userData.badge = badge;

    // Scale down from nominal builder size (height ~5.2 units) to exact target height (0.25m - 0.35m)
    const currentHeight = 5.2;
    const scaleFactor = targetHeight / currentHeight;
    robot.scale.set(scaleFactor, scaleFactor, scaleFactor);

    return robot;
  }

  addSignatureAccessories(robot, type) {
    if (type === 'coding') {
      const kbGeom = new THREE.PlaneGeometry(1.6, 0.8);
      const kbMat = createHologramMaterial(0x00f0ff);
      const kb = new THREE.Mesh(kbGeom, kbMat);
      kb.rotation.x = -Math.PI / 3;
      kb.position.set(0, 2.5, 1.2);
      robot.add(kb);
      robot.userData.accessory = kb;

      // Glowing circuit veins across matte black chest
      const circuitMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const vLine1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.05), circuitMat);
      vLine1.position.set(-0.35, 2.5, 0.65);
      const vLine2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.05), circuitMat);
      vLine2.position.set(0.35, 2.4, 0.65);
      const hLine = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.06, 0.05), circuitMat);
      hLine.position.set(0, 2.7, 0.65);
      robot.add(vLine1);
      robot.add(vLine2);
      robot.add(hLine);
    } else if (type === 'travel') {
      // Ruggedized expedition backpack mounted on back
      const packGeom = new THREE.BoxGeometry(1.3, 1.5, 0.8);
      const packMat = new THREE.MeshStandardMaterial({ color: 0x4d3822, roughness: 0.8 });
      const pack = new THREE.Mesh(packGeom, packMat);
      pack.position.set(0, 2.5, -0.9);
      robot.add(pack);

      // Bedroll / scout gear cylinder on top of backpack
      const rollGeom = new THREE.CylinderGeometry(0.24, 0.24, 1.3, 12);
      rollGeom.rotateZ(Math.PI / 2);
      const rollMat = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.7 });
      const roll = new THREE.Mesh(rollGeom, rollMat);
      roll.position.set(0, 3.4, -0.9);
      robot.add(roll);

      // Miniature hiking boots on feet
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x271c10, roughness: 0.6 });
      const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.2), bootMat);
      bootL.position.set(0, -1.9, 0.2);
      robot.userData.legLeft.add(bootL);

      const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.2), bootMat);
      bootR.position.set(0, -1.9, 0.2);
      robot.userData.legRight.add(bootR);
    } else if (type === 'communication') {
      // Soundwave LED equalizer pattern across chest (5 vertical glowing cyan/teal bars)
      const eqMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
      const eqGroup = new THREE.Group();
      const barHeights = [0.4, 0.7, 0.95, 0.6, 0.35];
      robot.userData.eqBars = [];
      barHeights.forEach((h, idx) => {
        const barGeom = new THREE.BoxGeometry(0.12, h, 0.05);
        const bar = new THREE.Mesh(barGeom, eqMat);
        bar.position.set((idx - 2) * 0.22, 2.4, 0.65);
        eqGroup.add(bar);
        robot.userData.eqBars.push(bar);
      });
      robot.add(eqGroup);

      // Small directional microphone held in right hand
      const micGroup = new THREE.Group();
      const micHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
      );
      const micHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 })
      );
      micHead.position.y = 0.35;
      micGroup.add(micHandle);
      micGroup.add(micHead);
      micGroup.position.set(0, -1.9, 0.3);
      robot.userData.armRight.add(micGroup);
    } else if (type === 'engineering') {
      const packGeom = new THREE.BoxGeometry(1.2, 1.8, 0.8);
      const packMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
      const pack = new THREE.Mesh(packGeom, packMat);
      pack.position.set(0, 2.4, -0.9);
      robot.add(pack);

      // Welding torch on right arm
      const torch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 })
      );
      torch.position.set(0, -1.8, 0.3);
      robot.userData.armRight.add(torch);
    } else if (type === 'medicine') {
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.1), crossMat);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.1), crossMat);
      b1.position.set(0, 2.4, 0.65);
      b2.position.set(0, 2.4, 0.65);
      robot.add(b1);
      robot.add(b2);
    } else if (type === 'design') {
      const palGeom = new THREE.TorusGeometry(0.7, 0.1, 8, 24);
      const palMat = createHologramMaterial(0xec4899);
      const pal = new THREE.Mesh(palGeom, palMat);
      pal.position.set(1.4, 2.6, 0.6);
      robot.add(pal);
    } else if (type === 'space') {
      const jetGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 12);
      const jetMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.8 });
      const j1 = new THREE.Mesh(jetGeom, jetMat);
      j1.position.set(-0.5, 2.4, -0.8);
      const j2 = new THREE.Mesh(jetGeom, jetMat);
      j2.position.set(0.5, 2.4, -0.8);
      robot.add(j1);
      robot.add(j2);
    } else if (type === 'cybersecurity') {
      // Red energy shield
      const shieldGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 6);
      shieldGeom.rotateX(Math.PI / 2);
      const shieldMat = createHologramMaterial(0xef4444);
      const shield = new THREE.Mesh(shieldGeom, shieldMat);
      shield.position.set(-1.4, 2.6, 0.8);
      robot.add(shield);
    } else if (type === 'music') {
      // Micro musical instrument
      const instGeom = new THREE.BoxGeometry(0.4, 1.4, 0.3);
      const instMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9 });
      const inst = new THREE.Mesh(instGeom, instMat);
      inst.position.set(0.8, 2.5, 0.6);
      robot.add(inst);
    }
  }

  /**
   * Animate walking or specialized idle actions
   */
  animateRobot(robot, time, isWalking = true, speed = 4.0) {
    const { armLeft, armRight, legLeft, legRight, headGroup, type } = robot.userData;
    if (!armLeft || !legLeft) return;

    if (robot.userData.eqBars) {
      robot.userData.eqBars.forEach((bar, idx) => {
        bar.scale.y = 0.6 + Math.abs(Math.sin(time * 7.0 + idx * 1.2)) * 0.7;
      });
    }

    if (isWalking) {
      const angle = Math.sin(time * speed) * 0.45;
      legLeft.rotation.x = angle;
      legRight.rotation.x = -angle;
      armLeft.rotation.x = -angle * 0.8;
      armRight.rotation.x = angle * 0.8;
    } else {
      // Idle humanoid breathing & specialized gestures
      const breath = Math.sin(time * 2.0) * 0.05;
      robot.position.y = (robot.userData.baseY || robot.position.y) + breath * 0.01;

      if (type === 'coding') {
        // Typing hands on holographic keyboard
        armLeft.rotation.x = -Math.PI / 4 + Math.sin(time * 12.0) * 0.15;
        armRight.rotation.x = -Math.PI / 4 + Math.cos(time * 14.0) * 0.15;
      } else if (type === 'ai_ml') {
        // Orbiting gesture
        armLeft.rotation.z = 0.3 + Math.sin(time * 3.0) * 0.2;
        armRight.rotation.z = -0.3 - Math.sin(time * 3.0) * 0.2;
      } else if (type === 'engineering') {
        // Welding motion
        armRight.rotation.x = -Math.PI / 3 + Math.sin(time * 8.0) * 0.1;
      } else if (type === 'design') {
        // Stylus drawing arc
        armRight.rotation.x = -Math.PI / 3 + Math.sin(time * 4.0) * 0.25;
        armRight.rotation.y = Math.cos(time * 4.0) * 0.2;
      } else {
        armLeft.rotation.x = Math.sin(time * 1.5) * 0.1;
        armRight.rotation.x = -Math.sin(time * 1.5) * 0.1;
      }

      if (headGroup) {
        headGroup.rotation.y = Math.sin(time * 1.2) * 0.2;
      }
    }
  }
}
