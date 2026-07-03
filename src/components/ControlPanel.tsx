import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import * as meshExporter from '../exporters/meshExporter'
import type {
  EffectMeshParams,
  EffectMeshType,
  HoneycombUvMode,
} from '../generators/effectMeshGenerator'
import { uiText, type Language } from '../i18n'
import './ControlPanel.css'

const SLASH_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 12,
  widthDivisions: 2,
  thickness: 0.5,
  length: 3,
  curve: 0.8,
  topCurve: 0.2,
  taper: 0.35,
  spread: 0,
  vertexAlphaEnabled: false,
  topAlpha: 1,
  bottomAlpha: 1,
  topAlphaRange: 0.5,
  bottomAlphaRange: 0.5,
  twist: 0,
  waveCount: 1,
  waveHeight: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const RIBBON_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 24,
  widthDivisions: 2,
  thickness: 0.35,
  length: 4,
  curve: 0.8,
  topCurve: 0.2,
  taper: 0.15,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const ARC_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 12,
  widthDivisions: 2,
  thickness: 0.8,
  length: 1.5,
  curve: 1.1,
  topCurve: 0.3,
  taper: 0,
  spread: 0.1,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const ARC_RIBBON_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 12,
  widthDivisions: 2,
  thickness: 0.2,
  length: 1.5,
  curve: 1,
  topCurve: 0,
  taper: 0,
  spread: 0,
  twist: 0.5,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const SPIRAL_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 32,
  widthDivisions: 2,
  thickness: 0.3,
  length: 3,
  curve: 1.2,
  topCurve: 0.2,
  taper: 0.25,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const RISING_SPIRAL_RIBBON_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 32,
  widthDivisions: 2,
  thickness: 0.35,
  length: 5,
  curve: 1.2,
  topCurve: 0.2,
  taper: 0.25,
  spread: 0.7,
  bottomSpread: 0,
  twist: 0.4,
  waveCount: 3,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const CYLINDER_SPIRAL_RIBBON_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 32,
  widthDivisions: 2,
  thickness: 0.35,
  length: 5,
  curve: 1,
  topCurve: 0,
  taper: 0,
  spread: 0,
  bottomSpread: 0,
  twist: 0,
  waveCount: 3,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const LIGHTNING_RIBBON_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 24,
  widthDivisions: 1,
  thickness: 0.22,
  length: 5,
  curve: 1.4,
  topCurve: 0,
  taper: 0.75,
  spread: 0.25,
  twist: 0,
  waveCount: 5,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const BURST_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 16,
  widthDivisions: 8,
  thickness: 0.5,
  length: 3,
  curve: 1,
  topCurve: 0.2,
  taper: 0.4,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const PLANE_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 1,
  widthDivisions: 1,
  thickness: 2,
  length: 2,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const HONEYCOMB_PLANE_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 6,
  widthDivisions: 8,
  thickness: 3,
  length: 4,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0.08,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
  honeycombUvMode: 'layout',
  honeycombExtraOffsetRows: false,
  honeycombXCurve: 0,
  honeycombRandomRemoval: 0,
}

const HONEYCOMB_RADIAL_PLANE_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 4,
  widthDivisions: 1,
  thickness: 3,
  length: 3,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0.08,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
  honeycombUvMode: 'layout',
  honeycombCenterRingRemoval: 0,
  honeycombXCurve: 0,
  honeycombRandomRemoval: 0,
}

const HONEYCOMB_SPHERE_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 4,
  widthDivisions: 1,
  thickness: 1,
  length: 3,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0.08,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
  honeycombUvMode: 'layout',
  honeycombRandomRemoval: 0,
}

const FLAT_RING_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 32,
  widthDivisions: 1,
  thickness: 0.5,
  length: 3,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const SPHERE_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 16,
  widthDivisions: 4,
  thickness: 1,
  length: 2,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const HEMISPHERE_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 12,
  widthDivisions: 4,
  thickness: 1,
  length: 2,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const Z_HEMISPHERE_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 12,
  widthDivisions: 4,
  thickness: 1,
  length: 2,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const OPEN_CYLINDER_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 2,
  widthDivisions: 12,
  thickness: 1,
  length: 0.3,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0.5,
  twist: 0,
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
}

const BEAM_DOME_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 5,
  widthDivisions: 8,
  thickness: 1,
  length: 4,
  curve: 0,
  topCurve: 0,
  taper: 0,
  spread: 0,
  twist: 0,
  waveEnabled: false,
  waveCount: 1,
  waveCountX: 1,
  waveHeight: 0,
  waveHeightX: 0,
  seed: 0,
  seedX: 0,
  yClip: 0,
  cylinderScale: 1,
  cylinderDivisions: 2,
  beamEndCap: false,
}

const VERTEX_ALPHA_DEFAULT_PARAMS: Pick<
  EffectMeshParams,
  'vertexAlphaEnabled' | 'topAlpha' | 'bottomAlpha' | 'topAlphaRange' | 'bottomAlphaRange'
> = {
  vertexAlphaEnabled: false,
  topAlpha: 1,
  bottomAlpha: 1,
  topAlphaRange: 0.5,
  bottomAlphaRange: 0.5,
}

const MESH_TYPE_OPTION_VALUES: ReadonlyArray<EffectMeshType> = [
  'slash',
  'arc',
  'openCylinder',
  'arcRibbon',
  'ribbon',
  'lightningRibbon',
  'risingSpiralRibbon',
  'cylinderSpiralRibbon',
  'plane',
  'flatRing',
  'sphere',
  'hemisphere',
  'zHemisphere',
  'beamDome',
  'honeycombPlane',
  'honeycombRadialPlane',
  'honeycombSphere',
]

type EffectControlKey =
  | 'curve'
  | 'honeycombXCurve'
  | 'honeycombRandomRemoval'
  | 'topCurve'
  | 'taper'
  | 'spread'
  | 'bottomSpread'
  | 'topAlpha'
  | 'bottomAlpha'
  | 'alphaRange'
  | 'topAlphaRange'
  | 'bottomAlphaRange'
  | 'twist'
  | 'waveCount'
  | 'waveCountX'
  | 'waveHeight'
  | 'waveHeightX'
  | 'seed'
  | 'seedX'
  | 'yClip'

const VISIBLE_EFFECT_CONTROLS: Record<EffectMeshType, readonly EffectControlKey[]> = {
  slash: [
    'curve',
    'topCurve',
    'taper',
    'spread',
    'twist',
  ],
  arc: ['curve', 'topCurve', 'taper', 'spread'],
  arcRibbon: ['curve', 'topCurve', 'taper', 'spread', 'twist'],
  openCylinder: ['curve', 'topCurve', 'spread', 'bottomSpread', 'twist', 'waveCount', 'waveHeight', 'seed'],
  ribbon: ['curve', 'topCurve', 'taper', 'spread', 'twist', 'waveCount', 'seed'],
  lightningRibbon: ['curve', 'topCurve', 'taper', 'spread', 'twist', 'waveCount', 'seed'],
  risingSpiralRibbon: ['curve', 'topCurve', 'taper', 'spread', 'bottomSpread', 'twist', 'waveCount'],
  cylinderSpiralRibbon: ['curve', 'topCurve', 'taper', 'spread', 'bottomSpread', 'twist', 'waveCount'],
  plane: ['topCurve', 'taper'],
  honeycombPlane: ['curve', 'honeycombXCurve', 'spread', 'honeycombRandomRemoval', 'seed'],
  honeycombRadialPlane: ['curve', 'honeycombXCurve', 'spread', 'honeycombRandomRemoval', 'seed'],
  honeycombSphere: ['spread', 'honeycombRandomRemoval', 'seed', 'yClip'],
  flatRing: ['topCurve', 'spread', 'twist'],
  sphere: ['twist', 'yClip'],
  hemisphere: ['twist'],
  zHemisphere: ['yClip'],
  beamDome: [
    'topCurve',
    'spread',
    'twist',
    'waveCountX',
    'waveHeightX',
    'seedX',
    'waveCount',
    'waveHeight',
    'seed',
  ],
  spiral: ['curve', 'topCurve', 'taper'],
  burst: ['curve', 'topCurve', 'taper'],
}

