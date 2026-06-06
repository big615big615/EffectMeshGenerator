import * as THREE from 'three'
import { generateSlashMesh } from './slashMeshGenerator'

const ARC_VERTICAL_OFFSET = 1.5

export type EffectMeshType =
  | 'slash'
  | 'ribbon'
  | 'lightningRibbon'
  | 'arc'
  | 'arcRibbon'
  | 'spiral'
  | 'risingSpiralRibbon'
  | 'cylinderSpiralRibbon'
  | 'burst'
  | 'plane'
  | 'flatRing'
  | 'sphere'
  | 'hemisphere'
  | 'zHemisphere'
  | 'openCylinder'
  | 'beamDome'

export interface EffectMeshParams {
  divisions: number
  widthDivisions: number
  thickness: number
  length: number
  curve: number
  topCurve: number
  taper: number
  endTaper?: number
  spread: number
  bottomSpread?: number
  twist: number
  waveCount: number
  seed: number
  yClip: number
  cylinderScale: number
  cylinderDivisions?: number
}

export const EFFECT_MESH_TYPE_OPTIONS: ReadonlyArray<{
  value: EffectMeshType
  label: string
}> = [
  { value: 'slash', label: 'Slash / Crescent' },
  { value: 'ribbon', label: 'Ribbon / Trail' },
  { value: 'lightningRibbon', label: 'Lightning Ribbon / Bolt' },
  { value: 'arc', label: 'Arc / Ring Segment' },
  { value: 'arcRibbon', label: 'Ribbon / Curve' },
  { value: 'risingSpiralRibbon', label: 'Rising Spiral Ribbon / Tornado' },
  { value: 'cylinderSpiralRibbon', label: 'Cylinder Spiral Ribbon / Tornado' },
  { value: 'plane', label: 'Plane / Quad' },
  { value: 'flatRing', label: 'Flat Ring' },
  { value: 'sphere', label: 'Sphere' },
  { value: 'hemisphere', label: 'Hemisphere' },
  { value: 'zHemisphere', label: 'Z Hemisphere' },
  { value: 'openCylinder', label: 'Cylinder / No Caps' },
  { value: 'beamDome', label: 'Beam / Dome Cap' },
]

export function generateEffectMesh(
  meshType: EffectMeshType,
  params: EffectMeshParams
): THREE.BufferGeometry {
  switch (meshType) {
    case 'ribbon':
      return generateRibbonMesh(params)
    case 'lightningRibbon':
      return generateLightningRibbonMesh(params)
    case 'arc':
      return generateArcMesh(params)
    case 'arcRibbon':
      return generateArcRibbonMesh(params)
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
    case 'flatRing':
      return generateFlatRingMesh(params)
    case 'sphere':
      return generateSphereMesh(params)
    case 'hemisphere':
      return generateHemisphereMesh(params)
    case 'zHemisphere':
      return generateZHemisphereMesh(params)
    case 'openCylinder':
      return generateOpenCylinderMesh(params)
    case 'beamDome':
      return generateBeamDomeMesh(params)
    case 'slash':
    default:
      return generateSlashEffectMesh(params)
  }
}

export function generateDoubleSidedSlashMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateSlashEffectMesh(params, 1)
  const backGeometry = generateSlashEffectMesh(params, -1)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
}

export function generateCrossSlashMesh(params: EffectMeshParams): THREE.BufferGeometry {
  return generateSlashEffectMesh(params, 1, true)
}

export function generateDoubleSidedCrossSlashMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateSlashEffectMesh(params, 1, true)
  const backGeometry = generateSlashEffectMesh(params, -1, true)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
}

export function generateCrossEffectMesh(
  meshType: EffectMeshType,
  params: EffectMeshParams
): THREE.BufferGeometry {
  switch (meshType) {
    case 'arc':
      return generateArcMesh(params, true)
    case 'arcRibbon':
      return generateArcRibbonMesh(params, 1, true)
    case 'openCylinder':
      return generateCrossOpenCylinderMesh(params)
    case 'ribbon':
      return generateRibbonMesh(params, 1, true)
    case 'lightningRibbon':
      return generateLightningRibbonMesh(params, 1, true)
    case 'risingSpiralRibbon':
      return generateRisingSpiralRibbonMesh(params, 1, true)
    case 'cylinderSpiralRibbon':
      return generateCylinderSpiralRibbonMesh(params, 1, true)
    case 'plane':
      return generatePlaneMesh(params, true)
    case 'flatRing':
      return generateFlatRingMesh(params, true)
    case 'slash':
      return generateCrossSlashMesh(params)
    default:
      return generateEffectMesh(meshType, params)
  }
}

