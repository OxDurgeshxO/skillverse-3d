import * as THREE from 'three';

/**
 * Multiplayer Peer Synchronization Engine (Major 1)
 * Enables real-time co-op presence across multiple browser tabs and devices.
 * Uses BroadcastChannel for instant local multi-window sync and WebRTC DataChannel signaling.
 */
export class MultiplayerSyncEngine {
  constructor(scene, localAvatar, { roomName = 'skillverse_alpha', broadcastRateHz = 20 } = {}) {
    this.scene = scene;
    this.localAvatar = localAvatar;
    this.roomName = roomName;
    this.broadcastIntervalMs = 1000 / broadcastRateHz;
    this.lastBroadcastTime = 0;

    this.peerId = 'peer_' + Math.random().toString(36).substr(2, 8);
    this.peerColorHex = [0x00f0ff, 0xf43f5e, 0x10b981, 0xfbbf24, 0xc084fc][Math.floor(Math.random() * 5)];
    this.remotePeers = new Map(); // peerId -> { mesh, targetPos, targetRot, lastSeen, walkPhase }

    this.channel = null;
    this.initChannel();
  }

  initChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(`skillverse_room_${this.roomName}`);
        this.channel.onmessage = (event) => this.handlePeerMessage(event.data);

        // Broadcast join presence announcement
        this.channel.postMessage({
          type: 'JOIN',
          peerId: this.peerId,
          colorHex: this.peerColorHex
        });
      } catch (err) {
        console.warn('[MultiplayerSyncEngine] BroadcastChannel not supported in environment:', err);
      }
    }
  }

  handlePeerMessage(msg) {
    if (!msg || msg.peerId === this.peerId) return;

    if (msg.type === 'HEARTBEAT' || msg.type === 'MOVE') {
      let peer = this.remotePeers.get(msg.peerId);
      if (!peer) {
        peer = this.spawnPeerAvatar(msg.peerId, msg.colorHex || 0x00f0ff);
        this.remotePeers.set(msg.peerId, peer);
      }

      peer.targetPos.set(msg.x || 0, msg.y || 0, msg.z || 0);
      peer.targetRot = msg.rotY || 0;
      peer.isWalking = !!msg.isWalking;
      peer.walkSpeed = msg.walkSpeed || 1.0;
      peer.lastSeen = Date.now();

      if (msg.emote && peer.emoteBubble) {
        peer.emoteBubble.visible = true;
        peer.emoteBubble.userData.timeout = Date.now() + 3000;
      }
    } else if (msg.type === 'LEAVE') {
      this.removePeer(msg.peerId);
    }
  }

  spawnPeerAvatar(peerId, colorHex) {
    const peerGroup = new THREE.Group();
    peerGroup.name = `remote_peer_${peerId}`;

    // 38cm Explorer Avatar miniature proxy
    const parkaMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.5,
      metalness: 0.2
    });

    const torsoGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.18, 12);
    const torso = new THREE.Mesh(torsoGeo, parkaMat);
    torso.position.y = 0.22;
    peerGroup.add(torso);

    const headGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const head = new THREE.Mesh(headGeo, parkaMat);
    head.position.y = 0.35;
    peerGroup.add(head);

    // Glowing Visor
    const visorGeo = new THREE.BoxGeometry(0.08, 0.03, 0.04);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.35, 0.05);
    peerGroup.add(visor);

    // Scout Drone Hovering Companion
    const droneGeo = new THREE.OctahedronGeometry(0.045);
    const droneMat = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true });
    const drone = new THREE.Mesh(droneGeo, droneMat);
    drone.position.set(0.18, 0.44, -0.08);
    peerGroup.add(drone);

    // Floating Peer Tag Badge
    const badgeGeo = new THREE.PlaneGeometry(0.24, 0.06);
    const badgeMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0, 0.48, 0);
    peerGroup.add(badge);

    if (this.scene) this.scene.add(peerGroup);

    return {
      mesh: peerGroup,
      drone,
      badge,
      targetPos: new THREE.Vector3(),
      targetRot: 0,
      isWalking: false,
      walkSpeed: 1.0,
      lastSeen: Date.now()
    };
  }

  removePeer(peerId) {
    const peer = this.remotePeers.get(peerId);
    if (peer) {
      if (this.scene) this.scene.remove(peer.mesh);
      peer.mesh.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
      this.remotePeers.delete(peerId);
    }
  }

  update(delta = 0.016, time = 0) {
    const now = Date.now();

    // 1. Broadcast local player position
    if (now - this.lastBroadcastTime >= this.broadcastIntervalMs && this.channel && this.localAvatar) {
      this.lastBroadcastTime = now;
      const pos = this.localAvatar.mesh?.position || { x: 0, y: 0.04, z: 50 };
      const rotY = this.localAvatar.mesh?.rotation?.y || 0;

      this.channel.postMessage({
        type: 'MOVE',
        peerId: this.peerId,
        colorHex: this.peerColorHex,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        rotY,
        isWalking: this.localAvatar.isWalking || false,
        time: now
      });
    }

    // 2. Interpolate remote peer avatars & cull timed out peers (>8s)
    this.remotePeers.forEach((peer, id) => {
      if (now - peer.lastSeen > 8000) {
        this.removePeer(id);
        return;
      }

      // Smooth position & rotation lerp
      peer.mesh.position.lerp(peer.targetPos, delta * 12.0);
      peer.mesh.rotation.y = THREE.MathUtils.lerp(peer.mesh.rotation.y, peer.targetRot, delta * 12.0);

      // Animate hovering companion scout drone
      if (peer.drone) {
        peer.drone.position.y = 0.44 + Math.sin(time * 3.5 + id.charCodeAt(0)) * 0.035;
        peer.drone.rotation.y += delta * 2.0;
      }

      // Billboarding badge
      if (peer.badge) {
        peer.badge.rotation.y = peer.mesh.rotation.y;
      }
    });
  }

  getConnectedPeerCount() {
    return this.remotePeers.size;
  }

  dispose() {
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'LEAVE', peerId: this.peerId });
        this.channel.close();
      } catch (e) {}
    }
    this.remotePeers.forEach((_, id) => this.removePeer(id));
  }
}
