import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import * as meshExporter from '../exporters/meshExporter'
import type { EffectMeshParams, EffectMeshType } from '../generators/effectMeshGenerator'
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
  twist: 0,
  waveCount: 1,
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
  waveCount: 1,
  seed: 0,
  yClip: 0,
  cylinderScale: 1,
  cylinderDivisions: 2,
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
]

type EffectControlKey =
  | 'curve'
  | 'topCurve'
  | 'taper'
  | 'spread'
  | 'bottomSpread'
  | 'twist'
  | 'waveCount'
  | 'seed'
  | 'yClip'

const VISIBLE_EFFECT_CONTROLS: Record<EffectMeshType, readonly EffectControlKey[]> = {
  slash: ['curve', 'topCurve', 'taper', 'spread', 'twist'],
  arc: ['curve', 'topCurve', 'taper', 'spread'],
  arcRibbon: ['curve', 'topCurve', 'taper', 'spread', 'twist'],
  openCylinder: ['curve', 'topCurve', 'spread', 'twist'],
  ribbon: ['curve', 'topCurve', 'taper', 'spread', 'twist', 'waveCount', 'seed'],
  lightningRibbon: ['curve', 'topCurve', 'taper', 'spread', 'twist', 'waveCount', 'seed'],
  risingSpiralRibbon: ['curve', 'topCurve', 'taper', 'spread', 'bottomSpread', 'twist', 'waveCount'],
  cylinderSpiralRibbon: ['curve', 'topCurve', 'taper', 'spread', 'bottomSpread', 'twist', 'waveCount'],
  plane: ['topCurve', 'taper'],
  flatRing: ['topCurve', 'spread', 'twist'],
  sphere: ['twist', 'yClip'],
  hemisphere: ['twist'],
  zHemisphere: ['yClip'],
  beamDome: ['topCurve', 'spread', 'twist'],
  spiral: ['curve', 'topCurve', 'taper'],
  burst: ['curve', 'topCurve', 'taper'],
}

const DOUBLE_SIDED_MESH_TYPES: ReadonlySet<EffectMeshType> = new Set([
  'slash',
  'ribbon',
  'arcRibbon',
  'lightningRibbon',
  'risingSpiralRibbon',
  'cylinderSpiralRibbon',
  'openCylinder',
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
  'beamDome',
])

const CONTACT_URLS: Record<Language, string> = {
  ja: 'https://forms.gle/PBUeyRmNTppJL2EQ8',
  en: 'https://forms.gle/gXjDBKPhWy9H1Wft6',
}
const REPOSITORY_URL = 'https://github.com/big615big615/EffectMeshGenerator'