export function generateDoubleSidedCrossEffectMesh(
  meshType: EffectMeshType,
  params: EffectMeshParams
): THREE.BufferGeometry {
  switch (meshType) {
    case 'arcRibbon': {
      const frontGeometry = generateArcRibbonMesh(params, 1, true)
      const backGeometry = generateArcRibbonMesh(params, -1, true)
      const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

      frontGeometry.dispose()
      backGeometry.dispose()
      return combinedGeometry
    }
    case 'openCylinder': {
      const frontGeometry = generateCrossOpenCylinderMesh(params, 1)
      const backGeometry = generateCrossOpenCylinderMesh(params, -1)
      const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

      frontGeometry.dispose()
      backGeometry.dispose()
      return combinedGeometry
    }
    case 'ribbon': {
      const frontGeometry = generateRibbonMesh(params, 1, true)
      const backGeometry = generateRibbonMesh(params, -1, true)
      const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

      frontGeometry.dispose()
      backGeometry.dispose()
      return combinedGeometry
    }
    case 'lightningRibbon': {
      const frontGeometry = generateLightningRibbonMesh(params, 1, true)
      const backGeometry = generateLightningRibbonMesh(params, -1, true)
      const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

      frontGeometry.dispose()
      backGeometry.dispose()
      return combinedGeometry
    }
    case 'risingSpiralRibbon': {
      const frontGeometry = generateRisingSpiralRibbonMesh(params, 1, true)
      const backGeometry = generateRisingSpiralRibbonMesh(params, -1, true)
      const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

      frontGeometry.dispose()
      backGeometry.dispose()
      return combinedGeometry
    }
    case 'cylinderSpiralRibbon': {
      const frontGeometry = generateCylinderSpiralRibbonMesh(params, 1, true)
      const backGeometry = generateCylinderSpiralRibbonMesh(params, -1, true)
      const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

      frontGeometry.dispose()
      backGeometry.dispose()
      return combinedGeometry
    }
    case 'slash':
      return generateDoubleSidedCrossSlashMesh(params)
    default:
      return generateCrossEffectMesh(meshType, params)
  }
}

function generateSlashEffectMesh(
  params: EffectMeshParams,
  liftDirection = 1,
  crossMesh = false
): THREE.BufferGeometry {
  return generateSlashMesh(
    params.divisions,
    params.widthDivisions,
    params.thickness,
    params.length,
    params.curve,
    params.topCurve,
    params.taper,
    params.endTaper,
    params.twist,
    params.spread,
    liftDirection,
    crossMesh
  )
}

function generateRibbonMesh(
  params: EffectMeshParams,
  liftDirection = 1,
  crossMesh = false
): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfLength = params.length / 2
  const curveAmount = getCurveAmount(params)
  const sideOffset = curveAmount * params.length * 0.3
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)
  const waveCount = Math.max(1, params.waveCount)
  const waveOffset = getSeededPhaseOffset(params.seed)
  const centerPoints: THREE.Vector3[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments
    const amplitudeScale = 1 + spreadAmount * u
    const x = Math.sin((u - 0.5) * Math.PI * waveCount + waveOffset) * sideOffset * amplitudeScale
    const y = THREE.MathUtils.lerp(-halfLength, halfLength, u)
    centerPoints.push(new THREE.Vector3(x, y, 0))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i, _j, surfaceIndex) => {
    const tangent = getPolylineTangent(centerPoints, i)
    const sideDirection = getPlanarSideDirection(tangent)
    const normalDirection = getSurfaceNormalDirection(tangent, sideDirection)
    const twistRotation = new THREE.Quaternion().setFromAxisAngle(
      tangent,
      (u - 0.5) * Math.PI * params.twist
    )
    const twistedSideDirection = sideDirection.clone().applyQuaternion(twistRotation)
    const twistedNormalDirection = normalDirection.clone().applyQuaternion(twistRotation)
    const surfaceSideDirection =
      surfaceIndex === 0 ? twistedSideDirection : twistedNormalDirection
    const surfaceNormalDirection =
      surfaceIndex === 0
        ? twistedNormalDirection
        : getSurfaceNormalDirection(tangent, surfaceSideDirection)
    const currentWidth = getTaperedWidth(params, u)
    const vertex = centerPoints[i].clone().addScaledVector(surfaceSideDirection, (v - 0.5) * currentWidth)
    vertex.addScaledVector(
      surfaceNormalDirection,
      Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount * liftDirection
    )
    return vertex
  }, crossMesh ? 2 : 1)
}

export function generateDoubleSidedRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateRibbonMesh(params, 1)
  const backGeometry = generateRibbonMesh(params, -1)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
}