const BEAM_WAVE_DETAIL_CONTROLS: ReadonlySet<EffectControlKey> = new Set([
  'waveCount',
  'waveCountX',
  'waveHeight',
  'waveHeightX',
  'seed',
  'seedX',
])

const VERTEX_ALPHA_DETAIL_CONTROLS: ReadonlySet<EffectControlKey> = new Set([
  'topAlpha',
  'topAlphaRange',
  'bottomAlpha',
  'bottomAlphaRange',
])

const VERTEX_ALPHA_MESH_TYPES: ReadonlySet<EffectMeshType> = new Set([
  'slash',
  'arc',
  'openCylinder',
  'arcRibbon',
  'ribbon',
  'lightningRibbon',
  'risingSpiralRibbon',
  'cylinderSpiralRibbon',
  'plane',
  'flatRing',
  'sphere',
  'hemisphere',
  'zHemisphere',
  'beamDome',
  'honeycombPlane',
  'honeycombRadialPlane',
  'honeycombSphere',
])

const DOUBLE_SIDED_MESH_TYPES: ReadonlySet<EffectMeshType> = new Set([
  'slash',
  'ribbon',
  'arcRibbon',
  'lightningRibbon',
  'risingSpiralRibbon',
  'cylinderSpiralRibbon',
  'openCylinder',
  'plane',
])

const CROSS_MESH_TYPES: ReadonlySet<EffectMeshType> = new Set([
  'slash',
  'arc',
  'arcRibbon',
  'ribbon',
  'lightningRibbon',
  'risingSpiralRibbon',
  'cylinderSpiralRibbon',
  'plane',
  'flatRing',
])

const HIDDEN_MIRROR_Z_MESH_TYPES: ReadonlySet<EffectMeshType> = new Set([
  'sphere',
  'hemisphere',
  'zHemisphere',
  'honeycombPlane',
  'honeycombRadialPlane',
  'honeycombSphere',
  'beamDome',
])

const MIRROR_Z_LABELED_AS_DOUBLE_SIDED_MESH_TYPES: ReadonlySet<EffectMeshType> = new Set([
  'arc',
  'flatRing',
])

const CONTACT_URLS: Record<Language, string> = {
  ja: 'https://forms.gle/PBUeyRmNTppJL2EQ8',
  en: 'https://forms.gle/gXjDBKPhWy9H1Wft6',
}
const REPOSITORY_URL = 'https://github.com/big615big615/EffectMeshGenerator'

// Management controls: set to true when exposing recording/debug-only controls.
const SHOW_MANAGEMENT_CONTROLS = false

const getVertexAlphaLabels = (meshType: EffectMeshType, t: (typeof uiText)[Language]) => {
  switch (meshType) {
    case 'arc':
    case 'arcRibbon':
      return { first: t.vertexAlphaSideStart, second: t.vertexAlphaSideEnd }
    case 'flatRing':
    case 'honeycombRadialPlane':
      return { first: t.vertexAlphaSideOuter, second: t.vertexAlphaSideInner }
    case 'beamDome':
      return { first: t.vertexAlphaSideTip, second: t.vertexAlphaSideTail }
    default:
      return { first: t.vertexAlphaSideTop, second: t.vertexAlphaSideBottom }
  }
}

interface ControlPanelProps {
  meshType: EffectMeshType
  setMeshType: (value: EffectMeshType) => void
  params: EffectMeshParams
  setParams: (params: EffectMeshParams) => void
  mesh?: THREE.Mesh
  wireframe: boolean
  setWireframe: (value: boolean) => void
  showUV: boolean
  setShowUV: (value: boolean) => void
  showTextureIn3D: boolean
  setShowTextureIn3D: (value: boolean) => void
  animateUVScroll: boolean
  setAnimateUVScroll: (value: boolean) => void
  autoRotateY: boolean
  setAutoRotateY: (value: boolean) => void
  autoRotateYSpeed: number
  setAutoRotateYSpeed: (value: number) => void
  showMeshTypeGrid: boolean
  setShowMeshTypeGrid: (value: boolean) => void
  onUVScrollReset: () => void
  uvRotation: number
  setUVRotation: (value: number) => void
  mirrorZ: boolean
  setMirrorZ: (value: boolean) => void
  doubleSided: boolean
  setDoubleSided: (value: boolean) => void
  crossMesh: boolean
  setCrossMesh: (value: boolean) => void
  showPolygonCount: boolean
  setShowPolygonCount: (value: boolean) => void
  showPivot: boolean
  setShowPivot: (value: boolean) => void
  pivot: {
    x: number
    y: number
    z: number
  }
  setPivot: (value: ControlPanelProps['pivot']) => void
  scale: {
    x: number
    y: number
    z: number
  }
  setScale: (value: ControlPanelProps['scale']) => void
  rotation: {
    x: number
    y: number
    z: number
  }
  setRotation: (value: ControlPanelProps['rotation']) => void
  textureTiling: {
    x: number
    y: number
  }
  setTextureTiling: (value: ControlPanelProps['textureTiling']) => void
  textureName: string | null
  onTextureFileSelect: (file: File) => void
  onTextureReset: () => void
  language: Language
  setLanguage: (value: Language) => void
}

