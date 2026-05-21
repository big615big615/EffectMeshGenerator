import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import * as meshExporter from '../exporters/meshExporter'
import {
  EFFECT_MESH_TYPE_OPTIONS,
  type EffectMeshParams,
  type EffectMeshType,
} from '../generators/effectMeshGenerator'
import './ControlPanel.css'

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
  uvRotation: number
  setUVRotation: (value: number) => void
  showPivot: boolean
  setShowPivot: (value: boolean) => void
  pivot: {
    x: number
    y: number
    z: number
  }
  setPivot: (value: ControlPanelProps['pivot']) => void
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
  uvRotation,
  setUVRotation,
  showPivot,
  setShowPivot,
  pivot,
  setPivot,
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const pivotDragRef = useRef<{
    key: keyof ControlPanelProps['pivot']
    startX: number
    startValue: number
  } | null>(null)

  const handleChange = (key: keyof ControlPanelProps['params'], value: number) => {
    setParams({ ...params, [key]: value })
  }

  const handleMeshTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMeshType(event.target.value as EffectMeshType)
  }

  const handlePivotChange = (key: keyof ControlPanelProps['pivot'], value: number) => {
    setPivot({ ...pivot, [key]: value })
  }

  const roundPivotValue = (value: number) => Math.round(value * 1000) / 1000

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
          min="3"
          max="32"
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
          min="1"
          max="10"
          step="0.5"
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