function generateLightningRibbonMesh(
  params: EffectMeshParams,
  liftDirection = 1,
  crossMesh = false
): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfLength = params.length / 2
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params) * liftDirection
  const depthAmount = Math.max(0, params.spread)
  const bendCount = Math.max(2, Math.round(params.waveCount * 2))
  const sideAmplitude = params.length * THREE.MathUtils.lerp(0.03, 0.22, curveAmount)
  const depthAmplitude = params.length * 0.08 * depthAmount
  const noiseSeed = Math.floor(params.seed)
  const anchorPoints: THREE.Vector3[] = []
  const centerPoints: THREE.Vector3[] = []

  for (let i = 0; i <= bendCount; i++) {
    const u = i / bendCount
    const endFade = Math.sin(Math.PI * u)
    const x = getSignedNoise(i, 19.73, noiseSeed) * sideAmplitude * endFade
    const z = getSignedNoise(i, 47.11, noiseSeed) * depthAmplitude * endFade
    const y = THREE.MathUtils.lerp(-halfLength, halfLength, u)
    anchorPoints.push(new THREE.Vector3(x, y, z))
  }

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments
    const scaledU = u * bendCount
    const anchorIndex = Math.min(Math.floor(scaledU), bendCount - 1)
    const segmentU = scaledU - anchorIndex
    centerPoints.push(anchorPoints[anchorIndex].clone().lerp(anchorPoints[anchorIndex + 1], segmentU))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i, _j, surfaceIndex) => {
    const tangent = getPolylineTangent(centerPoints, i)
    const sideDirection = getPlanarSideDirection(tangent)
    const normalDirection = getSurfaceNormalDirection(tangent, sideDirection)
    const twistRotation = new THREE.Quaternion().setFromAxisAngle(
      tangent,
      (u - 0.5) * Math.PI * params.twist
    )
    const twistedSideDirection = sideDirection.clone().applyQuaternion(twistRotation)
    const twistedNormalDirection = normalDirection.clone().applyQuaternion(twistRotation)
    const surfaceSideDirection =
      surfaceIndex === 0 ? twistedSideDirection : twistedNormalDirection
    const surfaceNormalDirection =
      surfaceIndex === 0
        ? twistedNormalDirection
        : getSurfaceNormalDirection(tangent, surfaceSideDirection)
    const currentWidth = getTaperedWidth(params, u)
    const vertex = centerPoints[i].clone().addScaledVector(surfaceSideDirection, (v - 0.5) * currentWidth)
    vertex.addScaledVector(surfaceNormalDirection, Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount)
    return vertex
  }, crossMesh ? 2 : 1)
}

export function generateDoubleSidedLightningRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateLightningRibbonMesh(params, 1)
  const backGeometry = generateLightningRibbonMesh(params, -1)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
}

function generateArcMesh(params: EffectMeshParams, crossMesh = false): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)

  if (curveAmount <= 0.0001) {
    const halfLength = params.length / 2

    const geometry = createGridGeometry(lengthSegments, widthSegments, (u, v, _i, _j, surfaceIndex) => {
      const currentWidth = getTaperedWidth(params, u)
      const lowerEdgeSpreadProfile = 1 - v
      const sideOffset = (v - 0.5) * currentWidth
      const normalOffset =
        Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount +
        lowerEdgeSpreadProfile * currentWidth * spreadAmount

      if (surfaceIndex === 1) {
        return new THREE.Vector3(
          THREE.MathUtils.lerp(-halfLength, halfLength, u),
          ARC_VERTICAL_OFFSET + normalOffset,
          sideOffset
        )
      }

      return new THREE.Vector3(
        THREE.MathUtils.lerp(-halfLength, halfLength, u),
        sideOffset + ARC_VERTICAL_OFFSET,
        normalOffset
      )
    }, crossMesh ? 2 : 1)

    return geometry
  }

  const arcAngle = curveAmount * Math.PI * 2
  const outerRadius = Math.max(params.length / arcAngle + 1, params.thickness, 0.001)
  const thicknessFillAmount = THREE.MathUtils.clamp((params.thickness - 0.1) / 1.9, 0, 1)
  const taperAmount = getMaxTaperAmount(params)

  const geometry = createGridGeometry(lengthSegments, widthSegments, (u, v, _i, _j, surfaceIndex) => {
    const angle = THREE.MathUtils.lerp(-arcAngle / 2, arcAngle / 2, u)
    const radialDirection = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0)
    const currentWidth = getTaperedWidth(params, u)
    const centerTaperProfile = 1 - taperAmount * 0.5
    const arcTaperProfile = getTaperProfile(params, u) * centerTaperProfile
    const radialWidth = THREE.MathUtils.lerp(currentWidth, outerRadius, thicknessFillAmount)
    const taperedRadialWidth = radialWidth * arcTaperProfile
    const currentRadius = Math.max(0, outerRadius - (1 - v) * taperedRadialWidth)
    const centerRadius = Math.max(0, outerRadius - taperedRadialWidth * 0.5)
    const sideOffset = (0.5 - v) * taperedRadialWidth
    const lowerEdgeSpreadProfile = 1 - v
    const normalOffset =
      Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount +
      lowerEdgeSpreadProfile * currentWidth * spreadAmount * arcTaperProfile

    if (surfaceIndex === 1) {
      const vertex = radialDirection.clone().multiplyScalar(centerRadius + normalOffset)
      vertex.y -= outerRadius
      vertex.y += ARC_VERTICAL_OFFSET
      vertex.z = -sideOffset
      return vertex
    }

    const vertex = radialDirection.multiplyScalar(currentRadius)
    vertex.y -= outerRadius
    vertex.y += ARC_VERTICAL_OFFSET
    vertex.z = normalOffset
    return vertex
  }, crossMesh ? 2 : 1)

  return geometry
}

