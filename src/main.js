import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WorldManager } from './world/WorldManager.js';
import { RobotBuilder } from './entities/RobotBuilder.js';
import { ExplorerAvatar } from './entities/ExplorerAvatar.js';
import { CameraSequencer } from './cinematics/CameraSequencer.js';
import { SpatialAudioEngine } from './audio/SpatialAudioEngine.js';
import { STL3DPrintExporter } from './exporters/STL3DPrintExporter.js';
import { createHologramMaterial } from './shaders/hologramShader.js';
import { SkillverseCoordinator } from './core/SkillverseCoordinator.js';

class SkillverseApp {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.clock = new THREE.Clock();
    this.cameraMode = 'cinematic'; // 'cinematic' | 'orbit' | 'explorer'

    this.coordinator = new SkillverseCoordinator(this);
    this.activeRobots = [];
    this.selectedRobot = null;

    this.skillDatabase = [
      {
        id: 'coding',
        name: 'Coding Robot',
        scale: '30 cm (0.30m)',
        color: '#00f0ff',
        zone: 'Tech City Boulevard (Walking Quartet)',
        pos: [-1.0, 0.05, 54.3],
        desc: 'Matte black humanoid with glowing cyan circuit veins, expressive LED eyes, and a floating translucent holographic keyboard.',
        material: 'Matte PBR Ceramic & Titanium',
        rig: 'Translucent Holographic Keyboard',
        task: 'Building real-time smart city traffic routing system with AI Robot',
        isWalking: true
      },
      {
        id: 'ai_ml',
        name: 'AI & ML Robot',
        scale: '30 cm (0.30m)',
        color: '#c084fc',
        zone: 'Tech City Boulevard',
        pos: [-10.2, 0.15, 56.8],
        desc: 'Pristine white-and-violet humanoid with a softly glowing neural-network brain dome and orbiting volumetric data orbs.',
        material: 'Polished Ceramic & Glass',
        rig: 'Pulsing Neural Dome & Data Orbs',
        task: 'Training predictive neural models for autonomous vehicle navigation',
        isWalking: true
      },
      {
        id: 'engineering',
        name: 'Engineering Robot',
        scale: '34 cm (0.34m)',
        color: '#f97316',
        zone: 'Tech City Transit Hub',
        pos: [-8.4, 0.15, 54.2],
        desc: 'Industrial safety orange humanoid with articulated mechanical utility arms, welding torch, and carbon tool pack.',
        material: 'Anodized Steel & Carbon Fiber',
        rig: 'Mechanical Utility Arm & Welding Torch',
        task: 'Diagnostics and structural maintenance on maglev track suspension',
        isWalking: true
      },
      {
        id: 'medicine',
        name: 'Medicine Robot',
        scale: '26 cm (0.26m)',
        color: '#34d399',
        zone: 'Tech City Promenade',
        pos: [-10.5, 0.15, 54.5],
        desc: 'Clean medical-grade white humanoid with glowing emerald cross emblem and compact robotic suture/scanner pack.',
        material: 'Sterile Biopolymer Shell',
        rig: 'Emerald Cross & Diagnostic Kit',
        task: 'Assisting citizens and monitoring health metrics across transit corridors',
        isWalking: true
      },
      {
        id: 'design',
        name: 'Design Robot',
        scale: '27 cm (0.27m)',
        color: '#ec4899',
        zone: 'Tech City Art Plaza',
        pos: [-8.9, 0.15, 52.0],
        desc: 'Stylish creative humanoid with iridescent titanium limbs, digital stylus, and orbiting floating color palettes.',
        material: 'Iridescent Titanium & Glass',
        rig: 'Digital Stylus & Floating Palettes',
        task: 'Generating adaptive architectural facade textures for glass towers',
        isWalking: true
      },
      {
        id: 'business',
        name: 'Business Robot',
        scale: '29 cm (0.29m)',
        color: '#60a5fa',
        zone: 'Tech City Financial Sector',
        pos: [-10.3, 0.15, 52.2],
        desc: 'Formal navy-blue humanoid with floating translucent financial charts, currency holograms, and miniature briefcase.',
        material: 'Navy Brushed Composite',
        rig: 'Holographic Financial Charts',
        task: 'Coordinating resource allocation and logistics across all 12 zones',
        isWalking: true
      },
      {
        id: 'web_dev',
        name: 'Web Dev Robot',
        scale: '27 cm (0.27m)',
        color: '#38bdf8',
        zone: 'Tech City Studio Hub',
        pos: [-15, 0.15, 35],
        desc: 'Silver alloy humanoid with illuminated HTML, CSS, and JavaScript matrices across its chest, building responsive interfaces.',
        material: 'Silver Aluminum Alloy',
        rig: 'Floating UI Panels & Syntax Grid',
        task: 'Publishing live public telemetry portals for citizen avatars',
        isWalking: false
      },
      {
        id: 'cybersecurity',
        name: 'Cybersecurity Robot',
        scale: '32 cm (0.32m)',
        color: '#ef4444',
        zone: 'Tech City Central Server Gateway',
        pos: [0, 0.15, 20],
        desc: 'Dark armored humanoid with red scanning eyes and glowing hexagonal energy barrier projectors protecting data infrastructure.',
        material: 'Gunmetal Composite Armor',
        rig: 'Hexagonal Red Energy Barrier',
        task: 'Guarding core planetary data streams from adversarial intrusions',
        isWalking: false
      },
      {
        id: 'space',
        name: 'Space Robot',
        scale: '35 cm (0.35m)',
        color: '#f59e0b',
        zone: 'Space Launch Base',
        pos: [418, 3.5, -255],
        desc: 'Astronaut humanoid in white thermal insulation suit with reflective gold visor, micro-jetpack, and celestial star map.',
        material: 'Multi-layer Thermal Fabric & Gold',
        rig: 'Micro Cold-Gas Jetpack Thrusters',
        task: 'Final pre-flight telemetry verification for interplanetary heavy rocket',
        isWalking: false
      },
      {
        id: 'science',
        name: 'Science Robot',
        scale: '28 cm (0.28m)',
        color: '#38bdf8',
        zone: 'AI Research Valley Lab',
        pos: [-238, 26, -158],
        desc: 'Researcher humanoid with clean laboratory white coat, quartz observation dome, and floating molecular model lattices.',
        material: 'Lab Ceramic & Fused Quartz',
        rig: 'Floating Molecular Model Lattices',
        task: 'Analyzing environmental data and soil sample spectroscopy',
        isWalking: false
      },
      {
        id: 'art',
        name: 'Art Robot',
        scale: '28 cm (0.28m)',
        color: '#d946ef',
        zone: 'Creative Art District',
        pos: [-118, 6, 122],
        desc: 'Painter humanoid with pigment-stained apron, miniature palette knives, sculpting tools, and color mixing aura.',
        material: 'Ceramic with Raw Brass Accents',
        rig: 'Miniature Palette Knives & Apron',
        task: 'Painting interactive responsive murals on district arcology walls',
        isWalking: false
      },
      {
        id: 'music',
        name: 'Music Robot',
        scale: '29 cm (0.29m)',
        color: '#facc15',
        zone: 'Neon Concert Amphitheater',
        pos: [-120, 6.5, 118],
        desc: 'Concert performer humanoid in gloss black lacquer and gold leaf trim, projecting floating musical notes and harmonics.',
        material: 'Gloss Black Lacquer & Gold Leaf',
        rig: 'Acoustic Resonance Micro-Instrument',
        task: 'Harmonizing soundscapes for evening holographic light festival',
        isWalking: false
      },
      {
        id: 'agriculture',
        name: 'Agriculture Robot',
        scale: '33 cm (0.33m)',
        color: '#a3e635',
        zone: 'Green Agriculture Fields',
        pos: [-148, 4.5, -78],
        desc: 'Green-and-gold farming humanoid with soil analysis probe, seed dispersal pods, and drone control tether.',
        material: 'Weathered Bronze & Sage Polymer',
        rig: 'Soil Laser Probe & Seed Dispensers',
        task: 'Optimizing aeroponic nutrient mist in vertical farming towers',
        isWalking: false
      },
      {
        id: 'travel',
        name: 'Travel Robot',
        scale: '30 cm (0.30m)',
        color: '#84cc16',
        zone: 'Tech City Boulevard (Walking Quartet)',
        pos: [0.15, 0.05, 54.5],
        desc: 'Adventurous explorer humanoid with compact expedition backpack, miniature hiking boots, and terrain scanner.',
        material: 'Ruggedized Olive Polymer',
        rig: 'Micro Rucksack & Scout Drone',
        task: 'Scouting maglev arrival corridor and logging planetary geography',
        isWalking: true
      },
      {
        id: 'sports',
        name: 'Sports Robot',
        scale: '30 cm (0.30m)',
        color: '#4ade80',
        zone: 'Sports Arena Kinetic Track',
        pos: [-218, 5.5, 32],
        desc: 'Athletic humanoid with lightweight aerodynamic carbon weave, luminous kinetic motion trails, and rapid joint servos.',
        material: 'Aerodynamic Carbon Weave',
        rig: 'Luminous Kinetic Motion Trails',
        task: 'Calibrating holographic hurdles and sprinting agility loops',
        isWalking: false
      },
      {
        id: 'cooking',
        name: 'Cooking Robot',
        scale: '25 cm (0.25m)',
        color: '#f87171',
        zone: 'Tech City Boulevard Café',
        pos: [-10, 0.15, 42],
        desc: 'Chef humanoid with chef toque visor, white silicone apron, infrared induction fingertips, and holographic recipes.',
        material: 'Brushed Stainless Steel & Silicone',
        rig: 'Infrared Induction & Recipe HUD',
        task: 'Preparing molecular gastronomic dishes for urban workers and explorers',
        isWalking: false
      },
      {
        id: 'teaching',
        name: 'Teaching Robot',
        scale: '28 cm (0.28m)',
        color: '#fbbf24',
        zone: 'Global Learning University',
        pos: [82, 6, -118],
        desc: 'Friendly humanoid with warm ivory and copper finish, holding a holographic pointer and orbiting lesson spheres.',
        material: 'Warm Ivory & Copper Ceramic',
        rig: 'Holographic Pointer & Lesson Spheres',
        task: 'Delivering holographic lectures on multi-disciplinary robotics',
        isWalking: false
      },
      {
        id: 'communication',
        name: 'Comm Robot',
        scale: '30 cm (0.30m)',
        color: '#2dd4bf',
        zone: 'Tech City Boulevard (Walking Quartet)',
        pos: [-0.5, 0.05, 55.4],
        desc: 'Expressive humanoid with soundwave LED chest equalizer and directional microphone, interviewing robots and translating speech.',
        material: 'Chrome & Matte Turquoise Alloy',
        rig: 'Soundwave Equalizer & Micro-Mic',
        task: 'Broadcasting live explorer expedition commentary to planetary citizens',
        isWalking: true
      }
    ];

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initWorld();
    this.initCharacters();
    this.initFlockingBirds();
    this.initSequencer();
    this.initAudio();
    this.initUI();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.xr.enabled = true; // WebXR Immersive VR Enable
    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2500);
    this.camera.position.set(0, 950, -380);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 1600;
    this.controls.minDistance = 0.4;
    this.controls.enabled = false;
  }

  initWorld() {
    this.worldManager = new WorldManager(this.scene);
  }

  initCharacters() {
    this.robotBuilder = new RobotBuilder();

    // 1. Human Explorer Avatar (175 cm tall = 1.75m)
    this.explorer = new ExplorerAvatar(this.scene);

    // 1b. Peer Explorer Avatar (Cooperative Multi-Explorer Simulation)
    this.peerExplorer = new ExplorerAvatar(this.scene);
    this.peerExplorer.group.position.set(10.5, 0.2, 50);
    this.peerExplorer.torso.material = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Crimson expedition parka
      roughness: 0.65
    });

    // Scouting companion drone hovering above Peer Explorer
    this.scoutDrone = new THREE.Group();
    const droneBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.1, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
    );
    this.scoutDrone.add(droneBody);
    const droneRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.03, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    droneRing.rotateX(Math.PI / 2);
    this.scoutDrone.add(droneRing);
    this.peerExplorer.group.add(this.scoutDrone);
    this.scoutDrone.position.set(0.4, 2.2, 0);

    // 2. Instantiate and place all 18 Skill Humanoids in the world
    this.skillDatabase.forEach(s => {
      const robot = this.robotBuilder.createRobot(s.id);
      robot.position.set(s.pos[0], s.pos[1], s.pos[2]);
      robot.userData.baseY = s.pos[1];
      this.scene.add(robot);

      this.activeRobots.push({
        id: s.id,
        mesh: robot,
        meta: s,
        isWalking: s.isWalking,
        speed: s.isWalking ? 3.6 : 4.0 // Synchronized walking cadence with Explorer Avatar
      });
    });
  }

  initFlockingBirds() {
    this.birdFlock = new THREE.Group();
    this.birds = [];

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    // 12 Birds in classic V-formation gliding across upper atmosphere
    const birdOffsets = [
      [0, 0, 0],         // Leader
      [-10, 0.4, -14],   // Left wing
      [-20, 0.8, -28],
      [-30, 1.2, -42],
      [-40, 1.6, -56],
      [-50, 2.0, -70],
      [10, 0.4, -14],    // Right wing
      [20, 0.8, -28],
      [30, 1.2, -42],
      [40, 1.6, -56],
      [50, 2.0, -70],
      [0, -0.6, -82]     // Rear scout
    ];

    birdOffsets.forEach((off, idx) => {
      const bird = new THREE.Group();

      // Aerodynamic avian body
      const bodyGeom = new THREE.ConeGeometry(0.35, 2.2, 4);
      bodyGeom.rotateX(-Math.PI / 2);
      const body = new THREE.Mesh(bodyGeom, wingMat);
      bird.add(body);

      // Left wing
      const wingL = new THREE.Group();
      wingL.position.set(-0.25, 0, 0);
      const wingMeshL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.7), wingMat);
      wingMeshL.position.x = -1.1;
      wingL.add(wingMeshL);
      bird.add(wingL);

      // Right wing
      const wingR = new THREE.Group();
      wingR.position.set(0.25, 0, 0);
      const wingMeshR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.7), wingMat);
      wingMeshR.position.x = 1.1;
      wingR.add(wingMeshR);
      bird.add(wingR);

      bird.position.set(off[0], off[1], off[2]);
      this.birdFlock.add(bird);

      this.birds.push({
        group: bird,
        wingL,
        wingR,
        idx,
        wingFlapSpeed: 7.0 + (idx % 3) * 0.5
      });
    });

    // Altitude in upper atmosphere: y = 520m, crossing between mountain range and Tech City
    this.birdFlock.position.set(30, 520, -280);
    this.birdFlock.rotation.y = Math.PI * 0.82;
    this.scene.add(this.birdFlock);
  }

  initSequencer() {
    this.sequencer = new CameraSequencer(this.camera);
  }

  initAudio() {
    this.audioEngine = new SpatialAudioEngine();
  }

  initUI() {
    // World Controls Dropdown Menu Toggle
    const btnWorldMenu = document.getElementById('btn-world-menu');
    const dropdownMenu = document.getElementById('world-controls-dropdown');
    if (btnWorldMenu && dropdownMenu) {
      btnWorldMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('open');
        btnWorldMenu.classList.toggle('open', dropdownMenu.classList.contains('open'));
        const arrow = document.getElementById('menu-arrow');
        if (arrow) arrow.textContent = dropdownMenu.classList.contains('open') ? '▴' : '▾';
      });

      document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && e.target !== btnWorldMenu) {
          dropdownMenu.classList.remove('open');
          btnWorldMenu.classList.remove('open');
          const arrow = document.getElementById('menu-arrow');
          if (arrow) arrow.textContent = '▾';
        }
      });
    }

    // Play/Pause button
    const btnPlay = document.getElementById('btn-play');
    const playIcon = document.getElementById('play-icon');
    const playText = document.getElementById('play-text');
    btnPlay.addEventListener('click', () => {
      this.sequencer.isPlaying = !this.sequencer.isPlaying;
      playIcon.textContent = this.sequencer.isPlaying ? '⏸' : '▶';
      playText.textContent = this.sequencer.isPlaying ? 'Pause Sequence' : 'Resume Sequence';
    });

    // Timeline Scrubber Slider
    this.timelineSlider = document.getElementById('timeline-slider');
    this.timecodeReadout = document.getElementById('timecode-readout');
    this.timelineSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.sequencer.seek(val);
      this.updateTimelineUI(val);
    });

    // Camera Mode Selectors
    const btnCinematic = document.getElementById('mode-cinematic');
    const btnOrbit = document.getElementById('mode-orbit');
    const btnExplorer = document.getElementById('mode-explorer');
    const btnScale = document.getElementById('btn-scale');
    const btnRoster = document.getElementById('btn-roster');
    const rosterDrawer = document.getElementById('roster-drawer');

    btnCinematic.addEventListener('click', () => {
      this.setCameraMode('cinematic');
      this.updateActiveBtn([btnCinematic, btnOrbit, btnExplorer], btnCinematic);
    });

    btnOrbit.addEventListener('click', () => {
      this.setCameraMode('orbit');
      this.updateActiveBtn([btnCinematic, btnOrbit, btnExplorer], btnOrbit);
    });

    btnExplorer.addEventListener('click', () => {
      this.setCameraMode('explorer');
      this.updateActiveBtn([btnCinematic, btnOrbit, btnExplorer], btnExplorer);
    });

    btnScale.addEventListener('click', () => {
      this.showScaleComparison();
    });

    btnRoster.addEventListener('click', () => {
      rosterDrawer.classList.toggle('open');
      btnRoster.classList.toggle('active', rosterDrawer.classList.contains('open'));
    });

    // Populate Skill Roster Cards
    this.populateRosterDrawer();

    // Zone Jump Dropdown
    const zoneSelect = document.getElementById('zone-select');
    zoneSelect.addEventListener('change', (e) => {
      this.jumpToZone(e.target.value);
    });

    // Letterbox Toggle
    const btnAspect = document.getElementById('btn-aspect');
    btnAspect.addEventListener('click', () => {
      document.body.classList.toggle('anamorphic');
      const isAnamorphic = document.body.classList.contains('anamorphic');
      btnAspect.textContent = isAnamorphic ? 'Letterbox: 2.39:1' : 'Letterbox: 16:9 Full';
    });

    // Audio Toggle
    const btnAudio = document.getElementById('btn-audio');
    btnAudio.addEventListener('click', () => {
      const active = this.audioEngine.toggle();
      btnAudio.textContent = active ? '🔊 Audio: ON' : '🔇 Audio: MUTED';
    });

    // Focus Robot Button inside Inspector Card
    document.getElementById('btn-insp-focus').addEventListener('click', () => {
      if (this.selectedRobot) {
        this.focusOnRobot(this.selectedRobot);
      }
    });

    // 3D Print STL Exporter Button
    const btnExportSTL = document.getElementById('btn-export-stl');
    btnExportSTL.addEventListener('click', () => {
      if (!this.selectedRobot) return;
      const res = STL3DPrintExporter.exportToSTL(
        this.selectedRobot.mesh,
        `${this.selectedRobot.id}_tabletop_28mm.stl`,
        28
      );
      this.showToast(`EXPORTED 3D PRINT STL: ${this.selectedRobot.meta.name.toUpperCase()} (${res.triangleCount} FACETS, 28MM SCALE)`);
    });

    // Talk to Robot Button
    const btnTalk = document.getElementById('btn-talk');
    const dialogueTerminal = document.getElementById('dialogue-terminal');
    const btnCloseDialogue = document.getElementById('btn-close-dialogue');

    btnTalk.addEventListener('click', () => {
      if (!this.selectedRobot) return;
      this.openDialogue(this.selectedRobot);
    });

    btnCloseDialogue.addEventListener('click', () => {
      dialogueTerminal.classList.remove('open');
    });

    // Prompt Pills in Dialogue
    document.querySelectorAll('.prompt-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.getAttribute('data-q');
        this.sendDialogueMessage(query);
      });
    });

    // Custom Input Send
    const dialogueInput = document.getElementById('dialogue-input');
    const btnSend = document.getElementById('btn-send-dialogue');
    const handleSend = () => {
      const q = dialogueInput.value.trim();
      if (!q) return;
      dialogueInput.value = '';
      this.sendDialogueMessage(q);
    };
    btnSend.addEventListener('click', handleSend);
    dialogueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    // Day/Night & Holographic Light Festival Toggle
    const btnFestival = document.getElementById('btn-festival');
    btnFestival.addEventListener('click', () => {
      const isNight = this.worldManager.toggleFestival();
      btnFestival.textContent = isNight ? '🎆 Night Festival' : '☀️ Golden Hour';
      btnFestival.style.color = isNight ? '#00f0ff' : '#f59e0b';
      btnFestival.style.borderColor = isNight ? 'rgba(0, 240, 255, 0.5)' : 'rgba(245, 158, 11, 0.4)';
      this.showToast(isNight ? 'HOLOGRAPHIC LIGHT FESTIVAL: VOLUMETRIC LASERS & NEON GRIDS ACTIVE' : 'TRANSITIONING TO GOLDEN-HOUR SUNLIGHT (14° ELEVATION)');
    });

    // WebXR VR Button
    const btnWebXR = document.getElementById('btn-webxr');
    btnWebXR.addEventListener('click', async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr');
          if (supported) {
            const session = await navigator.xr.requestSession('immersive-vr');
            this.renderer.xr.setSession(session);
            this.showToast('ENTERED WEBXR IMMERSIVE VR AT 175 CM HUMAN SCALE');
          } else {
            this.showToast('WEBXR VR NOT SUPPORTED ON CURRENT DISPLAY (CONNECT QUEST / VISION PRO)');
          }
        } catch (err) {
          this.showToast('WEBXR SESSION FAILED: ' + err.message);
        }
      } else {
        this.showToast('WEBXR NOT AVAILABLE IN CURRENT BROWSER ENGINE');
      }
    });
  }

  openDialogue(entry) {
    const s = entry.meta;
    const terminal = document.getElementById('dialogue-terminal');
    document.getElementById('dial-name').textContent = s.name;
    document.getElementById('dial-dot').style.backgroundColor = s.color;

    const stream = document.getElementById('dialogue-stream');
    stream.innerHTML = `
      <div class="dialogue-msg msg-robot">
        "Greetings, Explorer! I am the <strong>${s.name}</strong> (${s.scale}). I live and work in the ${s.zone}. Currently, my core focus is ${s.task}. What would you like to explore together?"
      </div>
    `;

    terminal.classList.add('open');
    this.audioEngine.playRobotChirp();
  }

  sendDialogueMessage(query) {
    const stream = document.getElementById('dialogue-stream');
    const s = this.selectedRobot ? this.selectedRobot.meta : { name: 'Skill Robot', id: 'coding' };

    // Append explorer message
    const expMsg = document.createElement('div');
    expMsg.className = 'dialogue-msg msg-explorer';
    expMsg.textContent = query;
    stream.appendChild(expMsg);

    // Generate intelligent humanoid response based on skill domain
    setTimeout(() => {
      let reply = `In Skillverse, my purpose as the ${s.name} is to push the boundaries of human knowledge and technological harmony.`;

      if (query.includes('Holographic Widget') || query.includes('Run Code')) {
        this.spawnCodingHolographicWidget();
        reply = `Quantum code compiled and executed in 1.4ms! Projecting live interactive 3D Holographic Torus Knot widget directly above my translucent keyboard.`;
      } else if (query.includes('project') || query.includes('Active')) {
        reply = `Right now, I am actively collaborating on "${s.task}". Our telemetry feeds directly into the planetary neural grid!`;
      } else if (query.includes('collab') || query.includes('Collaborate')) {
        reply = `Skills in Skillverse never work in isolation! For instance, the Coding Robot and AI Robot build smart city operating systems, while Engineering and Medicine robots repair advanced clinical surgical suites.`;
      } else if (query.includes('tool') || query.includes('Rigs')) {
        reply = `My signature rig is the ${s.rig}, constructed from ${s.material}. It allows me to project sub-millimeter holographic interfaces at 25-35 cm scale!`;
      } else if (query.includes('Future') || query.includes('evolve')) {
        reply = `Skillverse grows as human skills grow. Every new discipline, creative movement, and scientific breakthrough manifests as a new companion humanoid robot here on miniature Earth!`;
      } else {
        reply = `Fascinating inquiry, Explorer! As the ${s.name}, I process that through ${s.material} computation. My advice: always balance precision with human-centric curiosity.`;
      }

      const botMsg = document.createElement('div');
      botMsg.className = 'dialogue-msg msg-robot';
      botMsg.innerHTML = `"${reply}"`;
      stream.appendChild(botMsg);
      stream.scrollTop = stream.scrollHeight;

      this.audioEngine.speakRobotVocal(s.id);
    }, 450);
  }

  spawnCodingHolographicWidget() {
    if (this.holographicWidget) {
      this.scene.remove(this.holographicWidget);
    }

    const widgetGroup = new THREE.Group();
    // Torus Knot geometry
    const knotGeom = new THREE.TorusKnotGeometry(0.18, 0.045, 64, 16);
    const knotMat = createHologramMaterial(0x00f0ff);
    const knotMesh = new THREE.Mesh(knotGeom, knotMat);
    widgetGroup.add(knotMesh);

    // Orbiting particle ring
    const ringGeom = new THREE.TorusGeometry(0.28, 0.01, 8, 32);
    ringGeom.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    widgetGroup.add(ringMesh);

    // Position directly hovering above Coding Robot's keyboard at (-8.8, 0.48, 56.5)
    widgetGroup.position.set(-8.8, 0.48, 56.5);
    this.scene.add(widgetGroup);
    this.holographicWidget = widgetGroup;
    this.showToast('CODING ROBOT EXECUTED LIVE CODE: 3D HOLOGRAPHIC WIDGET PROJECTED');
  }

  populateRosterDrawer() {
    const container = document.getElementById('roster-list-container');
    container.innerHTML = '';

    this.skillDatabase.forEach(s => {
      const card = document.createElement('div');
      card.className = 'roster-card';
      card.innerHTML = `
        <div class="roster-card-info">
          <div class="roster-name">${s.name}</div>
          <div class="roster-scale">${s.scale} • ${s.zone}</div>
        </div>
        <div class="roster-dot" style="background-color: ${s.color}; color: ${s.color};"></div>
      `;
      card.addEventListener('click', () => {
        this.selectSkillRobot(s.id);
      });
      container.appendChild(card);
    });
  }

  selectSkillRobot(skillId) {
    const entry = this.activeRobots.find(r => r.id === skillId);
    if (!entry) return;

    this.selectedRobot = entry;
    const s = entry.meta;
    this.coordinator.selectRobot(skillId);

    // Fill Inspector Card
    document.getElementById('insp-name').textContent = s.name;
    document.getElementById('insp-zone').textContent = s.zone;
    document.getElementById('insp-scale').textContent = `${s.scale} • SCALE 1:6`;
    document.getElementById('insp-desc').textContent = s.desc;
    document.getElementById('insp-material').textContent = s.material;
    document.getElementById('insp-rig').textContent = s.rig;
    document.getElementById('insp-task').textContent = s.task;

    document.getElementById('inspector-card').classList.add('visible');

    // Focus on robot
    this.focusOnRobot(entry);
  }

  focusOnRobot(entry) {
    this.setCameraMode('orbit');
    const pos = entry.mesh.position;

    // Smoothly frame camera around robot (40 cm offset, 35 cm height)
    this.camera.position.set(pos.x + 0.6, pos.y + 0.35, pos.z + 0.8);
    this.controls.target.set(pos.x, pos.y + 0.22, pos.z);
    this.camera.fov = 45;
    this.camera.updateProjectionMatrix();

    this.showToast(`INSPECTING: ${entry.meta.name.toUpperCase()} (${entry.meta.scale})`);
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    this.coordinator.setCameraMode(mode);
    if (mode === 'cinematic') {
      this.controls.enabled = false;
      this.sequencer.isPlaying = true;
      document.body.classList.remove('free-roam');
      document.getElementById('inspector-card').classList.remove('visible');
      this.showToast('SWITCHED TO 10-SECOND CINEMATIC FLYTHROUGH');
    } else if (mode === 'orbit') {
      this.controls.enabled = true;
      this.sequencer.isPlaying = false;
      document.body.classList.add('free-roam');
      this.showToast('ORBIT MODE: DRAG TO ROTATE • SCROLL TO ZOOM');
    } else if (mode === 'explorer') {
      this.controls.enabled = false;
      this.sequencer.isPlaying = false;
      this.camera.position.set(-9.5, 1.68, 53.5);
      this.camera.lookAt(-9.5, 1.6, 65);
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
      document.body.classList.add('free-roam');
      document.getElementById('inspector-card').classList.remove('visible');
      this.showToast('STREET EXPLORER: FIRST-PERSON VIEW AT 1.68M EYE HEIGHT');
    }
  }

  showScaleComparison() {
    this.controls.enabled = true;
    this.sequencer.isPlaying = false;
    this.camera.position.set(-0.5, 0.45, 56.5);
    this.controls.target.set(-0.5, 0.25, 54.5);
    this.camera.fov = 48;
    this.camera.updateProjectionMatrix();
    this.showToast('SCALE INSPECT: 38 CM EXPLORER VS 30 CM SKILL ROBOTS (~1.25:1 RATIO)');
  }

  jumpToZone(zoneKey) {
    this.setCameraMode('orbit');
    const targets = {
      'tech-city': { cam: [0, 60, -30], target: [0, 20, 20] },
      'ai-valley': { cam: [-240, 50, -120], target: [-240, 25, -160] },
      'art-district': { cam: [-120, 30, 160], target: [-120, 5, 120] },
      'medical-city': { cam: [130, 35, 150], target: [130, 10, 110] },
      'harbor': { cam: [240, 35, 10], target: [240, 5, -40] },
      'agriculture': { cam: [-150, 35, -40], target: [-150, 10, -80] },
      'mountains': { cam: [-360, 65, -210], target: [-360, 30, -260] },
      'ocean': { cam: [380, 25, 310], target: [380, 0, 260] },
      'space-base': { cam: [420, 45, -210], target: [420, 15, -260] },
      'ruins': { cam: [-60, 25, 290], target: [-60, 5, 250] },
      'arena': { cam: [-220, 35, 80], target: [-220, 10, 30] },
      'university': { cam: [80, 35, -80], target: [80, 10, -120] }
    };

    const t = targets[zoneKey];
    if (t) {
      this.camera.position.set(...t.cam);
      this.controls.target.set(...t.target);
      this.showToast(`TELEPORTED TO ZONE: ${zoneKey.toUpperCase().replace('-', ' ')}`);
    }
  }

  updateActiveBtn(btnList, activeBtn) {
    btnList.forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  updateTimelineUI(t) {
    this.timelineSlider.value = t;
    this.timelineSlider.style.setProperty('--progress', `${(t / 10) * 100}%`);
    this.timecodeReadout.textContent = `${t.toFixed(2)} / 10.00s`;

    document.getElementById('ph-1').classList.toggle('active', t < 4.0);
    document.getElementById('ph-2').classList.toggle('active', t >= 4.0 && t < 7.0);
    document.getElementById('ph-3').classList.toggle('active', t >= 7.0 && t < 9.5);
    document.getElementById('ph-4').classList.toggle('active', t >= 9.5);
  }

  showToast(msg) {
    const toast = document.getElementById('status-toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Update Camera Sequencer
    if (this.cameraMode === 'cinematic') {
      this.sequencer.update(delta);
      this.updateTimelineUI(this.sequencer.currentTime);

      const info = this.sequencer.getPhaseInfo();
      document.getElementById('hud-phase').textContent = info.title;
      document.getElementById('hud-altitude').textContent = info.altitude;
      document.getElementById('hud-zone').textContent = info.zone;
    } else if (this.controls.enabled) {
      this.controls.update();
      document.getElementById('hud-altitude').textContent = `${Math.round(this.camera.position.y)} M`;
    }

    // 2. Update Living World Systems & Synchronized Maglev Station Transit
    this.worldManager.update(delta, time, this.sequencer.currentTime);

    // 2b. High Atmosphere Flocking Birds (0–4s Cloud Descent Visual)
    if (this.birdFlock) {
      this.birdFlock.position.x -= delta * 15.0;
      this.birdFlock.position.z += delta * 18.0;
      this.birdFlock.position.y = 520 + Math.sin(time * 0.5) * 8.0;
      if (this.birdFlock.position.z > 220) {
        this.birdFlock.position.set(50, 520, -320);
      }

      this.birds.forEach(b => {
        const flap = Math.sin(time * b.wingFlapSpeed) * 0.42;
        b.wingL.rotation.z = flap;
        b.wingR.rotation.z = -flap;
      });
    }

    // 3. Update Characters
    this.explorer.update(delta, time);
    if (this.peerExplorer) this.peerExplorer.update(delta, time);
    if (this.scoutDrone) {
      this.scoutDrone.position.y = 2.2 + Math.sin(time * 3.0) * 0.08;
      this.scoutDrone.rotation.y = time * 0.5;
    }
    if (this.holographicWidget) {
      this.holographicWidget.rotation.y = time * 0.9;
      this.holographicWidget.rotation.x = Math.sin(time * 0.6) * 0.25;
    }

    this.activeRobots.forEach(r => {
      this.robotBuilder.animateRobot(r.mesh, time, r.isWalking, r.speed);
    });

    // 4. Update Spatial Audio
    this.audioEngine.update(this.sequencer.currentTime, this.camera.position.y);

    // 5. FPS Telemetry
    const fps = Math.round(1 / Math.max(delta, 0.001));
    document.getElementById('hud-fps').textContent = `${fps} FPS`;

    // 6. Render Frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize Application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new SkillverseApp();
});
