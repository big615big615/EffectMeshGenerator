import * as THREE from 'three'

export function generateSlashMesh(
  divisions: number,
  widthDivisions: number,
  thickness: number,
  length: number,
  curve: number,
  topCurve: number,
  taper: number,
  endTaper = taper,
  twist = 0,
  spread = 0,
  liftDirection = 1,
  crossMesh = false
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const lengthSegments = Math.max(1, Math.floor(divisions))
  const widthSegments = Math.max(1, Math.floor(widthDivisions))
  const centerPoints: THREE.Vector3[] = []

  const halfLength = length / 2
  const sideArcAngle = THREE.MathUtils.clamp(curve / 2, 0, 1) * Math.PI
  const tubeAmount = THREE.MathUtils.clamp(topCurve / 2, 0, 1)
  const taperAmount = THREE.MathUtils.clamp(taper, 0, 1)
  const endTaperAmount = THREE.MathUtils.clamp(endTaper, 0, 1)
  const spreadAmount = Math.max(0, spread)

  for (let i = 0; i <= lengthSegments; i++) {
    const t = i / lengthSegments
    const sidePoint = getArcPoint(t, halfLength, sideArcAngle)

    centerPoints.push(new THREE.Vector3(
      0,
      sidePoint.y,
      sidePoint.offset
    ))
  }

  const vertices: number[] = []
  const uvs: number[] = []
  const surfaceCount = crossMesh ? 2 : 1

  for (let surfaceIndex = 0; surfaceIndex < surfaceCount; surfaceIndex++) {
    for (let i = 0; i <= lengthSegments; i++) {
      const lengthIndex = surfaceIndex === 0 ? i : lengthSegments - i
      const centerPoint = centerPoints[lengthIndex]
      const widthDirection = new THREE.Vector3(1, 0, 0)
      const tangent = getCenterlineTangent(centerPoints, lengthIndex)
      const normalDirection = getSurfaceNormal(widthDirection, tangent)
      const u = lengthIndex / lengthSegments
      const uvU = i / lengthSegments
      const twistRotation = new THREE.Quaternion().setFromAxisAngle(
        tangent,
        (u - 0.5) * Math.PI * twist
      )
      const twistedWidthDirection = widthDirection.clone().applyQuaternion(twistRotation)
      const twistedNormalDirection = normalDirection.clone().applyQuaternion(twistRotation)
      const surfaceWidthDirection =
        surfaceIndex === 0 ? twistedWidthDirection : twistedNormalDirection
      const surfaceNormalDirection =
        surfaceIndex === 0 ? twistedNormalDirection : getSurfaceNormal(surfaceWidthDirection, tangent)
      const taperProfile = getTaperProfile(u, taperAmount, endTaperAmount)
      const currentThickness =
        thickness *
        taperProfile *
        (1 + spreadAmount * u)
      const tubeRadius = currentThickness / 2

      for (let j = 0; j <= widthSegments; j++) {
        const v = j / widthSegments
        const tubeAngle = v * Math.PI
        const flatWidthOffset = (1 - v * 2) * tubeRadius
        const tubeWidthOffset = Math.cos(tubeAngle) * tubeRadius
        const widthOffset = THREE.MathUtils.lerp(flatWidthOffset, tubeWidthOffset, tubeAmount)
        const tubeProfile = Math.sin(tubeAngle)
        const vertex = centerPoint.clone().addScaledVector(surfaceWidthDirection, widthOffset)
        vertex.addScaledVector(
          surfaceNormalDirection,
          tubeProfile * tubeRadius * tubeAmount * liftDirection
        )

        vertices.push(vertex.x, vertex.y, vertex.z)
        uvs.push(
          surfaceIndex === 0 ? uvU : 1 - uvU,
          surfaceIndex === 0 ? 1 - v : v
        )
      }
    }
  }

  const indices: number[] = []
  const rowStride = widthSegments + 1
  const surfaceStride = rowStride * (lengthSegments + 1)

  for (let surfaceIndex = 0; surfaceIndex < surfaceCount; surfaceIndex++) {
    const surfaceOffset = surfaceIndex * surfaceStride

    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = surfaceOffset + i * rowStride + j
        const b = a + 1
        const c = surfaceOffset + (i + 1) * rowStride + j
        const d = c + 1

        indices.push(a, c, b)
        indices.push(b, c, d)
      }
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  geometry.computeVertexNormals()

  return geometry
}

function getTaperProfile(u: number, startTaper: number, endTaper: number): number {
  const startProfile = Math.sin(THREE.MathUtils.clamp(u * 2, 0, 1) * Math.PI * 0.5)
  const endProfile = Math.sin(THREE.MathUtils.clamp((1 - u) * 2, 0, 1) * Math.PI * 0.5)
  const startWidthScale = THREE.MathUtils.lerp(1 - startTaper, 1, startProfile)
  const endWidthScale = THREE.MathUtils.lerp(1 - endTaper, 1, endProfile)

  return Math.max(0.001, Math.min(startWidthScale, endWidthScale))
}

function getArcPoint(
  t: number,
  halfLength: number,
  arcAngle: number
): { y: number; offset: number } {
  if (arcAngle <= 0.0001) {
    return {
      y: THREE.MathUtils.lerp(-halfLength, halfLength, t),
      offset: 0,
    }
  }

  const halfArcAngle = arcAngle / 2
  const radius = halfLength / Math.sin(halfArcAngle)
  const angle = THREE.MathUtils.lerp(-halfArcAngle, halfArcAngle, t)
  const centerOffset = -radius * Math.cos(halfArcAngle)
  const offset = radius * Math.cos(angle) + centerOffset

  return {
    y: radius * Math.sin(angle),
    offset,
  }
}

function getCenterlineTangent(points: THREE.Vector3[], index: number): THREE.Vector3 {
  const previous = points[Math.max(index - 1, 0)]
  const next = points[Math.min(index + 1, points.length - 1)]
  return next.clone().sub(previous).normalize()
}

function getSurfaceNormal(widthDirection: THREE.Vector3, tangent: THREE.Vector3): THREE.Vector3 {
  const normal = new THREE.Vector3().crossVectors(widthDirection, tangent)

  if (normal.lengthSq() < 0.000001) {
    return new THREE.Vector3(0, 0, 1)
  }

  return normal.normalize()
}