function generateArcRibbonMesh(
  params: EffectMeshParams,
  liftDirection = 1,
  crossMesh = false
): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params) * liftDirection
  const spreadAmount = Math.max(0, params.spread)

  if (curveAmount <= 0.0001) {
    const halfLength = params.length / 2

    return createGridGeometry(lengthSegments, widthSegments, (u, v, _i, _j, surfaceIndex) => {
      const tangent = new THREE.Vector3(1, 0, 0)
      const sideDirection = new THREE.Vector3(0, 1, 0)
      const normalDirection = new THREE.Vector3(0, 0, 1)
      const twistRotation = new THREE.Quaternion().setFromAxisAngle(
        tangent,
        (u - 0.5) * Math.PI * params.twist
      )
      const currentWidth = getTaperedWidth(params, u)
      const lowerEdgeSpreadProfile = 1 - v
      const sideOffset = (v - 0.5) * currentWidth
      const normalOffset =
        Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount +
        lowerEdgeSpreadProfile * currentWidth * spreadAmount
      const twistedSideDirection = sideDirection.clone().applyQuaternion(twistRotation)
      const twistedNormalDirection = normalDirection.clone().applyQuaternion(twistRotation)
      const surfaceSideDirection =
        surfaceIndex === 0 ? twistedSideDirection : twistedNormalDirection
      const surfaceNormalDirection =
        surfaceIndex === 0
          ? twistedNormalDirection
          : getSurfaceNormalDirection(tangent, surfaceSideDirection)

      return new THREE.Vector3(
        THREE.MathUtils.lerp(-halfLength, halfLength, u),
        ARC_VERTICAL_OFFSET,
        0
      )
        .addScaledVector(surfaceSideDirection, sideOffset)
        .addScaledVector(surfaceNormalDirection, normalOffset)
    }, crossMesh ? 2 : 1)
  }

  const arcAngle = curveAmount * Math.PI * 2
  const outerRadius = Math.max(params.length / arcAngle + 1, params.thickness, 0.001)
  const thicknessFillAmount = THREE.MathUtils.clamp((params.thickness - 0.1) / 1.9, 0, 1)
  const taperAmount = getMaxTaperAmount(params)

  return createGridGeometry(lengthSegments, widthSegments, (u, v, _i, _j, surfaceIndex) => {
    const angle = THREE.MathUtils.lerp(-arcAngle / 2, arcAngle / 2, u)
    const radialDirection = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0)
    const tangent = new THREE.Vector3(Math.cos(angle), -Math.sin(angle), 0)
    const normalDirection = new THREE.Vector3(0, 0, 1)
    const twistRotation = new THREE.Quaternion().setFromAxisAngle(
      tangent,
      (u - 0.5) * Math.PI * params.twist
    )
    const currentWidth = getTaperedWidth(params, u)
    const centerTaperProfile = 1 - taperAmount * 0.5
    const arcTaperProfile = getTaperProfile(params, u) * centerTaperProfile
    const radialWidth = THREE.MathUtils.lerp(currentWidth, outerRadius, thicknessFillAmount)
    const taperedRadialWidth = radialWidth * arcTaperProfile
    const centerRadius = Math.max(0, outerRadius - taperedRadialWidth * 0.5)
    const sideOffset = (v - 0.5) * taperedRadialWidth
    const lowerEdgeSpreadProfile = 1 - v
    const normalOffset =
      Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount +
      lowerEdgeSpreadProfile * currentWidth * spreadAmount * arcTaperProfile
    const twistedSideDirection = radialDirection.clone().applyQuaternion(twistRotation)
    const twistedNormalDirection = normalDirection.clone().applyQuaternion(twistRotation)
    const surfaceSideDirection =
      surfaceIndex === 0 ? twistedSideDirection : twistedNormalDirection
    const surfaceNormalDirection =
      surfaceIndex === 0
        ? twistedNormalDirection
        : getSurfaceNormalDirection(tangent, surfaceSideDirection)
    const vertex = radialDirection.clone().multiplyScalar(centerRadius)
    vertex.y -= outerRadius
    vertex.y += ARC_VERTICAL_OFFSET
    vertex
      .addScaledVector(surfaceSideDirection, sideOffset)
      .addScaledVector(surfaceNormalDirection, normalOffset)
    return vertex
  }, crossMesh ? 2 : 1)
}

export function generateDoubleSidedArcRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateArcRibbonMesh(params, 1)
  const backGeometry = generateArcRibbonMesh(params, -1)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
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

