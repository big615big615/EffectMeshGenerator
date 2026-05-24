import React, { useState } from 'react'
import * as THREE from 'three'
import Viewport from './components/Viewport'
import ControlPanel from './components/ControlPanel'
import type { EffectMeshParams, EffectMeshType } from './generators/effectMeshGenerator'
import './App.css'

interface PivotParams {
  x: number
  y: number
  z: number
}

interface ScaleParams {
  x: number
  y: number
  z: number
}

const App: React.FC = () => {
  const [meshType, setMeshType] = useState<EffectMeshType>('slash')
  const [params, setParams] = useState<EffectMeshParams>({
    divisions: 8,
    widthDivisions: 1,
    thickness: 0.5,
    length: 3,
    curve: 0.5,
    topCurve: 0,
    taper: 0,
    spread: 0,
    twist: 0,
    waveCount: 1,
  })
  const [wireframe, setWireframe] = useState(false)
  const [showUV, setShowUV] = useState(false)
  const [uvRotation, setUVRotation] = useState(0)
  const [mirrorZ, setMirrorZ] = useState(false)
  const [showPolygonCount, setShowPolygonCount] = useState(false)
  const [showPivot, setShowPivot] = useState(false)
  const [pivot, setPivot] = useState<PivotParams>({ x: 0, y: 0, z: 0 })
  const [scale, setScale] = useState<ScaleParams>({ x: 1, y: 1, z: 1 })
  const [currentMesh, setCurrentMesh] = useState<THREE.Mesh | undefined>(undefined)

  return (
    <div className="app-container">
      <div className="viewport-container">
        <Viewport
          meshType={meshType}
          params={params}
          wireframe={wireframe}
          showUV={showUV}
          uvRotation={uvRotation}
          mirrorZ={mirrorZ}
          showPolygonCount={showPolygonCount}
          showPivot={showPivot}
          pivot={pivot}
          scale={scale}
          onMeshReady={setCurrentMesh}
        />
      </div>
      <div className="control-panel-container">
        <ControlPanel
          meshType={meshType}
          setMeshType={setMeshType}
          params={params}
          setParams={setParams}
          mesh={currentMesh}
          wireframe={wireframe}
          setWireframe={setWireframe}
          showUV={showUV}
          setShowUV={setShowUV}
          uvRotation={uvRotation}
          setUVRotation={setUVRotation}
          mirrorZ={mirrorZ}
          setMirrorZ={setMirrorZ}
          showPolygonCount={showPolygonCount}
          setShowPolygonCount={setShowPolygonCount}
          showPivot={showPivot}
          setShowPivot={setShowPivot}
          pivot={pivot}
          setPivot={setPivot}
          scale={scale}
          setScale={setScale}
        />
      </div>
    </div>
  )
}

export default App
