import * as THREE from 'three';

/**
 * Multi-Agent Inhabitant AI Chatter & Skill Quest System (Major 1 & Medium 4)
 * Evaluates proximity between autonomous skill robots, triggers emergent inter-agent
 * conversations with 3D speech bubble sprites, modulates robot facial emotion LEDs,
 * and maintains the planetary Skill Quest Log.
 */
export class MultiAgentChatterEngine {
  constructor(scene, audioEngine = null) {
    this.scene = scene;
    this.audioEngine = audioEngine;

    this.activeConversations = new Map();
    this.chatterCooldown = 0;
    this.activeSpeechBubbles = [];

    // The 4 Planetary Skill Quests
    this.quests = [
      {
        id: 'quest-neural-dome',
        title: 'Calibrate AI Neural Dome',
        zone: 'AI Research Valley',
        description: 'Collaborate with the AI & ML Robot to optimize tensor weight distributions.',
        status: 'AVAILABLE', // 'AVAILABLE' | 'ACTIVE' | 'COMPLETED'
        reward: 'Quantum Co-Processor Badge'
      },
      {
        id: 'quest-seeds',
        title: 'Deliver Drought-Resistant Seeds',
        zone: 'Green Agriculture Fields',
        description: 'Transport bio-engineered crops from the laboratory to automated harvesters.',
        status: 'AVAILABLE',
        reward: 'Bio-Harvester Certification'
      },
      {
        id: 'quest-harbor-crane',
        title: 'Inspect Harbor Crane Servos',
        zone: 'Engineering Harbor',
        description: 'Verify hydraulic pressure and wave-buoyancy stabilization on cargo crane 01.',
        status: 'AVAILABLE',
        reward: 'Maritime Master Wrench'
      },
      {
        id: 'quest-sprint',
        title: 'Complete 100m Kinetic Sprint',
        zone: 'Sports Arena',
        description: 'Run the athletic track alongside the Athletic Humanoid in under 12 seconds.',
        status: 'AVAILABLE',
        reward: 'Kinetic Gold Medal'
      }
    ];

    // Domain-specific dialogue topics
    this.dialogueBank = [
      {
        q: "Optimizing neural weights across the distributed cluster.",
        a: "Synchronized! Gradient loss stabilized at 0.002."
      },
      {
        q: "Ocean wave harmonics detected at harbor berth 3.",
        a: "Buoyancy torque clamped safely within 24 degrees."
      },
      {
        q: "Maglev express inbound on track 1.",
        a: "Platform safety interlocks confirmed green."
      },
      {
        q: "Solar arrays tracking golden hour sun elevation.",
        a: "Photovoltaic yield currently operating at 98.4% efficiency."
      }
    ];
  }

  acceptQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && q.status === 'AVAILABLE') {
      q.status = 'ACTIVE';
      return true;
    }
    return false;
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && q.status === 'ACTIVE') {
      q.status = 'COMPLETED';
      return true;
    }
    return false;
  }

  getQuests() {
    return this.quests;
  }

  /**
   * Modulate Robot Emotional LED matrices (Medium 4)
   * Emotions: 'curious' (cyan), 'happy' (gold), 'focused' (emerald), 'alert' (red), 'sleepy' (violet)
   */
  setRobotEmotion(robotMesh, emotion) {
    if (!robotMesh || !robotMesh.userData) return;
    const colors = {
      curious: 0x00f0ff,
      happy: 0xfbbf24,
      focused: 0x10b981,
      alert: 0xef4444,
      sleepy: 0x8b5cf6
    };
    const targetColor = colors[emotion] || 0x00f0ff;

    robotMesh.traverse(child => {
      if (child.isMesh && child.material && (child.name?.includes('eye') || child.geometry?.type === 'PlaneGeometry')) {
        child.material.color?.setHex(targetColor);
      }
    });
  }

  update(delta, time, activeRobots = []) {
    this.chatterCooldown -= delta;

    // Check proximity between robot pairs (d < 2.5m)
    if (this.chatterCooldown <= 0 && activeRobots.length >= 2) {
      for (let i = 0; i < activeRobots.length; i++) {
        for (let j = i + 1; j < activeRobots.length; j++) {
          const r1 = activeRobots[i];
          const r2 = activeRobots[j];
          if (!r1.mesh || !r2.mesh) continue;

          const dist = r1.mesh.position.distanceTo(r2.mesh.position);
          if (dist < 2.5) {
            this.triggerChatter(r1, r2);
            this.chatterCooldown = 6.0; // Cooldown between conversations
            return;
          }
        }
      }
    }
  }

  triggerChatter(robotA, robotB) {
    const topic = this.dialogueBank[Math.floor(Math.random() * this.dialogueBank.length)];

    // Set happy/focused emotions on interacting robots
    this.setRobotEmotion(robotA.mesh, 'happy');
    this.setRobotEmotion(robotB.mesh, 'curious');

    // Synthesize vocal chime formant if audio engine present
    if (this.audioEngine && typeof this.audioEngine.synthesizeSpeechChime === 'function') {
      this.audioEngine.synthesizeSpeechChime(robotA.mesh.position);
    }

    // Show toast or dispatch event for UI
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skillverse-agent-chatter', {
        detail: {
          botA: robotA.displayName || 'Robot A',
          botB: robotB.displayName || 'Robot B',
          dialogue: topic
        }
      }));
    }
  }

  dispose() {
    this.activeSpeechBubbles.forEach(b => {
      if (b.material) b.material.dispose();
      if (b.geometry) b.geometry.dispose();
      if (b.parent) b.parent.remove(b);
    });
    this.activeSpeechBubbles = [];
  }
}