function generateRisingSpiralRibbonMesh(
  params: EffectMeshParams,
  liftDirection = 1,
  crossMesh = false
): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfHeight = params.length / 2
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params) * liftDirection
  const spreadAmount = Math.max(0, params.spread)
  const bottomSpreadAmount = Math.max(0, params.bottomSpread ?? 0)
  const turns = Math.max(0.25, params.waveCount) * THREE.MathUtils.lerp(0.5, 1.5, curveAmount)
  const baseRadius = Math.max(params.thickness * 0.2, params.length * 0.025, 0.001)
  const bottomRadius = baseRadius * (1 + bottomSpreadAmount * 10)
  const topRadius = baseRadius + params.length * THREE.MathUtils.lerp(0.08, 0.28, curveAmount) * (1 + spreadAmount)
  const centerPoints: THREE.Vector3[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    const u = i / lengthSegments
    const angle = u * Math.PI * 2 * turns
    const radius = THREE.MathUtils.lerp(bottomRadius, topRadius, u)
    const y = THREE.MathUtils.lerp(-halfHeight, halfHeight, u)
    centerPoints.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i, _j, surfaceIndex) => {
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
    const surfaceSideDirection =
      surfaceIndex === 0 ? twistedSideDirection : twistedNormalDirection
    const surfaceNormalDirection =
      surfaceIndex === 0
        ? twistedNormalDirection
        : getSurfaceNormalDirection(tangent, surfaceSideDirection)
    const currentWidth = getTaperedWidth(params, u)
    const vertex = centerPoints[i].clone().addScaledVector(surfaceSideDirection, (v - 0.5) * currentWidth)
    vertex.addScaledVector(surfaceNormalDirection, Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount)
    return vertex
  }, crossMesh ? 2 : 1)
}

export function generateDoubleSidedRisingSpiralRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateRisingSpiralRibbonMesh(params, 1)
  const backGeometry = generateRisingSpiralRibbonMesh(params, -1)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
}

function generateCylinderSpiralRibbonMesh(
  params: EffectMeshParams,
  liftDirection = 1,
  crossMesh = false
): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfHeight = params.length / 2
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params) * liftDirection
  const spreadAmount = Math.max(0, params.spread)
  const bottomSpreadAmount = Math.max(0, params.bottomSpread ?? 0)
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
    const radius = baseRadius * (1 + bottomSpreadAmount * (1 - u) + spreadAmount * u)
    const y = THREE.MathUtils.lerp(-halfHeight, halfHeight, u)
    centerPoints.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
  }

  return createGridGeometry(lengthSegments, widthSegments, (u, v, i, _j, surfaceIndex) => {
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
    const crossSurfaceSideDirection =
      surfaceIndex === 0 ? twistedSideDirection : twistedNormalDirection
    const crossSurfaceNormalDirection =
      surfaceIndex === 0
        ? twistedNormalDirection
        : getSurfaceNormalDirection(tangent, crossSurfaceSideDirection)
    const currentWidth = getTaperedWidth(params, u)
    const sideOffset = (surfaceIndex === 1 ? 0.5 - v : v - 0.5) * currentWidth
    const vertex = centerPoints[i].clone().addScaledVector(crossSurfaceSideDirection, sideOffset)
    vertex.addScaledVector(crossSurfaceNormalDirection, Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount)
    return vertex
  }, crossMesh ? 2 : 1)
}

export function generateDoubleSidedCylinderSpiralRibbonMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateCylinderSpiralRibbonMesh(params, 1)
  const backGeometry = generateCylinderSpiralRibbonMesh(params, -1)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
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

function generatePlaneMesh(params: EffectMeshParams, crossMesh = false): THREE.BufferGeometry {
  const { lengthSegments, widthSegments } = getSegmentCounts(params)
  const halfLength = params.length / 2
  const liftAmount = getTopCurveAmount(params)

  return createGridGeometry(lengthSegments, widthSegments, (u, v, _i, _j, surfaceIndex) => {
    const currentWidth = getTaperedWidth(params, u)
    const sideOffset = (0.5 - v) * currentWidth
    const normalOffset = Math.sin(Math.PI * v) * currentWidth * 0.5 * liftAmount

    if (surfaceIndex === 1) {
      return new THREE.Vector3(
        normalOffset,
        THREE.MathUtils.lerp(-halfLength, halfLength, u),
        sideOffset
      )
    }

    return new THREE.Vector3(
      sideOffset,
      THREE.MathUtils.lerp(-halfLength, halfLength, u),
      normalOffset
    )
  }, crossMesh ? 2 : 1)
}

