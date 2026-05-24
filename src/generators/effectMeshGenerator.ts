import * as THREE from 'three'
import { generateSlashMesh } from './slashMeshGenerator'

const ARC_VERTICAL_OFFSET = 1.5

export type EffectMeshType =
  | 'slash'
  | 'ribbon'
  | 'arc'
  | 'spiral'
  | 'risingSpiralRibbon'
  | 'cylinderSpiralRibbon'
  | 'burst'
  | 'plane'
  | 'sphere'
  | 'hemisphere'
  | 'openCylinder'

export interface EffectMeshParams {
  divisions: number
  widthDivisions: number
  thickness: number
  length: number
  curve: number
  topCurve: number
  taper: number
  spread: number
  twist: number
  waveCount: number
}

export const EFFECT_MESH_TYPE_OPTIONS: ReadonlyArray<{
  value: EffectMeshType
  label: string
}> = [
  { value: 'slash', label: 'Slash / Crescent' },
  { value: 'ribbon', label: 'Ribbon / Trail' },
  { value: 'arc', label: 'Arc / Ring Segment' },
  { value: 'spiral', label: 'Spiral / Vortex' },
  { value: 'risingSpiralRibbon', label: 'Rising Spiral Ribbon / Tornado' },
  { value: 'cylinderSpiralRibbon', label: 'Cylinder Spiral Ribbon / Tornado' },
  { value: 'burst', label: 'Radial Burst / Fan' },
  { value: 'plane', label: 'Plane / Quad' },
  { value: 'sphere', label: 'Sphere' },
  { value: 'hemisphere', label: 'Hemisphere' },
  { value: 'openCylinder', label: 'Cylinder / No Caps' },
]

export function generateEffectMesh(
  meshType: EffectMeshType,
  params: EffectMeshParams
): THREE.BufferGeometry {
  switch (meshType) {
    case 'ribbon':
      return generateRibbonMesh(params)
    case 'arc':
      return generateArcMesh(params)
    case 'spiral':
      return generateSpiralMesh(params)
    case 'risingSpiralRibbon':
      return generateRisingSpiralRibbonMesh(params)
    case 'cylinderSpiralRibbon':
      return generateCylinderSpiralRibbonMesh(params)
    case 'burst':
      return generateBurstMesh(params)
    case 'plane':
      return generatePlaneMesh(params)
    case 'sphere':
      return generateSphereMesh(params)
    case 'hemisphere':
      return generateHemisphereMesh(params)
    case 'openCylinder':
      return generateOpenCylinderMesh(params)
    case 'slash':
    default:
      return generateSlashMesh(
        params.divisions,
        params.widthDivisions,
        params.thickness,
        params.length,
        params.curve,
        params.topCurve,
        params.taper
      )
  }
}

function generateRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfLength = params.length / 2
  const curveAmount = getCurveAmount(params)
  const sideOffset = curveAmount * params.length * 0.3
  const liftAmount = getTopCurveAmount(params)
  const waveCount = Math.max(1, params.waveCount)
  const centerPoints: THREE.Vector3[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments
    const x = Math.sin((u - 0.5) * Math.PI * waveCount) * sideOffset
    const y = THREE.MathUtils.lerp(-halfLength, halfLength, u)
    centerPoints.push(new THREE.Vector3(x, y, 0))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i) => {
    const tangent = getPolylineTangent(centerPoints, i)
    const sideDirection = getPlanarSideDirection(tangent)
    const normalDirection = getSurfaceNormalDirection(tangent, sideDirection)
    const twistRotation = new THREE.Quaternion().setFromAxisAngle(
      tangent,
      (u - 0.5) * Math.PI * params.twist
    )
    const twistedSideDirection = sideDirection.clone().applyQuaternion(twistRotation)
    const twistedNormalDirection = normalDirection.clone().applyQuaternion(twistRotation)
    const currentWidth = getTaperedWidth(params, u)
    const vertex = centerPoints[i].clone().addScaledVector(twistedSideDirection, (v - 0.5) * currentWidth)
    vertex.addScaledVector(twistedNormalDirection, Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount)
    return vertex
  })
}

function generateArcMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)

  if (curveAmount <= 0.0001) {
    const halfLength = params.length / 2

    return createGridGeometry(lengthSegments, widthSegments, (u, v) => {
      const currentWidth = getTaperedWidth(params, u)
      const lowerEdgeSpreadProfile = 1 - v

      return new THREE.Vector3(
        THREE.MathUtils.lerp(-halfLength, halfLength, u),
        (v - 0.5) * currentWidth + ARC_VERTICAL_OFFSET,
        Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount +
          lowerEdgeSpreadProfile * currentWidth * spreadAmount
      )
    })
  }

  const arcAngle = curveAmount * Math.PI * 2
  const outerRadius = Math.max(params.length / arcAngle + 1, params.thickness, 0.001)
  const thicknessFillAmount = THREE.MathUtils.clamp((params.thickness - 0.1) / 1.9, 0, 1)
  const taperAmount = THREE.MathUtils.clamp(params.taper, 0, 1)

  return createGridGeometry(lengthSegments, widthSegments, (u, v) => {
    const angle = THREE.MathUtils.lerp(-arcAngle / 2, arcAngle / 2, u)
    const radialDirection = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0)
    const currentWidth = getTaperedWidth(params, u)
    const endSharpnessProfile = Math.sin(Math.PI * u)
    const centerTaperProfile = 1 - taperAmount * 0.5
    const arcTaperProfile =
      THREE.MathUtils.lerp(1, endSharpnessProfile, taperAmount) * centerTaperProfile
    const radialWidth = THREE.MathUtils.lerp(currentWidth, outerRadius, thicknessFillAmount)
    const taperedRadialWidth = radialWidth * arcTaperProfile
    const currentRadius = Math.max(0, outerRadius - (1 - v) * taperedRadialWidth)
    const lowerEdgeSpreadProfile = 1 - v
    const vertex = radialDirection.multiplyScalar(currentRadius)
    vertex.y -= outerRadius
    vertex.y += ARC_VERTICAL_OFFSET
    vertex.z =
      Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount +
      lowerEdgeSpreadProfile * currentWidth * spreadAmount * arcTaperProfile
    return vertex
  })
}

function generateSpiralMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const curveAmount = getCurveAmount(params)
  const turns = THREE.MathUtils.lerp(0.75, 2.25, curveAmount)
  const outerRadius = Math.max(params.length * 0.5, params.thickness)
  const innerRadius = Math.max(params.thickness * 0.2, outerRadius * 0.08)
  const liftAmount = getTopCurveAmount(params)
  const centerPoints: THREE.Vector3[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments
    const angle = u * Math.PI * 2 * turns - Math.PI * 0.5
    const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, u)
    centerPoints.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i) => {
    const tangent = getPolylineTangent(centerPoints, i)
    const sideDirection = getPlanarSideDirection(tangent)
    const currentWidth = getTaperedWidth(params, u)
    const vertex = centerPoints[i].clone().addScaledVector(sideDirection, (v - 0.5) * currentWidth)
    vertex.z += Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount
    return vertex
  })
}

function generateRisingSpiralRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfHeight = params.length / 2
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)
  const turns = Math.max(0.25, params.waveCount) * THREE.MathUtils.lerp(0.5, 1.5, curveAmount)
  const baseRadius = Math.max(params.thickness * 0.2, params.length * 0.025, 0.001)
  const topRadius = baseRadius + params.length * THREE.MathUtils.lerp(0.08, 0.28, curveAmount) * (1 + spreadAmount)
  const centerPoints: THREE.Vector3[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments
    const angle = u * Math.PI * 2 * turns
    const radius = THREE.MathUtils.lerp(baseRadius, topRadius, u)
    const y = THREE.MathUtils.lerp(-halfHeight, halfHeight, u)
    centerPoints.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i) => {
    const tangent = getPolylineTangent(centerPoints, i)
    const radialDirection = getHorizontalRadialDirection(centerPoints[i])
    const sideDirection = getSurfaceSideDirection(tangent, radialDirection)
    const normalDirection = getSurfaceNormalDirection(tangent, sideDirection)
    const twistRotation = new THREE.Quaternion().setFromAxisAngle(
      tangent,
      (u - 0.5) * Math.PI * params.twist
    )
    const twistedSideDirection = sideDirection.clone().applyQuaternion(twistRotation)
    const twistedNormalDirection = normalDirection.clone().applyQuaternion(twistRotation)
    const currentWidth = getTaperedWidth(params, u)
    const vertex = centerPoints[i].clone().addScaledVector(twistedSideDirection, (v - 0.5) * currentWidth)
    vertex.addScaledVector(twistedNormalDirection, Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount)
    return vertex
  })
}

function generateCylinderSpiralRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfHeight = params.length / 2
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)
  const turns = Math.max(0.25, params.waveCount)
  const baseRadius = Math.max(
    params.length * THREE.MathUtils.lerp(0.08, 0.24, curveAmount),
    params.thickness * 0.75,
    0.001
  )
  const centerPoints: THREE.Vector3[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments
    const angle = u * Math.PI * 2 * turns
    const radius = baseRadius * (1 + spreadAmount * u)
    const y = THREE.MathUtils.lerp(-halfHeight, halfHeight, u)
    centerPoints.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i) => {
    const tangent = getPolylineTangent(centerPoints, i)
    const radialDirection = getHorizontalRadialDirection(centerPoints[i])
    const surfaceNormalDirection = getSurfaceSideDirection(tangent, radialDirection)
    const sideDirection = getSideDirectionForSurfaceNormal(tangent, surfaceNormalDirection)
    const twistRotation = new THREE.Quaternion().setFromAxisAngle(
      tangent,
      (u - 0.5) * Math.PI * params.twist
    )
    const twistedSideDirection = sideDirection.clone().applyQuaternion(twistRotation)
    const twistedNormalDirection = surfaceNormalDirection.clone().applyQuaternion(twistRotation)
    const currentWidth = getTaperedWidth(params, u)
    const vertex = centerPoints[i].clone().addScaledVector(twistedSideDirection, (v - 0.5) * currentWidth)
    vertex.addScaledVector(twistedNormalDirection, Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount)
    return vertex
  })
}

function generateBurstMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const curveAmount = getCurveAmount(params)
  const spreadAngle = THREE.MathUtils.lerp(Math.PI * 0.25, Math.PI * 2, curveAmount)
  const outerRadius = Math.max(params.length * 0.5, params.thickness * 0.5)
  const innerRadius = Math.max(outerRadius * 0.02, 0.001)
  const liftAmount = getTopCurveAmount(params)
  const taperAmount = THREE.MathUtils.clamp(params.taper, 0, 1)

  return createGridGeometry(lengthSegments, widthSegments, (u, v) => {
    const fanScale = THREE.MathUtils.lerp(0.18, 1 - taperAmount * 0.45, u)
    const halfAngle = (spreadAngle * fanScale) / 2
    const angle = THREE.MathUtils.lerp(-halfAngle, halfAngle, v) + Math.PI * 0.5
    const edgeScale = THREE.MathUtils.lerp(1, 1 - Math.abs(v - 0.5) * taperAmount * 0.55, u)
    const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, u) * edgeScale
    const vertex = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    vertex.z = Math.sin(Math.PI * u) * params.thickness * 0.5 * liftAmount
    return vertex
  })
}

function generatePlaneMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfLength = params.length / 2
  const liftAmount = getTopCurveAmount(params)

  return createGridGeometry(lengthSegments, widthSegments, (u, v) => {
    const currentWidth = getTaperedWidth(params, u)
    return new THREE.Vector3(
      (v - 0.5) * currentWidth,
      THREE.MathUtils.lerp(-halfLength, halfLength, u),
      Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount
    )
  })
}

function generateSphereMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { latitudeSegments, longitudeSegments } = getSphericalSegmentCounts(params)
  const radius = getSphericalRadius(params)

  return createGridGeometry(latitudeSegments, longitudeSegments, (u, v) => {
    const theta = u * Math.PI
    const phi = -v * Math.PI * 2
    return getSphericalVertex(radius, theta, phi)
  })
}

function generateHemisphereMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { latitudeSegments, longitudeSegments } = getSphericalSegmentCounts(params)
  const radius = getSphericalRadius(params)

  return createGridGeometry(latitudeSegments, longitudeSegments, (u, v) => {
    const theta = u * Math.PI * 0.5
    const phi = -v * Math.PI * 2
    return getSphericalVertex(radius, theta, phi)
  })
}

function generateOpenCylinderMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const heightSegments = Math.max(1, Math.floor(params.divisions))
  const radialSegments = Math.max(8, Math.floor(params.widthDivisions * 4))
  const halfHeight = params.length / 2
  const tubeRadius = Math.max(params.thickness * 0.5, 0.001)
  const curveAmount = getCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)

  return createGridGeometry(heightSegments, radialSegments, (u, v) => {
    const phi = v * Math.PI * 2
    const sideCurveProfile = Math.sin(Math.PI * u)
    const topScale = THREE.MathUtils.lerp(1, 1 + spreadAmount, u)
    const currentRadius = tubeRadius * topScale * (1 + curveAmount * sideCurveProfile * 2)

    return new THREE.Vector3(
      Math.cos(phi) * currentRadius,
      THREE.MathUtils.lerp(-halfHeight, halfHeight, u),
      Math.sin(phi) * currentRadius
    )
  })
}