// Management controls: set to true when exposing recording/debug-only controls.
const SHOW_MANAGEMENT_CONTROLS = false

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
    setParams({ ...nextParams, endTaper: nextParams.endTaper ?? nextParams.taper })
  }
  const isEffectControlVisible = (key: EffectControlKey) =>
    VISIBLE_EFFECT_CONTROLS[meshType].includes(key)
  const isSphericalMesh =
    meshType === 'sphere' || meshType === 'hemisphere' || meshType === 'zHemisphere'
  const showsDoubleSided = DOUBLE_SIDED_MESH_TYPES.has(meshType)
  const showsCrossMesh = CROSS_MESH_TYPES.has(meshType)
  const showsMirrorZ = !showsDoubleSided && !HIDDEN_MIRROR_Z_MESH_TYPES.has(meshType)
  const isTornadoMesh = meshType === 'risingSpiralRibbon' || meshType === 'cylinderSpiralRibbon'
  const usesVerticalTaperLabels =
    isTornadoMesh ||
    meshType === 'slash' ||
    meshType === 'ribbon' ||
    meshType === 'lightningRibbon' ||
    meshType === 'plane'
  const divisionsMin =
    isSphericalMesh || meshType === 'beamDome'
      ? '2'
      : meshType === 'slash' || meshType === 'openCylinder' || meshType === 'plane'
        ? '1'
        : '3'
  const divisionsMax =
    meshType === 'risingSpiralRibbon' || meshType === 'cylinderSpiralRibbon'
      ? '128'
      : '64'

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
    setPivot({ ...pivot, [key]: value })
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
      [key]: Math.max(0.01, value),
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
  const parseScaleInput = (value: string) => {
    const parsedValue = parseFloat(value)
    return Number.isFinite(parsedValue) ? parsedValue : 1
  }
  const parseRotationInput = (value: string) => {
    const parsedValue = parseFloat(value)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  }
  const parseTextureTilingInput = (value: string) => {
    const parsedValue = parseFloat(value)
    return Number.isFinite(parsedValue) ? parsedValue : 1
  }

  const handlePivotDragStart = (
    event: React.PointerEvent<HTMLInputElement>,
    key: keyof ControlPanelProps['pivot']
  ) => {
    if (event.button !== 0) return

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

  const handleExport = async (format: 'fbx' | 'glb' | 'gltf' | 'obj') => {
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

      <div className="control-group">
        <label htmlFor="widthDivisions">{t.widthDivisions}</label>
        <input
          id="widthDivisions"
          type="range"
          min="1"
          max="16"
          value={params.widthDivisions}
          onChange={(e) => handleChange('widthDivisions', parseInt(e.target.value))}
        />
        <span className="value">{params.widthDivisions}</span>
      </div>

      {!isSphericalMesh && (
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
        <label htmlFor="length">{isSphericalMesh ? t.size : t.length}</label>
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

      {isEffectControlVisible('curve') && (
        <div className="control-group">
          <label htmlFor="curve">{t.curve}</label>
          <input
            id="curve"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={params.curve}
            onChange={(e) => handleChange('curve', parseFloat(e.target.value))}
          />
          <span className="value">{params.curve.toFixed(1)}</span>
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
          <label htmlFor="spread">{isTornadoMesh ? t.spreadEnd : t.spread}</label>
          <input
            id="spread"
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={params.spread}
            onChange={(e) => handleChange('spread', parseFloat(e.target.value))}
          />
          <span className="value">{params.spread.toFixed(2)}</span>
        </div>
      )}

      {isEffectControlVisible('bottomSpread') && (
        <div className="control-group">
          <label htmlFor="bottomSpread">{isTornadoMesh ? t.spreadStart : t.bottomSpread}</label>
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

      {isEffectControlVisible('waveCount') && (
        <div className="control-group">
          <label htmlFor="waveCount">{t.waveCount}</label>
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

      {isEffectControlVisible('seed') && (
        <div className="control-group">
          <label htmlFor="seed">{t.seed}</label>
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

      {meshType === 'beamDome' && (
        <>
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
        </>
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

      {showsMirrorZ && (
        <div className="control-group toggle-row">
          <span>{t.mirrorZ}</span>
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
              min="0.01"
              max="32"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={textureTiling.x}
              onPointerDown={(e) => handleTextureTilingDragStart(e, 'x')}
              onChange={(e) => handleTextureTilingChange('x', parseTextureTilingInput(e.target.value))}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              min="0.01"
              max="32"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={textureTiling.y}
              onPointerDown={(e) => handleTextureTilingDragStart(e, 'y')}
              onChange={(e) => handleTextureTilingChange('y', parseTextureTilingInput(e.target.value))}
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
        <label>{t.pivotPosition}</label>
        <div className="vector-inputs">
          <label>
            X
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={pivot.x}
              onPointerDown={(e) => handlePivotDragStart(e, 'x')}
              onChange={(e) => handlePivotChange('x', parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={pivot.y}
              onPointerDown={(e) => handlePivotDragStart(e, 'y')}
              onChange={(e) => handlePivotChange('y', parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={pivot.z}
              onPointerDown={(e) => handlePivotDragStart(e, 'z')}
              onChange={(e) => handlePivotChange('z', parseFloat(e.target.value) || 0)}
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
              value={rotation.x}
              onPointerDown={(e) => handleRotationDragStart(e, 'x')}
              onChange={(e) => handleRotationChange('x', parseRotationInput(e.target.value))}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={rotation.y}
              onPointerDown={(e) => handleRotationDragStart(e, 'y')}
              onChange={(e) => handleRotationChange('y', parseRotationInput(e.target.value))}
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={rotation.z}
              onPointerDown={(e) => handleRotationDragStart(e, 'z')}
              onChange={(e) => handleRotationChange('z', parseRotationInput(e.target.value))}
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
              value={scale.x}
              onPointerDown={(e) => handleScaleDragStart(e, 'x')}
              onChange={(e) => handleScaleChange('x', parseScaleInput(e.target.value))}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={scale.y}
              onPointerDown={(e) => handleScaleDragStart(e, 'y')}
              onChange={(e) => handleScaleChange('y', parseScaleInput(e.target.value))}
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title={t.dragToAdjust}
              value={scale.z}
              onPointerDown={(e) => handleScaleDragStart(e, 'z')}
              onChange={(e) => handleScaleChange('z', parseScaleInput(e.target.value))}
            />
          </label>
        </div>
      </div>

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