function generateFlatRingMesh(params: EffectMeshParams, crossMesh = false): THREE.BufferGeometry {
  const radialSegments = Math.max(3, Math.floor(params.divisions))
  const widthSegments = Math.max(1, Math.floor(params.widthDivisions))
  const outerRadius = Math.max(params.length * 0.5, params.thickness, 0.001)
  const innerRadius = Math.max(outerRadius - params.thickness, 0.001)
  const centerRadius = (outerRadius + innerRadius) * 0.5
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)

  return createGridGeometry(radialSegments, widthSegments, (u, v, _i, _j, surfaceIndex) => {
    const angle = u * Math.PI * 2 + params.twist * Math.PI * v
    const radialDirection = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0)
    const radius = THREE.MathUtils.lerp(outerRadius, innerRadius, v)
    const innerEdgeProfile = v
    const z =
      Math.sin(Math.PI * v) * params.thickness * 0.5 * liftAmount +
      innerEdgeProfile * params.thickness * spreadAmount

    if (surfaceIndex === 1) {
      const sideOffset = (0.5 - v) * params.thickness
      return radialDirection.multiplyScalar(centerRadius + z).setZ(sideOffset)
    }

    return new THREE.Vector3(
      radialDirection.x * radius,
      radialDirection.y * radius,
      z
    )
  }, crossMesh ? 2 : 1)
}

function generateSphereMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { latitudeSegments, longitudeSegments } = getSphericalSegmentCounts(params)
  const radius = getSphericalRadius(params)
  const yClipAmount = THREE.MathUtils.clamp(params.yClip, 0, 1)
  const maxTheta = THREE.MathUtils.lerp(Math.PI, 0.001, yClipAmount)

  const geometry = createGridGeometry(latitudeSegments, longitudeSegments, (u, v) => {
    const theta = u * maxTheta
    const phi = -v * Math.PI * 2 + (1 - u) * params.twist * Math.PI
    return getSphericalVertex(radius, theta, phi)
  })

  rotateUVs180(geometry)
  return geometry
}

function generateHemisphereMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { latitudeSegments, longitudeSegments } = getSphericalSegmentCounts(params)
  const radius = getSphericalRadius(params)

  const geometry = createGridGeometry(latitudeSegments, longitudeSegments, (u, v) => {
    const theta = u * Math.PI * 0.5
    const phi = -v * Math.PI * 2 + (1 - u) * params.twist * Math.PI
    return getSphericalVertex(radius, theta, phi)
  })

  rotateUVs180(geometry)
  return geometry
}

function generateZHemisphereMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const { latitudeSegments, longitudeSegments } = getSphericalSegmentCounts(params)
  const radius = getSphericalRadius(params)
  const yClipAmount = THREE.MathUtils.clamp(params.yClip, 0, 1)
  const maxTheta = THREE.MathUtils.lerp(Math.PI, 0.001, yClipAmount)

  const geometry = createGridGeometry(latitudeSegments, longitudeSegments, (u, v) => {
    const theta = u * maxTheta
    const phi = -Math.PI - v * Math.PI
    return getSphericalVertex(radius, theta, phi)
  })

  rotateUVs180(geometry)
  return geometry
}

function generateOpenCylinderMesh(
  params: EffectMeshParams,
  liftDirection = 1
): THREE.BufferGeometry {
  const heightSegments = Math.max(1, Math.floor(params.divisions))
  const radialSegments = Math.max(8, Math.floor(params.widthDivisions * 4))
  const sizeScale = 2
  const halfHeight = (params.length * sizeScale) / 2
  const tubeRadius = Math.max(params.thickness * sizeScale * 0.5, 0.001)
  const curveAmount = getCurveAmount(params)
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)

  return createGridGeometry(heightSegments, radialSegments, (u, v) => {
    const phi = v * Math.PI * 2 + u * params.twist * Math.PI
    const sideCurveProfile = Math.sin(Math.PI * u)
    const topScale = THREE.MathUtils.lerp(1, 1 + spreadAmount, u)
    const radiusScale = 1 + (curveAmount + liftAmount * liftDirection) * sideCurveProfile * 2
    const currentRadius = Math.max(tubeRadius * topScale * radiusScale, 0.001)

    return new THREE.Vector3(
      Math.cos(phi) * currentRadius,
      THREE.MathUtils.lerp(-halfHeight, halfHeight, u),
      Math.sin(phi) * currentRadius
    )
  })
}

export function generateDoubleSidedOpenCylinderMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frontGeometry = generateOpenCylinderMesh(params, 1)
  const backGeometry = generateOpenCylinderMesh(params, -1)
  const combinedGeometry = combineOppositeFacingGeometries(frontGeometry, backGeometry)

  frontGeometry.dispose()
  backGeometry.dispose()
  return combinedGeometry
}

function generateCrossOpenCylinderMesh(
  params: EffectMeshParams,
  liftDirection = 1
): THREE.BufferGeometry {
  const primaryGeometry = generateOpenCylinderMesh(params, liftDirection)
  const crossGeometry = generateOpenCylinderMesh(params, liftDirection)
  crossGeometry.rotateX(Math.PI * 0.5)
  rotateUVs180(crossGeometry)
  const combinedGeometry = combineSameFacingGeometries(primaryGeometry, crossGeometry)

  primaryGeometry.dispose()
  crossGeometry.dispose()
  return combinedGeometry
}

function generateBeamDomeMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const capSegments = Math.max(1, Math.floor(params.divisions))
  const cylinderSegments = Math.max(1, Math.floor(params.cylinderDivisions ?? 2))
  const radialSegments = Math.max(8, Math.floor(params.widthDivisions * 4))
  const radius = Math.max(params.thickness * 0.5, 0.001)
  const liftAmount = getTopCurveAmount(params)
  const spreadAmount = Math.max(0, params.spread)
  const baseCylinderHeight = Math.max(params.length - radius, radius * 0.1)
  const cylinderScale = THREE.MathUtils.clamp(params.cylinderScale, 0, 1)
  const cylinderHeight = baseCylinderHeight * cylinderScale
  const capBaseY = (baseCylinderHeight - radius) / 2
  const bottomY = capBaseY - cylinderHeight
  const capTipY = capBaseY + radius
  const cylinderRatio = baseCylinderHeight / (baseCylinderHeight + radius)
  const uRows: number[] = []

  for (let i = 0; i <= cylinderSegments; i++) {
    uRows.push((cylinderRatio * i) / cylinderSegments)
  }

  for (let i = 1; i <= capSegments; i++) {
    uRows.push(cylinderRatio + ((1 - cylinderRatio) * i) / capSegments)
  }

  const geometry = createGridGeometryFromURows(uRows, radialSegments, (u, v) => {
    const phi = v * Math.PI * 2
    const cylinderU = Math.min(u / cylinderRatio, 1)
    const spreadProfile = Math.pow(1 - u, 2)
    const liftProfile = Math.sin(Math.PI * u)
    let currentRadius = radius * (1 + spreadAmount * spreadProfile + liftAmount * liftProfile * 2)
    let y = THREE.MathUtils.lerp(bottomY, capBaseY, cylinderU)

    if (u > cylinderRatio) {
      const capU = (u - cylinderRatio) / Math.max(1 - cylinderRatio, 0.0001)
      const capAngle = capU * Math.PI * 0.5
      currentRadius = Math.cos(capAngle) * radius * (1 + spreadAmount * spreadProfile + liftAmount * liftProfile * 2)
      y = capBaseY + Math.sin(capAngle) * radius
    }

    const vertex = new THREE.Vector3(
      Math.cos(phi) * currentRadius,
      y,
      Math.sin(phi) * currentRadius
    )
    vertex.y -= capTipY
    vertex.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * -0.5)
    vertex.applyAxisAngle(new THREE.Vector3(0, 0, 1), (1 - u) * params.twist * Math.PI)
    return vertex
  })

  rotateUVs180(geometry)
  return geometry
}

function createGridGeometry(
  lengthSegments: number,
  widthSegments: number,
  createVertex: (u: number, v: number, i: number, j: number, surfaceIndex: number) => THREE.Vector3,
  surfaceCount = 1
): THREE.BufferGeometry {
  const uRows: number[] = []

  for (let i = 0; i <= lengthSegments; i++) {
    uRows.push(i / lengthSegments)
  }

  return createGridGeometryFromURows(uRows, widthSegments, createVertex, surfaceCount)
}