function createGridGeometry(
  lengthSegments: number,
  widthSegments: number,
  createVertex: (u: number, v: number, i: number, j: number) => THREE.Vector3
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const uvs: number[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments

    for (let j = 0; j <= widthSegments; j++) {
      const v = j / widthSegments
      const vertex = createVertex(u, v, i, j)
      vertices.push(vertex.x, vertex.y, vertex.z)
      uvs.push(u, 1 - v)
    }
  }

  const indices: number[] = []
  const rowStride = widthSegments + 1

  for (let i = 0; i < lengthSegments; i++) {
    for (let j = 0; j < widthSegments; j++) {
      const a = i * rowStride + j
      const b = a + 1
      const c = (i + 1) * rowStride + j
      const d = c + 1

      indices.push(a, c, b)
      indices.push(b, c, d)
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  geometry.computeVertexNormals()

  return geometry
}

function getSegmentCounts(params: EffectMeshParams): {
  lengthSegments: number
  widthSegments: number
} {
  return {
    lengthSegments: Math.max(1, Math.floor(params.divisions)),
    widthSegments: Math.max(1, Math.floor(params.widthDivisions)),
  }
}

function getSphericalSegmentCounts(params: EffectMeshParams): {
  latitudeSegments: number
  longitudeSegments: number
} {
  return {
    latitudeSegments: Math.max(4, Math.floor(params.divisions)),
    longitudeSegments: Math.max(8, Math.floor(params.widthDivisions * 4)),
  }
}

function getSphericalRadius(params: EffectMeshParams): number {
  return Math.max(params.length * 0.5, params.thickness * 0.5, 0.001)
}

function getSphericalVertex(radius: number, theta: number, phi: number): THREE.Vector3 {
  const sinTheta = Math.sin(theta)

  return new THREE.Vector3(
    Math.cos(phi) * sinTheta * radius,
    Math.cos(theta) * radius,
    Math.sin(phi) * sinTheta * radius
  )
}

function getCurveAmount(params: EffectMeshParams): number {
  return THREE.MathUtils.clamp(params.curve / 2, 0, 1)
}

function getTopCurveAmount(params: EffectMeshParams): number {
  return THREE.MathUtils.clamp(params.topCurve / 2, 0, 1)
}

function getTaperedWidth(params: EffectMeshParams, u: number): number {
  const taperAmount = THREE.MathUtils.clamp(params.taper, 0, 1)
  const taperProfile = Math.sin(Math.PI * u)
  return params.thickness * THREE.MathUtils.lerp(1 - taperAmount, 1, taperProfile)
}

function getPolylineTangent(points: THREE.Vector3[], index: number): THREE.Vector3 {
  const previous = points[Math.max(index - 1, 0)]
  const next = points[Math.min(index + 1, points.length - 1)]
  return next.clone().sub(previous).normalize()
}

function getPlanarSideDirection(tangent: THREE.Vector3): THREE.Vector3 {
  const sideDirection = new THREE.Vector3(-tangent.y, tangent.x, 0)

  if (sideDirection.lengthSq() < 0.000001) {
    return new THREE.Vector3(1, 0, 0)
  }

  return sideDirection.normalize()
}

function getHorizontalRadialDirection(point: THREE.Vector3): THREE.Vector3 {
  const radialDirection = new THREE.Vector3(point.x, 0, point.z)

  if (radialDirection.lengthSq() < 0.000001) {
    return new THREE.Vector3(1, 0, 0)
  }

  return radialDirection.normalize()
}

function getSurfaceSideDirection(tangent: THREE.Vector3, preferredDirection: THREE.Vector3): THREE.Vector3 {
  const tangentComponent = preferredDirection.dot(tangent)
  const sideDirection = preferredDirection.clone().addScaledVector(tangent, -tangentComponent)

  if (sideDirection.lengthSq() < 0.000001) {
    return getPlanarSideDirection(tangent)
  }

  return sideDirection.normalize()
}

function getSideDirectionForSurfaceNormal(
  tangent: THREE.Vector3,
  surfaceNormalDirection: THREE.Vector3
): THREE.Vector3 {
  const sideDirection = new THREE.Vector3().crossVectors(surfaceNormalDirection, tangent)

  if (sideDirection.lengthSq() < 0.000001) {
    return getPlanarSideDirection(tangent)
  }

  return sideDirection.normalize()
}

function getSurfaceNormalDirection(tangent: THREE.Vector3, sideDirection: THREE.Vector3): THREE.Vector3 {
  const normalDirection = new THREE.Vector3().crossVectors(tangent, sideDirection)

  if (normalDirection.lengthSq() < 0.000001) {
    return new THREE.Vector3(0, 0, 1)
  }

  return normalDirection.normalize()
}