type DraftNumberInputOptions = {
  min?: number
  applyDefaultValue?: (value: number) => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  meshType,
  setMeshType,
  params,
  setParams,
  mesh,
  wireframe,
  setWireframe,
  showUV,
  setShowUV,
  showTextureIn3D,
  setShowTextureIn3D,
  animateUVScroll,
  setAnimateUVScroll,
  autoRotateY,
  setAutoRotateY,
  autoRotateYSpeed,
  setAutoRotateYSpeed,
  showMeshTypeGrid,
  setShowMeshTypeGrid,
  onUVScrollReset,
  uvRotation,
  setUVRotation,
  mirrorZ,
  setMirrorZ,
  doubleSided,
  setDoubleSided,
  crossMesh,
  setCrossMesh,
  showPolygonCount,
  setShowPolygonCount,
  showPivot,
  setShowPivot,
  pivot,
  setPivot,
  scale,
  setScale,
  rotation,
  setRotation,
  textureTiling,
  setTextureTiling,
  textureName,
  onTextureFileSelect,
  onTextureReset,
  language,
  setLanguage,
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isLegalPanelOpen, setIsLegalPanelOpen] = useState(false)
  const [snapPivotToVertex, setSnapPivotToVertex] = useState(false)
  const [numberInputDrafts, setNumberInputDrafts] = useState<Record<string, string>>({})
  const t = uiText[language]
  const textureFileInputRef = useRef<HTMLInputElement | null>(null)
  const pivotDragRef = useRef<{
    key: keyof ControlPanelProps['pivot']
    startX: number
    startValue: number
  } | null>(null)
  const scaleDragRef = useRef<{
    key: keyof ControlPanelProps['scale']
    startX: number
    startValue: number
  } | null>(null)
  const rotationDragRef = useRef<{
    key: keyof ControlPanelProps['rotation']
    startX: number
    startValue: number
  } | null>(null)
  const textureTilingDragRef = useRef<{
    key: keyof ControlPanelProps['textureTiling']
    startX: number
    startValue: number
  } | null>(null)

  const handleChange = (key: keyof ControlPanelProps['params'], value: number) => {
    setParams({ ...params, [key]: value })
  }
  const handleHoneycombUvModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setParams({
      ...params,
      honeycombUvMode: event.target.value as HoneycombUvMode,
    })
  }
  const handleHoneycombExtraOffsetRowsChange = () => {
    setParams({
      ...params,
      honeycombExtraOffsetRows: !(params.honeycombExtraOffsetRows ?? false),
    })
  }
  const handleWaveEnabledChange = () => {
    setParams({
      ...params,
      waveEnabled: !(params.waveEnabled ?? false),
    })
  }
  const handleVertexAlphaEnabledChange = () => {
    setParams({
      ...params,
      vertexAlphaEnabled: !(params.vertexAlphaEnabled ?? false),
    })
  }
  const handleBeamEndCapChange = () => {
    setParams({
      ...params,
      beamEndCap: !(params.beamEndCap ?? false),
    })
  }
  const handleControlPanelPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.type !== 'range') return

    document.getSelection()?.removeAllRanges()
    document.body.classList.add('range-input-dragging')

    const cleanup = () => {
      document.body.classList.remove('range-input-dragging')
      window.removeEventListener('pointerup', cleanup)
      window.removeEventListener('pointercancel', cleanup)
      window.removeEventListener('blur', cleanup)
    }

    window.addEventListener('pointerup', cleanup)
    window.addEventListener('pointercancel', cleanup)
    window.addEventListener('blur', cleanup)
  }
  const applyMeshParams = (nextParams: EffectMeshParams) => {
    setParams({
      ...VERTEX_ALPHA_DEFAULT_PARAMS,
      ...nextParams,
      endTaper: nextParams.endTaper ?? nextParams.taper,
    })
  }
  const isEffectControlVisible = (key: EffectControlKey) => {
    if (VERTEX_ALPHA_DETAIL_CONTROLS.has(key)) {
      return VERTEX_ALPHA_MESH_TYPES.has(meshType) && (params.vertexAlphaEnabled ?? false)
    }

    const visible = VISIBLE_EFFECT_CONTROLS[meshType].includes(key)
    if (meshType === 'beamDome' && BEAM_WAVE_DETAIL_CONTROLS.has(key)) {
      return visible && (params.waveEnabled ?? false)
    }
    return visible
  }
  const vertexAlphaLabels = getVertexAlphaLabels(meshType, t)
  const isSphericalMesh =
    meshType === 'sphere' || meshType === 'hemisphere' || meshType === 'zHemisphere'
  const isPlanarHoneycombMesh =
    meshType === 'honeycombPlane' || meshType === 'honeycombRadialPlane'
  const isSizeLabelMesh = isSphericalMesh || isPlanarHoneycombMesh || meshType === 'honeycombSphere'
  const hidesThickness = isSphericalMesh || isPlanarHoneycombMesh || meshType === 'honeycombSphere'
  const showsWidthDivisions = meshType !== 'honeycombSphere' && meshType !== 'honeycombRadialPlane'
  const isHoneycombPlane = meshType === 'honeycombPlane'
  const isHoneycombRadialPlane = meshType === 'honeycombRadialPlane'
  const isHoneycombMesh =
    meshType === 'honeycombPlane' ||
    meshType === 'honeycombRadialPlane' ||
    meshType === 'honeycombSphere'
  const canExportHoneycombPartJSON = meshExporter.canExportHoneycombPartJSON(mesh ?? null)
  const showsDoubleSided = DOUBLE_SIDED_MESH_TYPES.has(meshType)
  const showsCrossMesh = CROSS_MESH_TYPES.has(meshType)
  const showsMirrorZ = !showsDoubleSided && !HIDDEN_MIRROR_Z_MESH_TYPES.has(meshType)
  const showsMirrorZAsDoubleSided =
    showsMirrorZ && MIRROR_Z_LABELED_AS_DOUBLE_SIDED_MESH_TYPES.has(meshType)
  const mirrorZLabel = showsMirrorZAsDoubleSided
    ? t.doubleSided
    : t.mirrorZ
  const isTornadoMesh = meshType === 'risingSpiralRibbon' || meshType === 'cylinderSpiralRibbon'
  const usesVerticalSpreadLabels = isTornadoMesh || meshType === 'openCylinder'
  const usesVerticalTaperLabels =
    isTornadoMesh ||
    meshType === 'slash' ||
    meshType === 'ribbon' ||
    meshType === 'lightningRibbon' ||
    meshType === 'plane'
  const divisionsMin =
    isSphericalMesh || meshType === 'honeycombSphere' || meshType === 'beamDome'
      ? '2'
      : meshType === 'slash' ||
          meshType === 'openCylinder' ||
          meshType === 'plane' ||
          meshType === 'honeycombPlane' ||
          meshType === 'honeycombRadialPlane'
        ? '1'
        : '3'
  const divisionsMax =
    meshType === 'honeycombSphere'
      ? '16'
      : isPlanarHoneycombMesh
      ? '32'
      : meshType === 'risingSpiralRibbon' || meshType === 'cylinderSpiralRibbon'
      ? '128'
      : '64'
  const curveMin = meshType === 'openCylinder' ? '-1' : '0'
  const curveMax = meshType === 'openCylinder' ? '1' : '2'
  const spreadLabel = isHoneycombMesh
    ? t.honeycombGap
    : usesVerticalSpreadLabels
      ? t.spreadEnd
      : t.spread
  const spreadMax = isHoneycombMesh ? '0.75' : '3'
  const spreadStep = isHoneycombMesh ? '0.01' : '0.05'

  const handleMeshTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMeshType = event.target.value as EffectMeshType
    setShowMeshTypeGrid(false)
    setMeshType(nextMeshType)
    setCrossMesh(false)

    if (nextMeshType === 'slash') {
      applyMeshParams(SLASH_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'ribbon') {
      applyMeshParams(RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'arc') {
      applyMeshParams(ARC_DEFAULT_PARAMS)
      setMirrorZ(true)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'arcRibbon') {
      applyMeshParams(ARC_RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'lightningRibbon') {
      applyMeshParams(LIGHTNING_RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'spiral') {
      applyMeshParams(SPIRAL_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'risingSpiralRibbon') {
      applyMeshParams(RISING_SPIRAL_RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'cylinderSpiralRibbon') {
      applyMeshParams(CYLINDER_SPIRAL_RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'burst') {
      applyMeshParams(BURST_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'plane') {
      applyMeshParams(PLANE_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'honeycombPlane') {
      applyMeshParams(HONEYCOMB_PLANE_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'honeycombRadialPlane') {
      applyMeshParams(HONEYCOMB_RADIAL_PLANE_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'honeycombSphere') {
      applyMeshParams(HONEYCOMB_SPHERE_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'flatRing') {
      applyMeshParams(FLAT_RING_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'sphere') {
      applyMeshParams(SPHERE_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'hemisphere') {
      applyMeshParams(HEMISPHERE_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'zHemisphere') {
      applyMeshParams(Z_HEMISPHERE_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'openCylinder') {
      applyMeshParams(OPEN_CYLINDER_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
      return
    }

    if (nextMeshType === 'beamDome') {
      applyMeshParams(BEAM_DOME_DEFAULT_PARAMS)
      setMirrorZ(false)
      setDoubleSided(false)
    }
  }

  const handlePivotChange = (key: keyof ControlPanelProps['pivot'], value: number) => {
    setPivot({ ...pivot, [key]: getPivotValueForInput(key, value) })
  }

  const handleMovePivotToBoundsCenter = () => {
    if (!mesh) return

    mesh.geometry.computeBoundingBox()
    const boundingBox = mesh.geometry.boundingBox
    if (!boundingBox) return

    const center = new THREE.Vector3()
    boundingBox.getCenter(center)
    center.add(mesh.position)

    setPivot({
      x: roundPivotValue(center.x),
      y: roundPivotValue(center.y),
      z: roundPivotValue(center.z),
    })
  }

  const handleScaleChange = (key: keyof ControlPanelProps['scale'], value: number) => {
    setScale({ ...scale, [key]: value })
  }

  const handleRotationChange = (key: keyof ControlPanelProps['rotation'], value: number) => {
    setRotation({ ...rotation, [key]: value })
  }

  const handleTextureTilingChange = (
    key: keyof ControlPanelProps['textureTiling'],
    value: number
  ) => {
    setTextureTiling({
      ...textureTiling,
      [key]: Math.max(0, value),
    })
  }

  const handleTextureInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    onTextureFileSelect(file)
    event.target.value = ''
  }

  const handleTextureReset = () => {
    if (textureFileInputRef.current) {
      textureFileInputRef.current.value = ''
    }

    onTextureReset()
  }

  const roundPivotValue = (value: number) => Math.round(value * 1000) / 1000
  const roundScaleValue = (value: number) => Math.round(value * 1000) / 1000
  const roundRotationValue = (value: number) => Math.round(value * 1000) / 1000
  const roundTextureTilingValue = (value: number) => Math.round(value * 1000) / 1000
  const getNumberInputValue = (inputKey: string, value: number) =>
    Object.prototype.hasOwnProperty.call(numberInputDrafts, inputKey)
      ? numberInputDrafts[inputKey]
      : value
  const clearNumberInputDraft = (inputKey: string) => {
    setNumberInputDrafts((drafts) => {
      if (!Object.prototype.hasOwnProperty.call(drafts, inputKey)) return drafts

      const nextDrafts = { ...drafts }
      delete nextDrafts[inputKey]
      return nextDrafts
    })
  }
  const clampNumberInputValue = (value: number, min?: number) =>
    min === undefined ? value : Math.max(min, value)
  const handleDraftNumberChange = (
    inputKey: string,
    rawValue: string,
    defaultValue: number,
    applyValue: (value: number) => void,
    options: DraftNumberInputOptions = {}
  ) => {
    setNumberInputDrafts((drafts) => ({ ...drafts, [inputKey]: rawValue }))

    const applyDefaultValue = options.applyDefaultValue ?? applyValue
    if (rawValue === '') {
      applyDefaultValue(defaultValue)
      return
    }

    const parsedValue = Number(rawValue)
    if (!Number.isFinite(parsedValue)) return

    applyValue(clampNumberInputValue(parsedValue, options.min))
  }
  const handleDraftNumberBlur = (
    inputKey: string,
    defaultValue: number,
    applyValue: (value: number) => void,
    options: DraftNumberInputOptions = {}
  ) => {
    const draftValue = numberInputDrafts[inputKey]
    const applyDefaultValue = options.applyDefaultValue ?? applyValue

    if (draftValue === '') {
      applyDefaultValue(defaultValue)
    } else if (draftValue !== undefined) {
      const parsedValue = Number(draftValue)
      if (Number.isFinite(parsedValue)) {
        applyValue(clampNumberInputValue(parsedValue, options.min))
      } else {
        applyDefaultValue(defaultValue)
      }
    }

    clearNumberInputDraft(inputKey)
  }
  const getPivotValueForInput = (
    key: keyof ControlPanelProps['pivot'],
    value: number
  ) => {
    if (!snapPivotToVertex) return roundPivotValue(value)
    return getNearestVertexCoordinate(key, value)
  }
  const getNearestVertexCoordinate = (
    key: keyof ControlPanelProps['pivot'],
    value: number
  ) => {
    if (!mesh) return roundPivotValue(value)

    const positionAttribute = mesh.geometry.getAttribute('position')
    if (!positionAttribute) return roundPivotValue(value)

    mesh.updateMatrixWorld(true)

    let nearestValue = value
    let nearestDistance = Number.POSITIVE_INFINITY
    const vertex = new THREE.Vector3()

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i)
      mesh.localToWorld(vertex)

      const candidate = vertex[key]
      const distance = Math.abs(candidate - value)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestValue = candidate
      }
    }

    return roundPivotValue(nearestValue)
  }
  const handlePivotInputChange = (
    key: keyof ControlPanelProps['pivot'],
    rawValue: string
  ) => {
    handleDraftNumberChange(`pivot.${key}`, rawValue, 0, (value) => handlePivotChange(key, value), {
      applyDefaultValue: (value) => setPivot({ ...pivot, [key]: roundPivotValue(value) }),
    })
  }
  const handlePivotInputBlur = (key: keyof ControlPanelProps['pivot']) => {
    handleDraftNumberBlur(`pivot.${key}`, 0, (value) => handlePivotChange(key, value), {
      applyDefaultValue: (value) => setPivot({ ...pivot, [key]: roundPivotValue(value) }),
    })
  }
  const handleRotationInputChange = (
    key: keyof ControlPanelProps['rotation'],
    rawValue: string
  ) => {
    handleDraftNumberChange(`rotation.${key}`, rawValue, 0, (value) =>
      handleRotationChange(key, roundRotationValue(value))
    )
  }
  const handleRotationInputBlur = (key: keyof ControlPanelProps['rotation']) => {
    handleDraftNumberBlur(`rotation.${key}`, 0, (value) =>
      handleRotationChange(key, roundRotationValue(value))
    )
  }
  const handleScaleInputChange = (key: keyof ControlPanelProps['scale'], rawValue: string) => {
    handleDraftNumberChange(`scale.${key}`, rawValue, 1, (value) =>
      handleScaleChange(key, roundScaleValue(value))
    )
  }
  const handleScaleInputBlur = (key: keyof ControlPanelProps['scale']) => {
    handleDraftNumberBlur(`scale.${key}`, 1, (value) =>
      handleScaleChange(key, roundScaleValue(value))
    )
  }
  const handleTextureTilingInputChange = (
    key: keyof ControlPanelProps['textureTiling'],
    rawValue: string
  ) => {
    handleDraftNumberChange(
      `textureTiling.${key}`,
      rawValue,
      1,
      (value) => handleTextureTilingChange(key, roundTextureTilingValue(value)),
      { min: 0 }
    )
  }
  const handleTextureTilingInputBlur = (key: keyof ControlPanelProps['textureTiling']) => {
    handleDraftNumberBlur(
      `textureTiling.${key}`,
      1,
      (value) => handleTextureTilingChange(key, roundTextureTilingValue(value)),
      { min: 0 }
    )
  }

  const handlePivotDragStart = (
    event: React.PointerEvent<HTMLInputElement>,
    key: keyof ControlPanelProps['pivot']
  ) => {
    if (event.button !== 0) return

    clearNumberInputDraft(`pivot.${key}`)
    pivotDragRef.current = {
      key,
      startX: event.clientX,
      startValue: pivot[key],
    }

    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const drag = pivotDragRef.current
      if (!drag) return

      const deltaX = moveEvent.clientX - drag.startX
      if (Math.abs(deltaX) < 2) return

      moveEvent.preventDefault()
      const sensitivity = moveEvent.altKey ? 0.001 : moveEvent.shiftKey ? 0.005 : 0.01
      handlePivotChange(drag.key, roundPivotValue(drag.startValue + deltaX * sensitivity))
    }

    const handlePointerUp = () => {
      pivotDragRef.current = null
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleRotationDragStart = (
    event: React.PointerEvent<HTMLInputElement>,
    key: keyof ControlPanelProps['rotation']
  ) => {
    if (event.button !== 0) return

    clearNumberInputDraft(`rotation.${key}`)
    rotationDragRef.current = {
      key,
      startX: event.clientX,
      startValue: rotation[key],
    }

    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const drag = rotationDragRef.current
      if (!drag) return

      const deltaX = moveEvent.clientX - drag.startX
      if (Math.abs(deltaX) < 2) return

      moveEvent.preventDefault()
      const sensitivity = moveEvent.altKey ? 0.01 : moveEvent.shiftKey ? 0.1 : 0.5
      handleRotationChange(drag.key, roundRotationValue(drag.startValue + deltaX * sensitivity))
    }

    const handlePointerUp = () => {
      rotationDragRef.current = null
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleScaleDragStart = (
    event: React.PointerEvent<HTMLInputElement>,
    key: keyof ControlPanelProps['scale']
  ) => {
    if (event.button !== 0) return

    clearNumberInputDraft(`scale.${key}`)
    scaleDragRef.current = {
      key,
      startX: event.clientX,
      startValue: scale[key],
    }

    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const drag = scaleDragRef.current
      if (!drag) return

      const deltaX = moveEvent.clientX - drag.startX
      if (Math.abs(deltaX) < 2) return

      moveEvent.preventDefault()
      const sensitivity = moveEvent.altKey ? 0.001 : moveEvent.shiftKey ? 0.005 : 0.01
      handleScaleChange(drag.key, roundScaleValue(drag.startValue + deltaX * sensitivity))
    }

    const handlePointerUp = () => {
      scaleDragRef.current = null
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleTextureTilingDragStart = (
    event: React.PointerEvent<HTMLInputElement>,
    key: keyof ControlPanelProps['textureTiling']
  ) => {
    if (event.button !== 0) return

    clearNumberInputDraft(`textureTiling.${key}`)
    textureTilingDragRef.current = {
      key,
      startX: event.clientX,
      startValue: textureTiling[key],
    }

    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const drag = textureTilingDragRef.current
      if (!drag) return

      const deltaX = moveEvent.clientX - drag.startX
      if (Math.abs(deltaX) < 2) return

      moveEvent.preventDefault()
      const sensitivity = moveEvent.altKey ? 0.001 : moveEvent.shiftKey ? 0.005 : 0.01
      handleTextureTilingChange(
        drag.key,
        roundTextureTilingValue(drag.startValue + deltaX * sensitivity)
      )
    }

    const handlePointerUp = () => {
      textureTilingDragRef.current = null
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleExport = async (format: 'fbx' | 'glb' | 'gltf' | 'obj' | 'honeycombJson') => {
    if (!mesh) {
      alert(t.exportWaiting)
      return
    }

    setIsExporting(true)
    try {
      const timestamp = createLocalTimestamp(new Date())
      const fileName = `${meshType}-effect-${timestamp}`

      switch (format) {
        case 'fbx':
          await meshExporter.exportAsFBX(mesh, fileName)
          break
        case 'glb':
          await meshExporter.exportAsGLB(mesh, fileName)
          break
        case 'gltf':
          await meshExporter.exportAsGLTF(mesh, fileName)
          break
        case 'obj':
          await meshExporter.exportAsOBJ(mesh, fileName, {
            mergeSharedPositions: mirrorZ || doubleSided || meshType === 'beamDome',
          })
          break
        case 'honeycombJson':
          await meshExporter.exportHoneycombPartJSON(mesh, fileName)
          break
      }
    } catch (error) {
      console.error(`Export error (${format}):`, error)
      alert(`${t.exportFailed}: ${error instanceof Error ? error.message : t.unknownError}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="control-panel" onPointerDownCapture={handleControlPanelPointerDown}>
      <h2>{t.panelTitle}</h2>

      <div className="language-switch" aria-label={t.language}>
        <span>{t.language}</span>
        <div className="language-buttons">
          <button
            type="button"
            className={`language-btn ${language === 'ja' ? 'active' : ''}`}
            onClick={() => setLanguage('ja')}
            aria-pressed={language === 'ja'}
          >
            {t.japanese}
          </button>
          <button
            type="button"
            className={`language-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
          >
            {t.english}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="legal-link-btn"
        onClick={() => setIsLegalPanelOpen(true)}
      >
        {t.usageAndPrivacy}
      </button>

      <div className="control-group">
        <label htmlFor="meshType">{t.meshType}</label>
        <select
          id="meshType"
          className="mesh-type-select"
          value={meshType}
          onChange={handleMeshTypeChange}
        >
          {MESH_TYPE_OPTION_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.meshTypes[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <button
          type="button"
          className={`mesh-grid-toggle-btn ${showMeshTypeGrid ? 'active' : ''}`}
          onClick={() => setShowMeshTypeGrid(!showMeshTypeGrid)}
        >
          {t.thumbnailSelect}
        </button>
      </div>

      <div className="control-group">
        <label htmlFor="divisions">{meshType === 'beamDome' ? t.hemisphereDivisions : t.divisions}</label>
        <input
          id="divisions"
          type="range"
          min={divisionsMin}
          max={divisionsMax}
          value={params.divisions}
          onChange={(e) => handleChange('divisions', parseInt(e.target.value))}
        />
        <span className="value">{params.divisions}</span>
      </div>

      {meshType === 'beamDome' && (
        <div className="control-group">
          <label htmlFor="cylinderDivisions">{t.cylinderDivisions}</label>
          <input
            id="cylinderDivisions"
            type="range"
            min="1"
            max="64"
            step="1"
            value={params.cylinderDivisions ?? 2}
            onChange={(e) => handleChange('cylinderDivisions', parseInt(e.target.value))}
          />
          <span className="value">{params.cylinderDivisions ?? 2}</span>
        </div>
      )}

      {showsWidthDivisions && (
        <div className="control-group">
          <label htmlFor="widthDivisions">{t.widthDivisions}</label>
          <input
            id="widthDivisions"
            type="range"
            min="1"
            max={isPlanarHoneycombMesh ? '32' : '16'}
            value={params.widthDivisions}
            onChange={(e) => handleChange('widthDivisions', parseInt(e.target.value))}
          />
          <span className="value">{params.widthDivisions}</span>
        </div>
      )}

      {!hidesThickness && (
        <div className="control-group">
          <label htmlFor="thickness">{t.thickness}</label>
          <input
            id="thickness"
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={params.thickness}
            onChange={(e) => handleChange('thickness', parseFloat(e.target.value))}
          />
          <span className="value">{params.thickness.toFixed(1)}</span>
        </div>
      )}

      <div className="control-group">
        <label htmlFor="length">{isSizeLabelMesh ? t.size : t.length}</label>
        <input
          id="length"
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={params.length}
          onChange={(e) => handleChange('length', parseFloat(e.target.value))}
        />
        <span className="value">{params.length.toFixed(1)}</span>
      </div>

      {meshType === 'beamDome' && (
        <div className="control-group">
          <label htmlFor="cylinderScale">{t.cylinderScale}</label>
          <input
            id="cylinderScale"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.cylinderScale}
            onChange={(e) => handleChange('cylinderScale', parseFloat(e.target.value))}
          />
          <span className="value">{params.cylinderScale.toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('curve') && (
        <div className="control-group">
          <label htmlFor="curve">{isPlanarHoneycombMesh ? t.honeycombYCurve : t.curve}</label>
          <input
            id="curve"
            type="range"
            min={curveMin}
            max={curveMax}
            step="0.1"
            value={params.curve}
            onChange={(e) => handleChange('curve', parseFloat(e.target.value))}
          />
          <span className="value">{params.curve.toFixed(1)}</span>
        </div>
      )}

      {isEffectControlVisible('honeycombXCurve') && (
        <div className="control-group">
          <label htmlFor="honeycombXCurve">{t.honeycombXCurve}</label>
          <input
            id="honeycombXCurve"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={params.honeycombXCurve ?? 0}
            onChange={(e) => handleChange('honeycombXCurve', parseFloat(e.target.value))}
          />
          <span className="value">{(params.honeycombXCurve ?? 0).toFixed(1)}</span>
        </div>
      )}

      {isEffectControlVisible('topCurve') && (
        <div className="control-group">
          <label htmlFor="topCurve">{t.topCurve}</label>
          <input
            id="topCurve"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={params.topCurve}
            onChange={(e) => handleChange('topCurve', parseFloat(e.target.value))}
          />
          <span className="value">{params.topCurve.toFixed(1)}</span>
        </div>
      )}

      {isEffectControlVisible('taper') && (
        <>
          {usesVerticalTaperLabels && (
            <div className="control-group">
              <label htmlFor="endTaper">{t.taperTop}</label>
              <input
                id="endTaper"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.endTaper ?? params.taper}
                onChange={(e) => handleChange('endTaper', parseFloat(e.target.value))}
              />
              <span className="value">{(params.endTaper ?? params.taper).toFixed(2)}</span>
            </div>
          )}

          <div className="control-group">
            <label htmlFor="taper">{usesVerticalTaperLabels ? t.taperBottom : t.taperStart}</label>
            <input
              id="taper"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.taper}
              onChange={(e) => handleChange('taper', parseFloat(e.target.value))}
            />
            <span className="value">{params.taper.toFixed(2)}</span>
          </div>

          {!usesVerticalTaperLabels && (
            <div className="control-group">
              <label htmlFor="endTaper">{t.taperEnd}</label>
              <input
                id="endTaper"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.endTaper ?? params.taper}
                onChange={(e) => handleChange('endTaper', parseFloat(e.target.value))}
              />
              <span className="value">{(params.endTaper ?? params.taper).toFixed(2)}</span>
            </div>
          )}
        </>
      )}

      {isEffectControlVisible('spread') && (
        <div className="control-group">
          <label htmlFor="spread">{spreadLabel}</label>
          <input
            id="spread"
            type="range"
            min="0"
            max={spreadMax}
            step={spreadStep}
            value={params.spread}
            onChange={(e) => handleChange('spread', parseFloat(e.target.value))}
          />
          <span className="value">{params.spread.toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('honeycombRandomRemoval') && (
        <div className="control-group">
          <label htmlFor="honeycombRandomRemoval">{t.honeycombRandomRemoval}</label>
          <input
            id="honeycombRandomRemoval"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={params.honeycombRandomRemoval ?? 0}
            onChange={(e) => handleChange('honeycombRandomRemoval', parseFloat(e.target.value))}
          />
          <span className="value">{((params.honeycombRandomRemoval ?? 0) * 100).toFixed(0)}%</span>
        </div>
      )}

      {isHoneycombMesh && isEffectControlVisible('seed') && (
        <div className="control-group">
          <label htmlFor="seed">{t.honeycombRandomSeed}</label>
          <input
            id="seed"
            type="range"
            min="0"
            max="999"
            step="1"
            value={params.seed}
            onChange={(e) => handleChange('seed', parseInt(e.target.value))}
          />
          <span className="value">{params.seed}</span>
        </div>
      )}

      {isHoneycombRadialPlane && (
        <div className="control-group">
          <label htmlFor="honeycombCenterRingRemoval">{t.honeycombCenterRingRemoval}</label>
          <input
            id="honeycombCenterRingRemoval"
            type="range"
            min="0"
            max="32"
            step="1"
            value={params.honeycombCenterRingRemoval ?? 0}
            onChange={(e) => handleChange('honeycombCenterRingRemoval', parseInt(e.target.value))}
          />
          <span className="value">{params.honeycombCenterRingRemoval ?? 0}</span>
        </div>
      )}

      {isHoneycombPlane && (
        <div className="control-group toggle-row">
          <span>{t.honeycombExtraOffsetRows}</span>
          <button
            type="button"
            className={`toggle-btn ${params.honeycombExtraOffsetRows ? 'active' : ''}`}
            onClick={handleHoneycombExtraOffsetRowsChange}
          >
            {params.honeycombExtraOffsetRows ? t.on : t.off}
          </button>
        </div>
      )}

      {isEffectControlVisible('bottomSpread') && (
        <div className="control-group">
          <label htmlFor="bottomSpread">{usesVerticalSpreadLabels ? t.spreadStart : t.bottomSpread}</label>
          <input
            id="bottomSpread"
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={params.bottomSpread ?? 0}
            onChange={(e) => handleChange('bottomSpread', parseFloat(e.target.value))}
          />
          <span className="value">{(params.bottomSpread ?? 0).toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('twist') && (
        <div className="control-group">
          <label htmlFor="twist">{t.twist}</label>
          <input
            id="twist"
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={params.twist}
            onChange={(e) => handleChange('twist', parseFloat(e.target.value))}
          />
          <span className="value">{params.twist.toFixed(1)}</span>
        </div>
      )}

      {meshType === 'beamDome' && (
        <div className="control-group toggle-row inline-toggle-row">
          <label>{t.wave}</label>
          <button
            type="button"
            className={`toggle-btn ${params.waveEnabled ? 'active' : ''}`}
            onClick={handleWaveEnabledChange}
          >
            {params.waveEnabled ? t.on : t.off}
          </button>
        </div>
      )}

      {isEffectControlVisible('waveCountX') && (
        <div className="control-group">
          <label htmlFor="waveCountX">{t.waveCountX}</label>
          <input
            id="waveCountX"
            type="range"
            min="1"
            max="8"
            step="0.25"
            value={params.waveCountX ?? params.waveCount}
            onChange={(e) => handleChange('waveCountX', parseFloat(e.target.value))}
          />
          <span className="value">{(params.waveCountX ?? params.waveCount).toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('waveCount') && (
        <div className="control-group">
          <label htmlFor="waveCount">{meshType === 'beamDome' ? t.waveCountY : t.waveCount}</label>
          <input
            id="waveCount"
            type="range"
            min="1"
            max="8"
            step="0.25"
            value={params.waveCount}
            onChange={(e) => handleChange('waveCount', parseFloat(e.target.value))}
          />
          <span className="value">{params.waveCount.toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('waveHeightX') && (
        <div className="control-group">
          <label htmlFor="waveHeightX">{t.waveHeightX}</label>
          <input
            id="waveHeightX"
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={params.waveHeightX ?? 0}
            onChange={(e) => handleChange('waveHeightX', parseFloat(e.target.value))}
          />
          <span className="value">{(params.waveHeightX ?? 0).toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('waveHeight') && (
        <div className="control-group">
          <label htmlFor="waveHeight">{meshType === 'beamDome' ? t.waveHeightY : t.waveHeight}</label>
          <input
            id="waveHeight"
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={params.waveHeight ?? (meshType === 'beamDome' ? 0 : 1)}
            onChange={(e) => handleChange('waveHeight', parseFloat(e.target.value))}
          />
          <span className="value">
            {(params.waveHeight ?? (meshType === 'beamDome' ? 0 : 1)).toFixed(2)}
          </span>
        </div>
      )}

      {isEffectControlVisible('seedX') && (
        <div className="control-group">
          <label htmlFor="seedX">{t.seedX}</label>
          <input
            id="seedX"
            type="range"
            min="0"
            max="999"
            step="1"
            value={params.seedX ?? params.seed}
            onChange={(e) => handleChange('seedX', parseInt(e.target.value))}
          />
          <span className="value">{params.seedX ?? params.seed}</span>
        </div>
      )}

      {isEffectControlVisible('seed') && !isHoneycombMesh && (
        <div className="control-group">
          <label htmlFor="seed">{meshType === 'beamDome' ? t.seedY : t.seed}</label>
          <input
            id="seed"
            type="range"
            min="0"
            max="999"
            step="1"
            value={params.seed}
            onChange={(e) => handleChange('seed', parseInt(e.target.value))}
          />
          <span className="value">{params.seed}</span>
        </div>
      )}

      {isEffectControlVisible('yClip') && (
        <div className="control-group">
          <label htmlFor="yClip">{t.yClip}</label>
          <input
            id="yClip"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.yClip}
            onChange={(e) => handleChange('yClip', parseFloat(e.target.value))}
          />
          <span className="value">{params.yClip.toFixed(2)}</span>
        </div>
      )}

      {meshType === 'beamDome' && (
        <div className="control-group toggle-row">
          <span>{t.beamEndCap}</span>
          <button
            type="button"
            className={`toggle-btn ${params.beamEndCap ? 'active' : ''}`}
            onClick={handleBeamEndCapChange}
          >
            {params.beamEndCap ? t.on : t.off}
          </button>
        </div>
      )}

      <div className="control-group toggle-row">
        <span>{t.wireframe}</span>
        <button
          type="button"
          className={`toggle-btn ${wireframe ? 'active' : ''}`}
          onClick={() => setWireframe(!wireframe)}
        >
          {wireframe ? t.on : t.off}
        </button>
      </div>

      {showsDoubleSided && (
        <div className="control-group toggle-row">
          <span>{t.doubleSided}</span>
          <button
            type="button"
            className={`toggle-btn ${doubleSided ? 'active' : ''}`}
            onClick={() => setDoubleSided(!doubleSided)}
          >
            {doubleSided ? t.on : t.off}
          </button>
        </div>
      )}

      {showsMirrorZAsDoubleSided && (
        <div className="control-group toggle-row">
          <span>{mirrorZLabel}</span>
          <button
            type="button"
            className={`toggle-btn ${mirrorZ ? 'active' : ''}`}
            onClick={() => setMirrorZ(!mirrorZ)}
          >
            {mirrorZ ? t.on : t.off}
          </button>
        </div>
      )}

      {showsCrossMesh && (
        <div className="control-group toggle-row">
          <span>{t.crossMesh}</span>
          <button
            type="button"
            className={`toggle-btn ${crossMesh ? 'active' : ''}`}
            onClick={() => setCrossMesh(!crossMesh)}
          >
            {crossMesh ? t.on : t.off}
          </button>
        </div>
      )}

      {showsMirrorZ && !showsMirrorZAsDoubleSided && (
        <div className="control-group toggle-row">
          <span>{mirrorZLabel}</span>
          <button
            type="button"
            className={`toggle-btn ${mirrorZ ? 'active' : ''}`}
            onClick={() => setMirrorZ(!mirrorZ)}
          >
            {mirrorZ ? t.on : t.off}
          </button>
        </div>
      )}

      <div className="control-group toggle-row">
        <span>{t.showUV}</span>
        <div className="inline-actions">
          <button
            type="button"
            className={`toggle-btn ${uvRotation !== 0 ? 'active' : ''}`}
            title={t.uvRotate}
            onClick={() => setUVRotation((uvRotation + 90) % 360)}
          >
            {uvRotation} {t.degrees}
          </button>
          <button
            type="button"
            className={`toggle-btn ${showUV ? 'active' : ''}`}
            onClick={() => setShowUV(!showUV)}
          >
            {showUV ? t.on : t.off}
          </button>
        </div>
      </div>

      {isHoneycombMesh && (
        <div className="control-group">
          <label htmlFor="honeycombUvMode">{t.honeycombUvMode}</label>
          <select
            id="honeycombUvMode"
            className="mesh-type-select"
            value={params.honeycombUvMode ?? 'layout'}
            onChange={handleHoneycombUvModeChange}
          >
            <option value="layout">{t.honeycombUvLayout}</option>
            <option value="square">{t.honeycombUvSquare}</option>
            <option value="polygon">{t.honeycombUvPolygon}</option>
          </select>
        </div>
      )}

      <div className="control-group toggle-row">
        <span>{t.uvScroll}</span>
        <div className="inline-actions">
          <button
            type="button"
            className="toggle-btn"
            onClick={onUVScrollReset}
          >
            {t.reset}
          </button>
          <button
            type="button"
            className={`toggle-btn ${animateUVScroll ? 'active' : ''}`}
            onClick={() => setAnimateUVScroll(!animateUVScroll)}
          >
            {animateUVScroll ? t.on : t.off}
          </button>
        </div>
      </div>

      <div className="control-group texture-control">
        <input
          ref={textureFileInputRef}
          id="textureFile"
          className="texture-file-input"
          type="file"
          accept="image/*"
          onChange={handleTextureInputChange}
        />
        <div className="texture-display-row">
          <span>{t.texture3D}</span>
          <button
            type="button"
            className={`toggle-btn ${showTextureIn3D ? 'active' : ''}`}
            onClick={() => setShowTextureIn3D(!showTextureIn3D)}
          >
            {showTextureIn3D ? t.on : t.off}
          </button>
        </div>
        <div className="texture-actions">
          <button
            type="button"
            className="texture-btn"
            onClick={() => textureFileInputRef.current?.click()}
          >
            {t.chooseImage}
          </button>
          <button
            type="button"
            className="texture-btn"
            onClick={handleTextureReset}
            disabled={!textureName}
          >
            {t.checker}
          </button>
        </div>
        <div className="texture-name" title={textureName ?? t.checker}>
          {textureName ?? t.checker}
        </div>
      </div>

      <div className="control-group">
        <label>{t.textureTiling}</label>
        <div className="vector-inputs">
          <label>
            X
            <input
              type="number"
              min="0"
              max="32"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('textureTiling.x', textureTiling.x)}
              onPointerDown={(e) => handleTextureTilingDragStart(e, 'x')}
              onChange={(e) => handleTextureTilingInputChange('x', e.target.value)}
              onBlur={() => handleTextureTilingInputBlur('x')}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              min="0"
              max="32"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('textureTiling.y', textureTiling.y)}
              onPointerDown={(e) => handleTextureTilingDragStart(e, 'y')}
              onChange={(e) => handleTextureTilingInputChange('y', e.target.value)}
              onBlur={() => handleTextureTilingInputBlur('y')}
            />
          </label>
        </div>
      </div>

      <div className="control-group toggle-row">
        <span>{t.polygonCount}</span>
        <button
          type="button"
          className={`toggle-btn ${showPolygonCount ? 'active' : ''}`}
          onClick={() => setShowPolygonCount(!showPolygonCount)}
          disabled={!mesh}
        >
          {showPolygonCount ? t.on : t.show}
        </button>
      </div>

      <div className="control-group toggle-row">
        <span>{t.pivot}</span>
        <button
          type="button"
          className={`toggle-btn ${showPivot ? 'active' : ''}`}
          onClick={() => setShowPivot(!showPivot)}
        >
          {showPivot ? t.on : t.off}
        </button>
      </div>

      <div className="control-group">
        <div className="texture-display-row">
          <label>{t.pivotPosition}</label>
          <div className="pivot-actions">
            <button
              type="button"
              className="toggle-btn"
              onClick={handleMovePivotToBoundsCenter}
              disabled={!mesh}
            >
              {t.pivotToBoundsCenter}
            </button>
            <button
              type="button"
              className={`toggle-btn ${snapPivotToVertex ? 'active' : ''}`}
              onClick={() => setSnapPivotToVertex(!snapPivotToVertex)}
              disabled={!mesh}
            >
              {t.pivotSnapToVertex}
            </button>
          </div>
        </div>
        <div className="vector-inputs">
          <label>
            X
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('pivot.x', pivot.x)}
              onPointerDown={(e) => handlePivotDragStart(e, 'x')}
              onChange={(e) => handlePivotInputChange('x', e.target.value)}
              onBlur={() => handlePivotInputBlur('x')}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('pivot.y', pivot.y)}
              onPointerDown={(e) => handlePivotDragStart(e, 'y')}
              onChange={(e) => handlePivotInputChange('y', e.target.value)}
              onBlur={() => handlePivotInputBlur('y')}
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('pivot.z', pivot.z)}
              onPointerDown={(e) => handlePivotDragStart(e, 'z')}
              onChange={(e) => handlePivotInputChange('z', e.target.value)}
              onBlur={() => handlePivotInputBlur('z')}
            />
          </label>
        </div>
      </div>

      <div className="control-group">
        <label>{t.rotation}</label>
        <div className="vector-inputs">
          <label>
            X
            <input
              type="number"
              step="1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('rotation.x', rotation.x)}
              onPointerDown={(e) => handleRotationDragStart(e, 'x')}
              onChange={(e) => handleRotationInputChange('x', e.target.value)}
              onBlur={() => handleRotationInputBlur('x')}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('rotation.y', rotation.y)}
              onPointerDown={(e) => handleRotationDragStart(e, 'y')}
              onChange={(e) => handleRotationInputChange('y', e.target.value)}
              onBlur={() => handleRotationInputBlur('y')}
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('rotation.z', rotation.z)}
              onPointerDown={(e) => handleRotationDragStart(e, 'z')}
              onChange={(e) => handleRotationInputChange('z', e.target.value)}
              onBlur={() => handleRotationInputBlur('z')}
            />
          </label>
        </div>
      </div>

      {SHOW_MANAGEMENT_CONTROLS && (
        <>
          <div className="control-group toggle-row">
            <span>{t.autoRotateY}</span>
            <button
              type="button"
              className={`toggle-btn ${autoRotateY ? 'active' : ''}`}
              onClick={() => setAutoRotateY(!autoRotateY)}
            >
              {autoRotateY ? t.on : t.off}
            </button>
          </div>

          <div className="control-group">
            <label htmlFor="autoRotateYSpeed">{t.autoRotateYSpeed}</label>
            <input
              id="autoRotateYSpeed"
              type="range"
              min="1"
              max="60"
              step="1"
              value={autoRotateYSpeed}
              onChange={(e) => setAutoRotateYSpeed(parseFloat(e.target.value))}
            />
            <span className="value">
              {autoRotateYSpeed.toFixed(0)} {t.degrees}/s
            </span>
          </div>
        </>
      )}

      <div className="control-group">
        <label>{t.scale}</label>
        <div className="vector-inputs">
          <label>
            X
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('scale.x', scale.x)}
              onPointerDown={(e) => handleScaleDragStart(e, 'x')}
              onChange={(e) => handleScaleInputChange('x', e.target.value)}
              onBlur={() => handleScaleInputBlur('x')}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('scale.y', scale.y)}
              onPointerDown={(e) => handleScaleDragStart(e, 'y')}
              onChange={(e) => handleScaleInputChange('y', e.target.value)}
              onBlur={() => handleScaleInputBlur('y')}
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={getNumberInputValue('scale.z', scale.z)}
              onPointerDown={(e) => handleScaleDragStart(e, 'z')}
              onChange={(e) => handleScaleInputChange('z', e.target.value)}
              onBlur={() => handleScaleInputBlur('z')}
            />
          </label>
        </div>
      </div>

      {VERTEX_ALPHA_MESH_TYPES.has(meshType) && (
        <div className="control-group toggle-row inline-toggle-row">
          <label>{t.vertexAlpha}</label>
          <button
            type="button"
            className={`toggle-btn ${params.vertexAlphaEnabled ? 'active' : ''}`}
            onClick={handleVertexAlphaEnabledChange}
          >
            {params.vertexAlphaEnabled ? t.on : t.off}
          </button>
        </div>
      )}

      {isEffectControlVisible('topAlpha') && (
        <div className="control-group">
          <label htmlFor="topAlpha">
            {t.vertexAlphaStrength} {vertexAlphaLabels.first}
          </label>
          <input
            id="topAlpha"
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={params.topAlpha ?? 1}
            onChange={(e) => handleChange('topAlpha', parseFloat(e.target.value))}
          />
          <span className="value">{(params.topAlpha ?? 1).toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('topAlphaRange') && (
        <div className="control-group">
          <label htmlFor="topAlphaRange">
            {t.vertexAlphaRangeShort} {vertexAlphaLabels.first}
          </label>
          <input
            id="topAlphaRange"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.topAlphaRange ?? params.alphaRange ?? 0.5}
            onChange={(e) => handleChange('topAlphaRange', parseFloat(e.target.value))}
          />
          <span className="value">{(params.topAlphaRange ?? params.alphaRange ?? 0.5).toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('bottomAlpha') && (
        <div className="control-group">
          <label htmlFor="bottomAlpha">
            {t.vertexAlphaStrength} {vertexAlphaLabels.second}
          </label>
          <input
            id="bottomAlpha"
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={params.bottomAlpha ?? 1}
            onChange={(e) => handleChange('bottomAlpha', parseFloat(e.target.value))}
          />
          <span className="value">{(params.bottomAlpha ?? 1).toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('bottomAlphaRange') && (
        <div className="control-group">
          <label htmlFor="bottomAlphaRange">
            {t.vertexAlphaRangeShort} {vertexAlphaLabels.second}
          </label>
          <input
            id="bottomAlphaRange"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.bottomAlphaRange ?? params.alphaRange ?? 0.5}
            onChange={(e) => handleChange('bottomAlphaRange', parseFloat(e.target.value))}
          />
          <span className="value">{(params.bottomAlphaRange ?? params.alphaRange ?? 0.5).toFixed(2)}</span>
        </div>
      )}

      <div className="export-section">
        <h3>{t.export}</h3>
        <div className="debug-info" style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
          {t.status}: {mesh ? `✓ ${t.ready}` : `✗ ${t.loading}`}
        </div>
        <div className="export-buttons">
          <button
            className="export-btn fbx-btn"
            onClick={() => handleExport('fbx')}
            disabled={isExporting || !mesh}
            title={t.downloadAsFBX}
          >
            FBX
          </button>
          <button
            className="export-btn glb-btn"
            onClick={() => handleExport('glb')}
            disabled={isExporting || !mesh}
            title={t.downloadAsGLB}
          >
            GLB
          </button>
          <button
            className="export-btn gltf-btn"
            onClick={() => handleExport('gltf')}
            disabled={isExporting || !mesh}
            title={t.downloadAsGLTF}
          >
            GLTF
          </button>
          <button
            className="export-btn obj-btn"
            onClick={() => handleExport('obj')}
            disabled={isExporting || !mesh}
            title={t.downloadAsOBJ}
          >
            OBJ
          </button>
          {isHoneycombMesh && (
            <>
              <div className="export-subheading">{t.honeycombPartIdExport}</div>
              <button
                className="export-btn json-btn"
                onClick={() => handleExport('honeycombJson')}
                disabled={isExporting || !canExportHoneycombPartJSON}
                title={t.downloadHoneycombPartJSON}
              >
                JSON
              </button>
            </>
          )}
        </div>
        {isExporting && <p className="exporting-message">{t.exporting}</p>}
      </div>

      {isLegalPanelOpen && (
        <div
          className="legal-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsLegalPanelOpen(false)
            }
          }}
        >
          <section
            className="legal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
          >
            <div className="legal-modal-header">
              <h3 id="legal-modal-title">{t.usageTermsTitle}</h3>
              <button
                type="button"
                className="legal-close-btn"
                onClick={() => setIsLegalPanelOpen(false)}
                aria-label={t.close}
              >
                {t.close}
              </button>
            </div>

            <div className="legal-modal-content">
              <section>
                <h4>{t.outputLicenseTitle}</h4>
                <p>{t.outputLicenseBody}</p>
              </section>
              <section>
                <h4>{t.attributionTitle}</h4>
                <p>{t.attributionBody}</p>
              </section>
              <section>
                <h4>{t.appLicenseTitle}</h4>
                <p>{t.appLicenseBody}</p>
              </section>
              <section>
                <h4>{t.privacyTitle}</h4>
                <p>{t.privacyBody}</p>
              </section>
              <section>
                <h4>{t.repositoryTitle}</h4>
                <p>{t.repositoryBody}</p>
                <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
                  {t.repositoryLink}
                </a>
              </section>
              <section>
                <h4>{t.contactTitle}</h4>
                <p>{t.contactBody}</p>
                <a href={CONTACT_URLS[language]} target="_blank" rel="noreferrer">
                  {t.contactLink}
                </a>
              </section>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function createLocalTimestamp(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') +
    `T${[
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('-')}`
}

export default ControlPanel
