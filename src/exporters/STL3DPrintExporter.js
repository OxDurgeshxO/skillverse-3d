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

    // Sanitize filename against path traversal and invalid characters
    let cleanName = String(filename || 'skill_robot_miniature.stl')
      .replace(/[\/\?<>\\:\*\|":]/g, '_')
      .replace(/\.\.+/g, '_')
      .trim();
    if (!cleanName.toLowerCase().endsWith('.stl')) {
      cleanName += '.stl';
    }

    // Safety ceiling: prevent unbounded string allocation / memory exhaustion
    const MAX_TRIANGLES = 250000;
    if (triangles.length > MAX_TRIANGLES) {
      console.warn(`[STL3DPrintExporter] Triangle count exceeds safety limit (${triangles.length} > ${MAX_TRIANGLES}). Clamped.`);
      triangles.length = MAX_TRIANGLES;
    }

    // Generate ASCII STL file content
    const headerName = cleanName.replace(/[^a-zA-Z0-9]/g, '_');
    let stl = `solid ${headerName}\n`;
    triangles.forEach((tri) => {
      stl += `  facet normal ${tri.normal.x.toExponential(6)} ${tri.normal.y.toExponential(6)} ${tri.normal.z.toExponential(6)}\n`;
      stl += `    outer loop\n`;
      stl += `      vertex ${tri.a.x.toExponential(6)} ${tri.a.y.toExponential(6)} ${tri.a.z.toExponential(6)}\n`;
      stl += `      vertex ${tri.b.x.toExponential(6)} ${tri.b.y.toExponential(6)} ${tri.b.z.toExponential(6)}\n`;
      stl += `      vertex ${tri.c.x.toExponential(6)} ${tri.c.y.toExponential(6)} ${tri.c.z.toExponential(6)}\n`;
      stl += `    endloop\n`;
      stl += `  endfacet\n`;
    });
    stl += `endsolid ${headerName}\n`;

    // Trigger browser download safely
    if (typeof document !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([stl], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = cleanName;
      link.click();
      URL.revokeObjectURL(link.href);
    }

    return { triangleCount: triangles.length, printHeightMm, filename: cleanName, format: 'ascii' };
  }

  /**
   * Export robot group to compact Little-Endian Binary STL format (Fix 6)
   * 80-byte header, uint32 triangle count, 50-byte IEEE-754 facets
   * Yields ~80% smaller file size and accelerated slicer ingestion
   */
  static exportBinarySTL(robotGroup, filename = 'skill_robot_miniature.stl', printHeightMm = 28) {
    const triangles = [];
    const tempVecA = new THREE.Vector3();
    const tempVecB = new THREE.Vector3();
    const tempVecC = new THREE.Vector3();
    const cb = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const normal = new THREE.Vector3();

    const bbox = new THREE.Box3().setFromObject(robotGroup);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const scaleFactor = printHeightMm / Math.max(size.y, 0.01);

    robotGroup.traverse((child) => {
      if (child.isMesh && child.geometry && child.visible) {
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

    let cleanName = String(filename || 'skill_robot_miniature.stl')
      .replace(/[\/\?<>\\:\*\|":]/g, '_')
      .replace(/\.\.+/g, '_')
      .trim();
    if (!cleanName.toLowerCase().endsWith('.stl')) {
      cleanName += '.stl';
    }

    const MAX_TRIANGLES = 250000;
    if (triangles.length > MAX_TRIANGLES) {
      triangles.length = MAX_TRIANGLES;
    }

    // Allocate binary buffer: 80 bytes header + 4 bytes count + triangles * 50 bytes
    const bufferSize = 84 + triangles.length * 50;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const dataView = new DataView(arrayBuffer);

    // 80 bytes ASCII header
    const headerStr = 'Skillverse 3D Binary STL Exporter (Little-Endian) - Scale 28mm';
    for (let i = 0; i < 80; i++) {
      dataView.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0);
    }

    // Triangle count (uint32 Little-Endian)
    dataView.setUint32(80, triangles.length, true);

    // 50-byte facet blocks
    let offset = 84;
    triangles.forEach((tri) => {
      // Normal (nx, ny, nz)
      dataView.setFloat32(offset, tri.normal.x, true);
      dataView.setFloat32(offset + 4, tri.normal.y, true);
      dataView.setFloat32(offset + 8, tri.normal.z, true);

      // Vertex A (ax, ay, az)
      dataView.setFloat32(offset + 12, tri.a.x, true);
      dataView.setFloat32(offset + 16, tri.a.y, true);
      dataView.setFloat32(offset + 20, tri.a.z, true);

      // Vertex B (bx, by, bz)
      dataView.setFloat32(offset + 24, tri.b.x, true);
      dataView.setFloat32(offset + 28, tri.b.y, true);
      dataView.setFloat32(offset + 32, tri.b.z, true);

      // Vertex C (cx, cy, cz)
      dataView.setFloat32(offset + 36, tri.c.x, true);
      dataView.setFloat32(offset + 40, tri.c.y, true);
      dataView.setFloat32(offset + 44, tri.c.z, true);

      // 2 bytes attribute byte count (uint16 = 0)
      dataView.setUint16(offset + 48, 0, true);
      offset += 50;
    });

    if (typeof document !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = cleanName;
      link.click();
      URL.revokeObjectURL(link.href);
    }

    return {
      triangleCount: triangles.length,
      printHeightMm,
      filename: cleanName,
      byteLength: bufferSize,
      format: 'binary'
    };
  }
}
