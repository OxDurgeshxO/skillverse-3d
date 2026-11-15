/**
 * InverseKinematicsSolver: Analytic Two-Bone IK Solver for Humanoid Foot Planting
 * Computes hip flexion and knee flexion angles using Law of Cosines to maintain ground contact on uneven terrain.
 */
export class InverseKinematicsSolver {
  /**
   * Solves 2D/3D planar two-bone IK
   * @param {Object} hipPos - { x, y, z }
   * @param {Object} footTarget - { x, y, z }
   * @param {number} l1 - Upper leg length (femur)
   * @param {number} l2 - Lower leg length (tibia)
   * @param {number} bendDir - 1 for forward knee bend, -1 for reverse
   * @returns {Object} { hipPitch, kneePitch, isReachable, actualFootPos }
   */
  static solveTwoBoneIK(hipPos, footTarget, l1 = 0.12, l2 = 0.12, bendDir = 1) {
    const dx = footTarget.x - hipPos.x;
    const dy = footTarget.y - hipPos.y;
    const dz = footTarget.z - hipPos.z;

    const horizontalDist = Math.hypot(dx, dz);
    let dist = Math.hypot(horizontalDist, dy);

    const maxReach = l1 + l2;
    const minReach = Math.abs(l1 - l2) + 0.001;
    const isReachable = dist <= maxReach;

    // Clamp distance within reachable kinematic limits
    dist = Math.max(minReach, Math.min(dist, maxReach * 0.9999));

    // Base pitch angle from hip to target in sagittal plane
    const baseAngle = Math.atan2(horizontalDist, -dy);

    // Law of Cosines for hip internal angle
    // cos(alpha) = (l1^2 + dist^2 - l2^2) / (2 * l1 * dist)
    const cosAlpha = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
    const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

    // Law of Cosines for knee internal angle
    // cos(beta) = (l1^2 + l2^2 - dist^2) / (2 * l1 * l2)
    const cosBeta = (l1 * l1 + l2 * l2 - dist * dist) / (2 * l1 * l2);
    const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));

    // Hip rotation (relative to vertical)
    const hipPitch = baseAngle - (bendDir * alpha);

    // Knee rotation (relative to thigh)
    const kneePitch = bendDir * (Math.PI - beta);

    return {
      hipPitch,
      kneePitch,
      isReachable,
      distance: dist,
      footTarget: { ...footTarget }
    };
  }

  /**
   * Applies IK foot correction to a robot leg group
   * Fix 5: Normal Alignment on Curbs and Slopes
   */
  static plantFoot(legGroup, targetGroundY, currentHipY, l1 = 0.12, l2 = 0.12, surfaceNormal = null) {
    if (!legGroup) return;

    const dy = targetGroundY - currentHipY;
    const ik = this.solveTwoBoneIK(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: dy, z: 0.02 },
      l1,
      l2
    );

    legGroup.rotation.x = ik.hipPitch;
    const knee = legGroup.children?.find(c => c.name === 'knee' || c.userData?.isKnee);
    if (knee) {
      knee.rotation.x = ik.kneePitch;
    }

    // Fix 5: Robot Foot Normal Alignment on Curbs and Slopes
    const foot = legGroup.children?.find(c => c.name === 'foot' || c.userData?.isFoot);
    if (surfaceNormal) {
      const slopePitch = Math.atan2(surfaceNormal.z || 0, surfaceNormal.y || 1);
      const slopeRoll = Math.atan2(-(surfaceNormal.x || 0), surfaceNormal.y || 1);
      if (foot) {
        foot.rotation.x = -ik.hipPitch - (knee ? knee.rotation.x : 0) + slopePitch;
        foot.rotation.z = slopeRoll;
      }
      ik.surfaceNormal = surfaceNormal;
      ik.slopePitch = slopePitch;
      ik.slopeRoll = slopeRoll;
    }

    return ik;
  }
}
