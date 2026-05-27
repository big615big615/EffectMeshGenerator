import React, { useEffect, useState } from 'react'
import * as THREE from 'three'
import Viewport from './components/Viewport'
import ControlPanel from './components/ControlPanel'
import type { EffectMeshParams, EffectMeshType } from './generators/effectMeshGenerator'
import type { Language } from './i18n'
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

interface RotationParams {
  x: number
  y: number
  z: number
}

interface TexturePreview {
  url: string
  name: string
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
    seed: 0,
    yClip: 0,
    cylinderScale: 1,
  })
  const [wireframe, setWireframe] = useState(false)
  const [showUV, setShowUV] = useState(false)
  const [showTextureIn3D, setShowTextureIn3D] = useState(false)
  const [animateUVScroll, setAnimateUVScroll] = useState(false)
  const [uvScrollResetVersion, setUVScrollResetVersion] = useState(0)
  const [uvRotation, setUVRotation] = useState(0)
  const [mirrorZ, setMirrorZ] = useState(false)
  const [showPolygonCount, setShowPolygonCount] = useState(false)
  const [showPivot, setShowPivot] = useState(false)
  const [pivot, setPivot] = useState<PivotParams>({ x: 0, y: 0, z: 0 })
  const [scale, setScale] = useState<ScaleParams>({ x: 1, y: 1, z: 1 })
  const [rotation, setRotation] = useState<RotationParams>({ x: 0, y: 0, z: 0 })
  const [currentMesh, setCurrentMesh] = useState<THREE.Mesh | undefined>(undefined)
  const [texturePreview, setTexturePreview] = useState<TexturePreview | null>(null)
  const [language, setLanguage] = useState<Language>('ja')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    return () => {
      if (texturePreview) {
        URL.revokeObjectURL(texturePreview.url)
      }
    }
  }, [texturePreview])

  const handleTextureFileSelect = (file: File) => {
    setTexturePreview({
      url: URL.createObjectURL(file),
      name: file.name,
    })
    setShowTextureIn3D(true)
    setShowUV(true)
  }

  return (
    <div className="app-container">
      <div className="viewport-container">
        <Viewport
          meshType={meshType}
          params={params}
          wireframe={wireframe}
          showUV={showUV}
          showTextureIn3D={showTextureIn3D}
          animateUVScroll={animateUVScroll}
          uvScrollResetVersion={uvScrollResetVersion}
          uvRotation={uvRotation}
          mirrorZ={mirrorZ}
          showPolygonCount={showPolygonCount}
          showPivot={showPivot}
          pivot={pivot}
          scale={scale}
          rotation={rotation}
          textureSource={texturePreview}
          language={language}
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
          showTextureIn3D={showTextureIn3D}
          setShowTextureIn3D={setShowTextureIn3D}
          animateUVScroll={animateUVScroll}
          setAnimateUVScroll={setAnimateUVScroll}
          onUVScrollReset={() => setUVScrollResetVersion((version) => version + 1)}
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
          rotation={rotation}
          setRotation={setRotation}
          textureName={texturePreview?.name ?? null}
          onTextureFileSelect={handleTextureFileSelect}
          onTextureReset={() => setTexturePreview(null)}
          language={language}
          setLanguage={setLanguage}
        />
      </div>
    </div>
  )
}

export default App
