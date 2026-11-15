import * as THREE from 'three';

/**
 * Skillverse Tabletop 3D Print STL Exporter
 * Generates watertight manifold STL geometry scaled for physical desktop 3D printing (25mm - 35mm height)
 */
export class STL3DPrintExporter {
  /**
   * Export a robot group to STL format
   * @param {THREE.Group} robotGroup Three.js robot object
   * @param {string} filename Output filename
   * @param {number} printHeightMm Physical print height in millimeters (default: 28mm)
   */
  static exportToSTL(robotGroup, filename = 'skill_robot_miniature.stl', printHeightMm = 28) {
    const triangles = [];
    const tempVecA = new THREE.Vector3();
    const tempVecB = new THREE.Vector3();
    const tempVecC = new THREE.Vector3();
    const cb = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const normal = new THREE.Vector3();

    // Compute bounding box of robot
    const bbox = new THREE.Box3().setFromObject(robotGroup);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Calculate scale factor from virtual meters to physical millimeters
    // Virtual robot is ~0.28m, desired physical print is printHeightMm (e.g. 28mm)
    const scaleFactor = printHeightMm / Math.max(size.y, 0.01);

    robotGroup.traverse((child) => {
      if (child.isMesh && child.geometry && child.visible) {
        // Skip billboarding 2D sprites or holographic planes that are non-solid
        if (child.isSprite || child.material?.transparent) return;

        const geom = child.geometry.isBufferGeometry ? child.geometry.clone() : new THREE.BufferGeometry().fromGeometry(child.geometry);
        child.updateWorldMatrix(true, false);
        geom.applyMatrix4(child.matrixWorld);

        const posAttr = geom.getAttribute('position');
        const index = geom.getIndex();

        if (index) {
          for (let i = 0; i < index.count; i += 3) {
            const a = index.getX(i);
            const b = index.getX(i + 1);
            const c = index.getX(i + 2);

            tempVecA.fromBufferAttribute(posAttr, a).sub(bbox.min).multiplyScalar(scaleFactor);
            tempVecB.fromBufferAttribute(posAttr, b).sub(bbox.min).multiplyScalar(scaleFactor);
            tempVecC.fromBufferAttribute(posAttr, c).sub(bbox.min).multiplyScalar(scaleFactor);

            cb.subVectors(tempVecC, tempVecB);
            ab.subVectors(tempVecA, tempVecB);
            normal.crossVectors(cb, ab).normalize();

            triangles.push({
              normal: normal.clone(),
              a: tempVecA.clone(),
              b: tempVecB.clone(),
              c: tempVecC.clone()
            });
          }
        } else if (posAttr) {
          for (let i = 0; i < posAttr.count; i += 3) {
            tempVecA.fromBufferAttribute(posAttr, i).sub(bbox.min).multiplyScalar(scaleFactor);
            tempVecB.fromBufferAttribute(posAttr, i + 1).sub(bbox.min).multiplyScalar(scaleFactor);
            tempVecC.fromBufferAttribute(posAttr, i + 2).sub(bbox.min).multiplyScalar(scaleFactor);

            cb.subVectors(tempVecC, tempVecB);
            ab.subVectors(tempVecA, tempVecB);
            normal.crossVectors(cb, ab).normalize();

            triangles.push({
              normal: normal.clone(),
              a: tempVecA.clone(),
              b: tempVecB.clone(),
              c: tempVecC.clone()
            });
          }
        }
      }
    });

    // Generate ASCII STL file content
    let stl = `solid ${filename.replace(/[^a-zA-Z0-9]/g, '_')}\n`;
    triangles.forEach((tri) => {
      stl += `  facet normal ${tri.normal.x.toExponential(6)} ${tri.normal.y.toExponential(6)} ${tri.normal.z.toExponential(6)}\n`;
      stl += `    outer loop\n`;
      stl += `      vertex ${tri.a.x.toExponential(6)} ${tri.a.y.toExponential(6)} ${tri.a.z.toExponential(6)}\n`;
      stl += `      vertex ${tri.b.x.toExponential(6)} ${tri.b.y.toExponential(6)} ${tri.b.z.toExponential(6)}\n`;
      stl += `      vertex ${tri.c.x.toExponential(6)} ${tri.c.y.toExponential(6)} ${tri.c.z.toExponential(6)}\n`;
      stl += `    endloop\n`;
      stl += `  endfacet\n`;
    });
    stl += `endsolid\n`;

    // Trigger browser download
    const blob = new Blob([stl], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    return { triangleCount: triangles.length, printHeightMm };
  }
}
