import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  generateDoubleSidedArcRibbonMesh,
  generateDoubleSidedCylinderSpiralRibbonMesh,
  generateDoubleSidedLightningRibbonMesh,
  generateDoubleSidedOpenCylinderMesh,
  generateDoubleSidedRisingSpiralRibbonMesh,
  generateDoubleSidedSlashMesh,
  generateEffectMesh,
  type EffectMeshParams,
  type EffectMeshType,
} from '../generators/effectMeshGenerator'
import { uiText, type Language } from '../i18n'
import './Viewport.css'

const UV_VIEW_PADDING = 1.08
const SLASH_UV_ROTATION_OFFSET = 270
const FRONT_SURFACE_COLOR = 0x00ff88
const FRONT_SURFACE_EMISSIVE = 0x00aa44
const BACK_SURFACE_COLOR = 0xff4f8b
const BACK_SURFACE_EMISSIVE = 0x66152d
const UV_SCROLL_SPEED = 0.35

interface TextureSource {
  url: string
  name: string
}

interface ViewportProps {
  meshType: EffectMeshType
  params: EffectMeshParams
  wireframe: boolean
  showUV: boolean
  showTextureIn3D: boolean
  animateUVScroll: boolean
  uvScrollResetVersion: number
  uvRotation: number
  mirrorZ: boolean
  doubleSided: boolean
  showPolygonCount: boolean
  showPivot: boolean
  pivot: {
    x: number
    y: number
    z: number
  }
  scale: {
    x: number
    y: number
    z: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
  textureSource: TextureSource | null
  language: Language
  onMeshReady?: (mesh: THREE.Mesh) => void
}

const Viewport: React.FC<ViewportProps> = ({
  meshType,
  params,
  wireframe,
  showUV,
  showTextureIn3D,
  animateUVScroll,
  uvScrollResetVersion,
  uvRotation,
  mirrorZ,
  doubleSided,
  showPolygonCount,
  showPivot,
  pivot,
  scale,
  rotation,
  textureSource,
  language,
  onMeshReady,
}) => {
  const [polygonCount, setPolygonCount] = useState(0)
  const t = uiText[language]
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const backMeshRef = useRef<THREE.Mesh | null>(null)
  const meshWireframeRef = useRef<THREE.Group | null>(null)
  const pivotMarkerRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const uvSceneRef = useRef<THREE.Scene | null>(null)
  const uvCameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const uvWireframeRef = useRef<THREE.Group | null>(null)
  const uvBackgroundRef = useRef<THREE.Mesh | null>(null)
  const checkerTextureRef = useRef<THREE.Texture | null>(null)
  const uploadedTextureRef = useRef<THREE.Texture | null>(null)
  const showUVRef = useRef(showUV)
  const showSurfaceTextureRef = useRef(showUV || showTextureIn3D)
  const animateUVScrollRef = useRef(animateUVScroll)

  useEffect(() => {
    showUVRef.current = showUV
  }, [showUV])

  useEffect(() => {
    showSurfaceTextureRef.current = showUV || showTextureIn3D
  }, [showUV, showTextureIn3D])

  useEffect(() => {
    animateUVScrollRef.current = animateUVScroll
  }, [animateUVScroll])

  useEffect(() => {
    resetPreviewTextureScroll()
  }, [uvScrollResetVersion])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)
    sceneRef.current = scene

