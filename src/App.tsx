import React, { useState } from 'react'
import * as THREE from 'three'
import Viewport from './components/Viewport'
import ControlPanel from './components/ControlPanel'
import './App.css'

interface MeshParams {
  divisions: number
  thickness: number
  length: number
  curve: number
}

interface PivotParams {
  x: number
  y: number
  z: number
}

const App: React.FC = () => {
  const [params, setParams] = useState<MeshParams>({
    divisions: 8,
    thickness: 0.5,
    length: 3,
    curve: 0.5,
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