function createGridGeometryFromURows(
  uRows: number[],
  widthSegments: number,
  createVertex: (u: number, v: number, i: number, j: number, surfaceIndex: number) => THREE.Vector3,
  surfaceCount = 1
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const uvs: number[] = []
  const lengthSegments = uRows.length - 1

  for (let surfaceIndex = 0; surfaceIndex < surfaceCount; surfaceIndex++) {
    for (let i = 0; i < uRows.length; i++) {
      const rowIndex = surfaceIndex === 0 ? i : lengthSegments - i
      const u = uRows[rowIndex]
      const uvU = uRows[i]

      for (let j = 0; j <= widthSegments; j++) {
        const v = j / widthSegments
        const vertex = createVertex(u, v, rowIndex, j, surfaceIndex)
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

function combineSameFacingGeometries(
  primaryGeometry: THREE.BufferGeometry,
  secondaryGeometry: THREE.BufferGeometry
): THREE.BufferGeometry {
  const primaryPosition = primaryGeometry.getAttribute('position')
  const secondaryPosition = secondaryGeometry.getAttribute('position')
  const primaryUV = primaryGeometry.getAttribute('uv')
  const secondaryUV = secondaryGeometry.getAttribute('uv')
  const primaryIndex = primaryGeometry.index
  const secondaryIndex = secondaryGeometry.index
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i < primaryPosition.count; i++) {
    positions.push(primaryPosition.getX(i), primaryPosition.getY(i), primaryPosition.getZ(i))

    if (primaryUV) {
      uvs.push(primaryUV.getX(i), primaryUV.getY(i))
    }
  }

  for (let i = 0; i < secondaryPosition.count; i++) {
    positions.push(secondaryPosition.getX(i), secondaryPosition.getY(i), secondaryPosition.getZ(i))

    if (secondaryUV) {
      uvs.push(secondaryUV.getX(i), secondaryUV.getY(i))
    }
  }

  if (primaryIndex) {
    for (let i = 0; i < primaryIndex.count; i++) {
      indices.push(primaryIndex.getX(i))
    }
  } else {
    for (let i = 0; i < primaryPosition.count; i++) {
      indices.push(i)
    }
  }

  const secondaryVertexOffset = primaryPosition.count
  if (secondaryIndex) {
    for (let i = 0; i < secondaryIndex.count; i++) {
      indices.push(secondaryVertexOffset + secondaryIndex.getX(i))
    }
  } else {
    for (let i = 0; i < secondaryPosition.count; i++) {
      indices.push(secondaryVertexOffset + i)
    }
  }

  const combinedGeometry = new THREE.BufferGeometry()
  combinedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))

  if (primaryUV && secondaryUV) {
    combinedGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  }

  combinedGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  combinedGeometry.computeVertexNormals()
  return combinedGeometry
}

function combineOppositeFacingGeometries(
  frontGeometry: THREE.BufferGeometry,
  backGeometry: THREE.BufferGeometry
): THREE.BufferGeometry {
  const frontPosition = frontGeometry.getAttribute('position')
  const backPosition = backGeometry.getAttribute('position')
  const frontUV = frontGeometry.getAttribute('uv')
  const backUV = backGeometry.getAttribute('uv')
  const frontIndex = frontGeometry.index
  const backIndex = backGeometry.index
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i < frontPosition.count; i++) {
    positions.push(frontPosition.getX(i), frontPosition.getY(i), frontPosition.getZ(i))

    if (frontUV) {
      uvs.push(frontUV.getX(i), frontUV.getY(i))
    }
  }

  for (let i = 0; i < backPosition.count; i++) {
    positions.push(backPosition.getX(i), backPosition.getY(i), backPosition.getZ(i))

    if (backUV) {
      uvs.push(backUV.getX(i), backUV.getY(i))
    }
  }

  if (frontIndex) {
    for (let i = 0; i < frontIndex.count; i++) {
      indices.push(frontIndex.getX(i))
    }
  } else {
    for (let i = 0; i < frontPosition.count; i++) {
      indices.push(i)
    }
  }

  const backVertexOffset = frontPosition.count
  if (backIndex) {
    for (let i = 0; i < backIndex.count; i += 3) {
      indices.push(
        backVertexOffset + backIndex.getX(i),
        backVertexOffset + backIndex.getX(i + 2),
        backVertexOffset + backIndex.getX(i + 1)
      )
    }
  } else {
    for (let i = 0; i < backPosition.count; i += 3) {
      indices.push(backVertexOffset + i, backVertexOffset + i + 2, backVertexOffset + i + 1)
    }
  }

  const combinedGeometry = new THREE.BufferGeometry()
  combinedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))

  if (frontUV && backUV) {
    combinedGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  }

  combinedGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  combinedGeometry.computeVertexNormals()
  return combinedGeometry
}

function rotateUVs180(geometry: THREE.BufferGeometry): void {
  const uvAttribute = geometry.getAttribute('uv')
  if (!uvAttribute) return

  for (let i = 0; i < uvAttribute.count; i++) {
    uvAttribute.setXY(i, 1 - uvAttribute.getX(i), 1 - uvAttribute.getY(i))
  }

  uvAttribute.needsUpdate = true
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
    latitudeSegments: Math.max(2, Math.floor(params.divisions)),
    longitudeSegments: Math.max(8, Math.floor(params.widthDivisions * 4)),
  }
}

function getSphericalRadius(params: EffectMeshParams): number {
  return Math.max(params.length * 0.5, 0.001)
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
  return params.thickness * getTaperProfile(params, u)
}

function getTaperProfile(params: EffectMeshParams, u: number): number {
  const startTaper = THREE.MathUtils.clamp(params.taper, 0, 1)
  const endTaper = THREE.MathUtils.clamp(params.endTaper ?? params.taper, 0, 1)
  const startProfile = Math.sin(THREE.MathUtils.clamp(u * 2, 0, 1) * Math.PI * 0.5)
  const endProfile = Math.sin(THREE.MathUtils.clamp((1 - u) * 2, 0, 1) * Math.PI * 0.5)
  const startWidthScale = THREE.MathUtils.lerp(1 - startTaper, 1, startProfile)
  const endWidthScale = THREE.MathUtils.lerp(1 - endTaper, 1, endProfile)

  return Math.max(0.001, Math.min(startWidthScale, endWidthScale))
}

function getMaxTaperAmount(params: EffectMeshParams): number {
  return Math.max(
    THREE.MathUtils.clamp(params.taper, 0, 1),
    THREE.MathUtils.clamp(params.endTaper ?? params.taper, 0, 1)
  )
}

function getSignedNoise(index: number, channelSeed: number, shapeSeed: number): number {
  const value = Math.sin((index + 1) * channelSeed + shapeSeed * 12.9898) * 43758.5453123
  return (value - Math.floor(value)) * 2 - 1
}

function getSeededPhaseOffset(seed: number): number {
  return Math.floor(seed) * 0.17320508075688773
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