    // Camera setup
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(3, 1, 3)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Initial mesh
    const geometry = createEffectGeometry(meshType, params, uvRotation, mirrorZ, doubleSided, pivot)
    const useDoubleSidedGeometry = shouldUseDoubleSidedGeometry(meshType, doubleSided)
    setPolygonCount(getGeometryPolygonCount(geometry))
    const checkerTexture = createCheckerTexture(8, 8)
    checkerTextureRef.current = checkerTexture
    const shouldShowSurfaceTexture = showUV || showTextureIn3D
    const frontMaterial = createSurfaceMaterial(
      THREE.FrontSide,
      true,
      shouldShowSurfaceTexture ? checkerTexture : null
    )
    const backMaterial = createSurfaceMaterial(
      THREE.BackSide,
      false,
      shouldShowSurfaceTexture ? checkerTexture : null
    )
    const mesh = new THREE.Mesh(geometry, frontMaterial)
    mesh.position.set(pivot.x, pivot.y, pivot.z)
    mesh.rotation.set(
      THREE.MathUtils.degToRad(rotation.x),
      THREE.MathUtils.degToRad(rotation.y),
      THREE.MathUtils.degToRad(rotation.z)
    )
    mesh.scale.set(scale.x, scale.y, scale.z)
    const backMesh = new THREE.Mesh(geometry, backMaterial)
    backMesh.visible = !useDoubleSidedGeometry
    mesh.add(backMesh)
    const meshWireframe = createMeshWireframe(geometry)
    meshWireframe.visible = wireframe
    mesh.add(meshWireframe)
    scene.add(mesh)
    meshRef.current = mesh
    backMeshRef.current = backMesh
    meshWireframeRef.current = meshWireframe

    const pivotMarker = createPivotMarker()
    pivotMarker.position.set(pivot.x, pivot.y, pivot.z)
    pivotMarker.visible = showPivot
    scene.add(pivotMarker)
    pivotMarkerRef.current = pivotMarker

