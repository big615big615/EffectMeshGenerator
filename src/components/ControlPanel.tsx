import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import * as meshExporter from '../exporters/meshExporter'
import {
  EFFECT_MESH_TYPE_OPTIONS,
  type EffectMeshParams,
  type EffectMeshType,
} from '../generators/effectMeshGenerator'
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
  divisions: 8,
  widthDivisions: 8,
  thickness: 1,
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

const BEAM_DOME_DEFAULT_PARAMS: EffectMeshParams = {
  divisions: 24,
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
  uvRotation: number
  setUVRotation: (value: number) => void
  mirrorZ: boolean
  setMirrorZ: (value: boolean) => void
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
  textureName: string | null
  onTextureFileSelect: (file: File) => void
  onTextureReset: () => void
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
  uvRotation,
  setUVRotation,
  mirrorZ,
  setMirrorZ,
  showPolygonCount,
  setShowPolygonCount,
  showPivot,
  setShowPivot,
  pivot,
  setPivot,
  scale,
  setScale,
  textureName,
  onTextureFileSelect,
  onTextureReset,
}) => {
  const [isExporting, setIsExporting] = useState(false)
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

  const handleChange = (key: keyof ControlPanelProps['params'], value: number) => {
    setParams({ ...params, [key]: value })
  }

  const handleMeshTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMeshType = event.target.value as EffectMeshType
    setMeshType(nextMeshType)

    if (nextMeshType === 'slash') {
      setParams(SLASH_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'ribbon') {
      setParams(RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'arc') {
      setParams(ARC_DEFAULT_PARAMS)
      setMirrorZ(true)
      return
    }

    if (nextMeshType === 'lightningRibbon') {
      setParams(LIGHTNING_RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'spiral') {
      setParams(SPIRAL_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'risingSpiralRibbon') {
      setParams(RISING_SPIRAL_RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'cylinderSpiralRibbon') {
      setParams(CYLINDER_SPIRAL_RIBBON_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'burst') {
      setParams(BURST_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'plane') {
      setParams(PLANE_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'flatRing') {
      setParams(FLAT_RING_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'sphere') {
      setParams(SPHERE_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'hemisphere') {
      setParams(HEMISPHERE_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'zHemisphere') {
      setParams(Z_HEMISPHERE_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'openCylinder') {
      setParams(OPEN_CYLINDER_DEFAULT_PARAMS)
      setMirrorZ(false)
      return
    }

    if (nextMeshType === 'beamDome') {
      setParams(BEAM_DOME_DEFAULT_PARAMS)
      setMirrorZ(false)
    }
  }

  const handlePivotChange = (key: keyof ControlPanelProps['pivot'], value: number) => {
    setPivot({ ...pivot, [key]: value })
  }

  const handleScaleChange = (key: keyof ControlPanelProps['scale'], value: number) => {
    setScale({ ...scale, [key]: value })
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
  const parseScaleInput = (value: string) => {
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

  const handleExport = async (format: 'fbx' | 'glb' | 'gltf' | 'obj') => {
    if (!mesh) {
      alert('メッシュの生成待機中です')
      return
    }

    setIsExporting(true)
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
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
          await meshExporter.exportAsOBJ(mesh, fileName)
          break
      }
    } catch (error) {
      console.error(`Export error (${format}):`, error)
      alert(`エクスポート失敗: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="control-panel">
      <h2>メッシュ設定</h2>

      <div className="control-group">
        <label htmlFor="meshType">Mesh Type</label>
        <select
          id="meshType"
          className="mesh-type-select"
          value={meshType}
          onChange={handleMeshTypeChange}
        >
          {EFFECT_MESH_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="divisions">分割数</label>
        <input
          id="divisions"
          type="range"
          min={meshType === 'openCylinder' || meshType === 'plane' ? '1' : '3'}
          max="64"
          value={params.divisions}
          onChange={(e) => handleChange('divisions', parseInt(e.target.value))}
        />
        <span className="value">{params.divisions}</span>
      </div>

      <div className="control-group">
        <label htmlFor="widthDivisions">Width Divisions</label>
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

      <div className="control-group">
        <label htmlFor="thickness">厚み</label>
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

      <div className="control-group">
        <label htmlFor="length">長さ</label>
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

      <div className="control-group">
        <label htmlFor="curve">曲線強度</label>
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

      <div className="control-group">
        <label htmlFor="topCurve">Top Curve</label>
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

      <div className="control-group">
        <label htmlFor="taper">Taper</label>
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

      <div className="control-group">
        <label htmlFor="spread">Spread</label>
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

      <div className="control-group">
        <label htmlFor="twist">Twist</label>
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

      <div className="control-group">
        <label htmlFor="waveCount">Wave Count</label>
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

      {meshType === 'lightningRibbon' && (
        <div className="control-group">
          <label htmlFor="seed">Seed</label>
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
            <label htmlFor="cylinderDivisions">Cylinder Divisions</label>
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

          <div className="control-group">
            <label htmlFor="cylinderScale">Cylinder Scale</label>
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

      {(meshType === 'sphere' || meshType === 'zHemisphere') && (
        <div className="control-group">
          <label htmlFor="yClip">Y Clip</label>
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
        <span>ワイヤーフレーム</span>
        <button
          type="button"
          className={`toggle-btn ${wireframe ? 'active' : ''}`}
          onClick={() => setWireframe(!wireframe)}
        >
          {wireframe ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-group toggle-row">
        <span>UV表示</span>
        <button
          type="button"
          className={`toggle-btn ${showUV ? 'active' : ''}`}
          onClick={() => setShowUV(!showUV)}
        >
          {showUV ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-group toggle-row">
        <span>3D Texture</span>
        <button
          type="button"
          className={`toggle-btn ${showTextureIn3D ? 'active' : ''}`}
          onClick={() => setShowTextureIn3D(!showTextureIn3D)}
        >
          {showTextureIn3D ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-group texture-control">
        <label htmlFor="textureFile">Texture</label>
        <input
          ref={textureFileInputRef}
          id="textureFile"
          className="texture-file-input"
          type="file"
          accept="image/*"
          onChange={handleTextureInputChange}
        />
        <div className="texture-actions">
          <button
            type="button"
            className="texture-btn"
            onClick={() => textureFileInputRef.current?.click()}
          >
            Choose Image
          </button>
          <button
            type="button"
            className="texture-btn"
            onClick={handleTextureReset}
            disabled={!textureName}
          >
            Checker
          </button>
        </div>
        <div className="texture-name" title={textureName ?? 'Checker'}>
          {textureName ?? 'Checker'}
        </div>
      </div>

      <div className="control-group toggle-row">
        <span>UV Rotate</span>
        <button
          type="button"
          className={`toggle-btn ${uvRotation !== 0 ? 'active' : ''}`}
          onClick={() => setUVRotation((uvRotation + 90) % 360)}
        >
          {uvRotation} deg
        </button>
      </div>

      <div className="control-group toggle-row">
        <span>Mirror Z</span>
        <button
          type="button"
          className={`toggle-btn ${mirrorZ ? 'active' : ''}`}
          onClick={() => setMirrorZ(!mirrorZ)}
        >
          {mirrorZ ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-group toggle-row">
        <span>Polygon Count</span>
        <button
          type="button"
          className={`toggle-btn ${showPolygonCount ? 'active' : ''}`}
          onClick={() => setShowPolygonCount(!showPolygonCount)}
          disabled={!mesh}
        >
          {showPolygonCount ? 'ON' : 'SHOW'}
        </button>
      </div>

      <div className="control-group toggle-row">
        <span>Pivot</span>
        <button
          type="button"
          className={`toggle-btn ${showPivot ? 'active' : ''}`}
          onClick={() => setShowPivot(!showPivot)}
        >
          {showPivot ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-group">
        <label>Pivot Position</label>
        <div className="vector-inputs">
          <label>
            X
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title="Drag horizontally to adjust"
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
              title="Drag horizontally to adjust"
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
              title="Drag horizontally to adjust"
              value={pivot.z}
              onPointerDown={(e) => handlePivotDragStart(e, 'z')}
              onChange={(e) => handlePivotChange('z', parseFloat(e.target.value) || 0)}
            />
          </label>
        </div>
      </div>

      <div className="control-group">
        <label>Scale</label>
        <div className="vector-inputs">
          <label>
            X
            <input
              type="number"
              step="0.1"
              className="draggable-number"
              title="Drag horizontally to adjust"
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
              title="Drag horizontally to adjust"
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
              title="Drag horizontally to adjust"
              value={scale.z}
              onPointerDown={(e) => handleScaleDragStart(e, 'z')}
              onChange={(e) => handleScaleChange('z', parseScaleInput(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="export-section">
        <h3>エクスポート</h3>
        <div className="debug-info" style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
          Status: {mesh ? '✓ Ready' : '✗ Loading...'}
        </div>
        <div className="export-buttons">
          <button
            className="export-btn fbx-btn"
            onClick={() => handleExport('fbx')}
            disabled={isExporting || !mesh}
            title="FBX形式でダウンロード (Maya, 3DS Max, MotionBuilder対応)"
          >
            FBX
          </button>
          <button
            className="export-btn glb-btn"
            onClick={() => handleExport('glb')}
            disabled={isExporting || !mesh}
            title="GLB形式でダウンロード (Unity, UE5推奨)"
          >
            GLB
          </button>
          <button
            className="export-btn gltf-btn"
            onClick={() => handleExport('gltf')}
            disabled={isExporting || !mesh}
            title="GLTF形式でダウンロード (JSON形式)"
          >
            GLTF
          </button>
          <button
            className="export-btn obj-btn"
            onClick={() => handleExport('obj')}
            disabled={isExporting || !mesh}
            title="OBJ形式でダウンロード (汎用フォーマット)"
          >
            OBJ
          </button>
        </div>
        {isExporting && <p className="exporting-message">エクスポート中...</p>}
      </div>
    </div>
  )
}

export default ControlPanel
