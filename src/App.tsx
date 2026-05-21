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
  })
  const [wireframe, setWireframe] = useState(false)
  const [showUV, setShowUV] = useState(false)
  const [uvRotation, setUVRotation] = useState(0)
  const [showPivot, setShowPivot] = useState(false)
  const [pivot, setPivot] = useState<PivotParams>({ x: 0, y: 0, z: 0 })
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
          showPivot={showPivot}
          pivot={pivot}
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
          showPivot={showPivot}
          setShowPivot={setShowPivot}
          pivot={pivot}
          setPivot={setPivot}
        />
      </div>
    </div>
  )
}

export default App