    // UV preview scene setup
    const uvScene = new THREE.Scene()
    uvScene.background = new THREE.Color(0x0a0a0a)
    const uvCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)
    uvCamera.position.set(0, 0, 5)
    uvCamera.lookAt(0, 0, 0)
    updateUVPreviewCamera(uvCamera, Math.floor(width / 2), height)
    uvSceneRef.current = uvScene
    uvCameraRef.current = uvCamera

    const uvBackground = createUVBackground(checkerTexture)
    uvBackgroundRef.current = uvBackground
    uvScene.add(uvBackground)

    const uvWireframe = createUVWireframe(geometry)
    uvWireframeRef.current = uvWireframe
    uvScene.add(uvWireframe)

    // Notify parent component that mesh is ready
    if (onMeshReady) {
      onMeshReady(mesh)
    }

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.rotateSpeed = 0.8
    controls.minDistance = 2
    controls.maxDistance = 12
    controls.target.set(0, 0, 0)
    controls.update()

    // Animation loop
    let animationId: number
    let previousTime = performance.now()
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      const currentTime = performance.now()
      const deltaSeconds = (currentTime - previousTime) / 1000
      previousTime = currentTime

      if (animateUVScrollRef.current) {
        scrollPreviewTexture(deltaSeconds)
      }

      controls.update()

      if (showUVRef.current) {
        const currentWidth = containerRef.current?.clientWidth || width
        const currentHeight = containerRef.current?.clientHeight || height
        const halfWidth = Math.floor(currentWidth / 2)
        const uvWidth = currentWidth - halfWidth

        camera.aspect = halfWidth / currentHeight
        camera.updateProjectionMatrix()
        if (uvCameraRef.current) {
          updateUVPreviewCamera(uvCameraRef.current, uvWidth, currentHeight)
        }

        renderer.setScissorTest(true)

        // Render left side (3D mesh)
        renderer.setViewport(0, 0, halfWidth, currentHeight)
        renderer.setScissor(0, 0, halfWidth, currentHeight)
        renderer.setClearColor(0x1a1a1a, 1)
        renderer.clear()
        renderer.render(scene, camera)

        // Render right side (UV preview)
        renderer.setViewport(halfWidth, 0, uvWidth, currentHeight)
        renderer.setScissor(halfWidth, 0, uvWidth, currentHeight)
        renderer.setClearColor(0x0a0a0a, 1)
        renderer.clear()
        if (uvSceneRef.current && uvCameraRef.current) {
          renderer.render(uvSceneRef.current, uvCameraRef.current)
        }

        renderer.setScissorTest(false)
      } else {
        const currentWidth = containerRef.current?.clientWidth || width
        const currentHeight = containerRef.current?.clientHeight || height
        camera.aspect = currentWidth / currentHeight
        camera.updateProjectionMatrix()
        renderer.setViewport(0, 0, currentWidth, currentHeight)
        renderer.setClearColor(0x1a1a1a, 1)
        renderer.clear()
        renderer.render(scene, camera)
      }
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width
      const newHeight = containerRef.current?.clientHeight || height
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      if (uvCameraRef.current) {
        updateUVPreviewCamera(uvCameraRef.current, Math.ceil(newWidth / 2), newHeight)
      }
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      containerRef.current?.removeChild(renderer.domElement)
      geometry.dispose()
      if (meshWireframeRef.current) {
        disposeWireframeGroup(meshWireframeRef.current)
      }
      if (pivotMarkerRef.current) {
        disposePivotMarker(pivotMarkerRef.current)
      }
      if (uvBackgroundRef.current) {
        disposeUVBackground(uvBackgroundRef.current)
      }
      checkerTextureRef.current?.dispose()
      uploadedTextureRef.current?.dispose()
      frontMaterial.dispose()
      backMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  // Update mesh when params change
  useEffect(() => {
    if (!sceneRef.current || !meshRef.current) return

    const oldGeometry = meshRef.current.geometry
    const newGeometry = createEffectGeometry(meshType, params, uvRotation, mirrorZ, doubleSided, pivot)
    const useDoubleSidedGeometry = shouldUseDoubleSidedGeometry(meshType, doubleSided)
    setPolygonCount(getGeometryPolygonCount(newGeometry))
    meshRef.current.geometry = newGeometry
    if (backMeshRef.current) {
      backMeshRef.current.geometry = newGeometry
      backMeshRef.current.visible = !useDoubleSidedGeometry
    }
    meshRef.current.position.set(pivot.x, pivot.y, pivot.z)
    if (meshWireframeRef.current) {
      meshRef.current.remove(meshWireframeRef.current)
      disposeWireframeGroup(meshWireframeRef.current)
    }
    const newMeshWireframe = createMeshWireframe(newGeometry)
    newMeshWireframe.visible = wireframe
    meshRef.current.add(newMeshWireframe)
    meshWireframeRef.current = newMeshWireframe
    oldGeometry.dispose()

    if (uvWireframeRef.current) {
      uvSceneRef.current?.remove(uvWireframeRef.current)
      disposeWireframeGroup(uvWireframeRef.current)
      const newUVWireframe = createUVWireframe(newGeometry)
      uvWireframeRef.current = newUVWireframe
      uvSceneRef.current?.add(newUVWireframe)
    }
  }, [meshType, params, uvRotation, mirrorZ, doubleSided, pivot])

  useEffect(() => {
    if (!pivotMarkerRef.current) return

    pivotMarkerRef.current.visible = showPivot
    pivotMarkerRef.current.position.set(pivot.x, pivot.y, pivot.z)
  }, [showPivot, pivot])

  useEffect(() => {
    if (!meshRef.current) return

    meshRef.current.scale.set(scale.x, scale.y, scale.z)
  }, [scale])

  useEffect(() => {
    if (!meshRef.current) return

    meshRef.current.rotation.set(
      THREE.MathUtils.degToRad(rotation.x),
      THREE.MathUtils.degToRad(rotation.y),
      THREE.MathUtils.degToRad(rotation.z)
    )
  }, [rotation])

  useEffect(() => {
    if (!textureSource) {
      if (uploadedTextureRef.current) {
        uploadedTextureRef.current.dispose()
        uploadedTextureRef.current = null
      }

      applyPreviewTexture(getPreviewTexture())
      return
    }

    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.load(
      textureSource.url,
      (texture) => {
        if (cancelled) {
          texture.dispose()
          return
        }

        configurePreviewTexture(texture)
        uploadedTextureRef.current?.dispose()
        uploadedTextureRef.current = texture
        applyPreviewTexture(texture)
      },
      undefined,
      (error) => {
        console.error('Texture load error:', error)
        if (!cancelled) {
          uploadedTextureRef.current?.dispose()
          uploadedTextureRef.current = null
          applyPreviewTexture(getPreviewTexture())
        }
      }
    )

    return () => {
      cancelled = true
    }
  }, [textureSource?.url])

  // Sync wireframe state and preview texture display with the mesh material
  useEffect(() => {
    if (!meshRef.current) return

    const texture = getPreviewTexture()
    applyPreviewTexture(texture)

    const frontMaterial = meshRef.current.material
    const backMaterial = backMeshRef.current?.material
    const shouldShowSurfaceTexture = showUV || showTextureIn3D
    const updateMaterial = (mat: THREE.Material, isFrontSurface: boolean) => {
      if (mat instanceof THREE.MeshPhongMaterial) {
        mat.wireframe = false
        mat.map = shouldShowSurfaceTexture ? texture : null
        applySurfaceAppearance(mat, isFrontSurface, shouldShowSurfaceTexture)
        mat.polygonOffset = wireframe
        mat.needsUpdate = true
      }
    }

    if (Array.isArray(frontMaterial)) {
      frontMaterial.forEach((mat) => updateMaterial(mat, true))
    } else {
      updateMaterial(frontMaterial, true)
    }

    if (backMaterial) {
      if (Array.isArray(backMaterial)) {
        backMaterial.forEach((mat) => updateMaterial(mat, false))
      } else {
        updateMaterial(backMaterial, false)
      }
    }

    if (meshWireframeRef.current) {
      meshWireframeRef.current.visible = wireframe
    }
  }, [wireframe, showUV, showTextureIn3D])

  const configurePreviewTexture = (texture: THREE.Texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearFilter
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
  }

  const getPreviewTexture = (): THREE.Texture => {
    if (uploadedTextureRef.current) {
      return uploadedTextureRef.current
    }

    if (!checkerTextureRef.current) {
      checkerTextureRef.current = createCheckerTexture(8, 8)
    }

    return checkerTextureRef.current
  }

  const scrollPreviewTexture = (deltaSeconds: number) => {
    const texture = getPreviewTexture()
    texture.offset.y = wrapUnit(texture.offset.y + deltaSeconds * UV_SCROLL_SPEED)
  }

  const resetPreviewTextureScroll = () => {
    const texture = getPreviewTexture()
    texture.offset.y = 0
  }

  const wrapUnit = (value: number) => {
    return ((value % 1) + 1) % 1
  }

  const applyPreviewTexture = (texture: THREE.Texture) => {
    if (uvBackgroundRef.current) {
      const material = uvBackgroundRef.current.material

      if (material instanceof THREE.MeshBasicMaterial) {
        material.map = texture
        material.needsUpdate = true
      }
    }

    if (!meshRef.current) return

    const updateMaterial = (mat: THREE.Material, isFrontSurface: boolean) => {
      if (mat instanceof THREE.MeshPhongMaterial) {
        mat.map = showSurfaceTextureRef.current ? texture : null
        applySurfaceAppearance(mat, isFrontSurface, showSurfaceTextureRef.current)
        mat.needsUpdate = true
      }
    }

    const frontMaterial = meshRef.current.material
    const backMaterial = backMeshRef.current?.material

    if (Array.isArray(frontMaterial)) {
      frontMaterial.forEach((mat) => updateMaterial(mat, true))
    } else {
      updateMaterial(frontMaterial, true)
    }

    if (backMaterial) {
      if (Array.isArray(backMaterial)) {
        backMaterial.forEach((mat) => updateMaterial(mat, false))
      } else {
        updateMaterial(backMaterial, false)
      }
    }
  }

  const createCheckerTexture = (columns: number, rows: number): THREE.Texture => {
    const size = 512
    const totalCells = columns * rows
    const startHue = 0
    const endHue = 280
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const cellWidth = size / columns
    const cellHeight = size / rows

    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, size, size)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = y * columns + x + 1
        const hue = startHue + ((endHue - startHue) * (index - 1)) / Math.max(totalCells - 1, 1)
        const lightness = (x + y) % 2 === 0 ? 55 : 42
        ctx.fillStyle = `hsl(${hue}, 92%, ${lightness}%)`
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)'
        ctx.lineWidth = Math.max(3, cellHeight * 0.07)
        ctx.fillStyle = '#fff'
        ctx.font = `${Math.floor(cellHeight * 0.36)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeText(`${index}`, x * cellWidth + cellWidth / 2, y * cellHeight + cellHeight / 2)
        ctx.fillText(`${index}`, x * cellWidth + cellWidth / 2, y * cellHeight + cellHeight / 2)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
    return texture
  }

  const createSurfaceMaterial = (
    side: THREE.Side,
    isFrontSurface: boolean,
    map: THREE.Texture | null
  ): THREE.MeshPhongMaterial => {
    const material = new THREE.MeshPhongMaterial({
      wireframe: false,
      map,
      side,
      transparent: map !== null,
      alphaTest: map !== null ? 0.001 : 0,
      polygonOffset: wireframe,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    })
    applySurfaceAppearance(material, isFrontSurface, map !== null)
    return material
  }

  const applySurfaceAppearance = (
    material: THREE.MeshPhongMaterial,
    isFrontSurface: boolean,
    useTextureColor: boolean
  ) => {
    material.color.setHex(
      useTextureColor
        ? 0xffffff
        : isFrontSurface
          ? FRONT_SURFACE_COLOR
          : BACK_SURFACE_COLOR
    )
    material.emissive.setHex(
      useTextureColor
        ? 0x000000
        : isFrontSurface
          ? FRONT_SURFACE_EMISSIVE
          : BACK_SURFACE_EMISSIVE
    )
    material.transparent = useTextureColor
    material.alphaTest = useTextureColor ? 0.001 : 0
  }

  const createEffectGeometry = (
    selectedMeshType: EffectMeshType,
    meshParams: EffectMeshParams,
    rotation: number,
    shouldMirrorZ: boolean,
    shouldDoubleSide: boolean,
    pivotPosition: ViewportProps['pivot']
  ): THREE.BufferGeometry => {
    const geometry = shouldUseDoubleSidedGeometry(selectedMeshType, shouldDoubleSide)
      ? createDoubleSidedEffectGeometry(selectedMeshType, meshParams)
      : generateEffectMesh(selectedMeshType, meshParams)
    applyUVRotation(geometry, rotation + SLASH_UV_ROTATION_OFFSET)

    if (shouldMirrorZ) {
      const mirroredGeometry = createZMirroredGeometry(geometry)
      geometry.dispose()
      mirroredGeometry.translate(-pivotPosition.x, -pivotPosition.y, -pivotPosition.z)
      return mirroredGeometry
    }

    geometry.translate(-pivotPosition.x, -pivotPosition.y, -pivotPosition.z)
    return geometry
  }

  const shouldUseDoubleSidedGeometry = (
    selectedMeshType: EffectMeshType,
    shouldDoubleSide: boolean
  ): boolean =>
    (
      selectedMeshType === 'lightningRibbon' ||
      selectedMeshType === 'arcRibbon' ||
      selectedMeshType === 'slash' ||
      selectedMeshType === 'risingSpiralRibbon' ||
      selectedMeshType === 'cylinderSpiralRibbon' ||
      selectedMeshType === 'openCylinder'
    ) &&
    shouldDoubleSide

  const createDoubleSidedEffectGeometry = (
    selectedMeshType: EffectMeshType,
    meshParams: EffectMeshParams
  ): THREE.BufferGeometry => {
    if (selectedMeshType === 'slash') {
      return generateDoubleSidedSlashMesh(meshParams)
    }

    if (selectedMeshType === 'arcRibbon') {
      return generateDoubleSidedArcRibbonMesh(meshParams)
    }

    if (selectedMeshType === 'lightningRibbon') {
      return generateDoubleSidedLightningRibbonMesh(meshParams)
    }

    if (selectedMeshType === 'openCylinder') {
      return generateDoubleSidedOpenCylinderMesh(meshParams)
    }

    if (selectedMeshType === 'cylinderSpiralRibbon') {
      return generateDoubleSidedCylinderSpiralRibbonMesh(meshParams)
    }

    return generateDoubleSidedRisingSpiralRibbonMesh(meshParams)
  }

  const getGeometryPolygonCount = (geometry: THREE.BufferGeometry): number => {
    return geometry.index
      ? Math.floor(geometry.index.count / 3)
      : Math.floor((geometry.getAttribute('position')?.count ?? 0) / 3)
  }

  const createZMirroredGeometry = (sourceGeometry: THREE.BufferGeometry): THREE.BufferGeometry => {
    const sourcePosition = sourceGeometry.getAttribute('position')
    const sourceUV = sourceGeometry.getAttribute('uv')
    const sourceIndex = sourceGeometry.index
    const vertexCount = sourcePosition.count
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    for (let i = 0; i < vertexCount; i++) {
      positions.push(sourcePosition.getX(i), sourcePosition.getY(i), sourcePosition.getZ(i))

      if (sourceUV) {
        uvs.push(sourceUV.getX(i), sourceUV.getY(i))
      }
    }

    for (let i = 0; i < vertexCount; i++) {
      positions.push(sourcePosition.getX(i), sourcePosition.getY(i), -sourcePosition.getZ(i))

      if (sourceUV) {
        uvs.push(sourceUV.getX(i), sourceUV.getY(i))
      }
    }

    if (sourceIndex) {
      for (let i = 0; i < sourceIndex.count; i += 3) {
        const a = sourceIndex.getX(i)
        const b = sourceIndex.getX(i + 1)
        const c = sourceIndex.getX(i + 2)

        indices.push(a, b, c)
        indices.push(vertexCount + a, vertexCount + c, vertexCount + b)
      }
    } else {
      for (let i = 0; i < vertexCount; i += 3) {
        indices.push(i, i + 1, i + 2)
        indices.push(vertexCount + i, vertexCount + i + 2, vertexCount + i + 1)
      }
    }

    const mirroredGeometry = new THREE.BufferGeometry()
    mirroredGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))

    if (sourceUV) {
      mirroredGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    }

    mirroredGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
    mirroredGeometry.computeVertexNormals()
    return mirroredGeometry
  }

  const applyUVRotation = (geometry: THREE.BufferGeometry, rotation: number) => {
    const uvAttribute = geometry.getAttribute('uv')
    if (!uvAttribute) return

    const normalizedRotation = ((rotation % 360) + 360) % 360

    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i)
      const v = uvAttribute.getY(i)
      let rotatedU = u
      let rotatedV = v

      switch (normalizedRotation) {
        case 90:
          rotatedU = 1 - v
          rotatedV = u
          break
        case 180:
          rotatedU = 1 - u
          rotatedV = 1 - v
          break
        case 270:
          rotatedU = v
          rotatedV = 1 - u
          break
      }

      uvAttribute.setXY(i, rotatedU, rotatedV)
    }

    uvAttribute.needsUpdate = true
  }

  const updateUVPreviewCamera = (camera: THREE.OrthographicCamera, width: number, height: number) => {
    const aspect = width / Math.max(height, 1)

    if (aspect >= 1) {
      camera.left = -UV_VIEW_PADDING * aspect
      camera.right = UV_VIEW_PADDING * aspect
      camera.top = UV_VIEW_PADDING
      camera.bottom = -UV_VIEW_PADDING
    } else {
      camera.left = -UV_VIEW_PADDING
      camera.right = UV_VIEW_PADDING
      camera.top = UV_VIEW_PADDING / aspect
      camera.bottom = -UV_VIEW_PADDING / aspect
    }

    camera.updateProjectionMatrix()
  }

  const createUVBackground = (texture: THREE.Texture): THREE.Mesh => {
    const geometry = new THREE.PlaneGeometry(2, 2)
    geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(
        new Float32Array([
          0, 0,
          1, 0,
          0, 1,
          1, 1,
        ]),
        2
      )
    )

    const uvBackground = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.FrontSide,
        depthWrite: false,
      })
    )
    uvBackground.position.set(0, 0, -1)
    uvBackground.material.needsUpdate = true
    return uvBackground
  }

  const createUVWireframe = (geometry: THREE.BufferGeometry): THREE.Group => {
    const uvAttribute = geometry.getAttribute('uv')
    const index = geometry.index
    const positions: number[] = []

    const mapUV = (u: number, v: number) => {
      return [u * 2 - 1, 1 - v * 2]
    }

    if (uvAttribute) {
      const getUV = (i: number): [number, number] => [uvAttribute.getX(i), uvAttribute.getY(i)]

      if (index) {
        for (let i = 0; i < index.count; i += 3) {
          const a = index.getX(i)
          const b = index.getX(i + 1)
          const c = index.getX(i + 2)
          const [ax, ay] = mapUV(...getUV(a))
          const [bx, by] = mapUV(...getUV(b))
          const [cx, cy] = mapUV(...getUV(c))

          positions.push(ax, ay, 0, bx, by, 0)
          positions.push(bx, by, 0, cx, cy, 0)
          positions.push(cx, cy, 0, ax, ay, 0)
        }
      } else {
        for (let i = 0; i < uvAttribute.count; i += 3) {
          const [ax, ay] = mapUV(...getUV(i))
          const [bx, by] = mapUV(...getUV(i + 1))
          const [cx, cy] = mapUV(...getUV(i + 2))

          positions.push(ax, ay, 0, bx, by, 0)
          positions.push(bx, by, 0, cx, cy, 0)
          positions.push(cx, cy, 0, ax, ay, 0)
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    const shadowGeometry = lineGeometry.clone()

    const shadowLines = new THREE.LineSegments(
      shadowGeometry,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        depthTest: false,
        transparent: true,
        opacity: 0.9,
      })
    )
    shadowLines.position.z = 0.01

    const wireLines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: 0x00ff88,
        depthTest: false,
      })
    )
    wireLines.position.z = 0.02

    const wireframeGroup = new THREE.Group()
    wireframeGroup.add(shadowLines, wireLines)
    return wireframeGroup
  }

  const createMeshWireframe = (geometry: THREE.BufferGeometry): THREE.Group => {
    const shadowLines = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0x000000,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
      })
    )
    shadowLines.renderOrder = 1

    const wireLines = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0x00ff88,
        depthTest: true,
        depthWrite: false,
      })
    )
    wireLines.renderOrder = 2

    const wireframeGroup = new THREE.Group()
    wireframeGroup.add(shadowLines, wireLines)
    return wireframeGroup
  }

  const createPivotMarker = (): THREE.Group => {
    const markerGroup = new THREE.Group()
    const axes = new THREE.AxesHelper(0.45)
    axes.renderOrder = 10
    axes.traverse((object) => {
      if (object instanceof THREE.LineSegments) {
        const material = object.material
        if (Array.isArray(material)) {
          material.forEach((item) => {
            item.depthTest = false
            item.depthWrite = false
          })
        } else {
          material.depthTest = false
          material.depthWrite = false
        }
      }
    })

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 8),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        depthTest: false,
        depthWrite: false,
      })
    )
    center.renderOrder = 11

    markerGroup.add(axes, center)
    return markerGroup
  }

  const disposePivotMarker = (markerGroup: THREE.Group) => {
    markerGroup.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        object.geometry.dispose()

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }

  const disposeUVBackground = (background: THREE.Mesh) => {
    background.geometry.dispose()

    if (Array.isArray(background.material)) {
      background.material.forEach((material) => material.dispose())
    } else {
      background.material.dispose()
    }
  }

  const disposeWireframeGroup = (wireframeGroup: THREE.Group) => {
    wireframeGroup.traverse((object) => {
      if (object instanceof THREE.LineSegments) {
        object.geometry.dispose()

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }

  return (
    <div ref={containerRef} className="viewport">
      {showPolygonCount && (
        <div className={`polygon-count-overlay ${showUV ? 'uv-visible' : ''}`}>
          {polygonCount.toLocaleString()} {t.triangles}
        </div>
      )}
    </div>
  )
}

export default Viewport
