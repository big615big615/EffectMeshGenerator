import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  generateCrossEffectMesh,
  generateDoubleSidedCrossEffectMesh,
  generateDoubleSidedArcRibbonMesh,
  generateDoubleSidedCylinderSpiralRibbonMesh,
  generateDoubleSidedLightningRibbonMesh,
  generateDoubleSidedOpenCylinderMesh,
  generateDoubleSidedRisingSpiralRibbonMesh,
  generateDoubleSidedRibbonMesh,
  generateDoubleSidedSlashMesh,
  generateEffectMesh,
  type EffectMeshParams,
  type EffectMeshType,
} from '../generators/effectMeshGenerator'
import {
  HONEYCOMB_PARTS_USER_DATA_KEY,
  getHoneycombPartsUserData,
  type HoneycombPartsUserData,
} from '../generators/honeycombPartMetadata'
import { uiText, type Language } from '../i18n'
import {
  getMeshTypeTemplateOptions,
  getMeshTypeTemplateParams,
  MESH_TYPE_OPTION_VALUES,
} from '../meshTypeTemplates'
import './Viewport.css'

const UV_VIEW_PADDING = 1.08
const SLASH_UV_ROTATION_OFFSET = 270
const HONEYCOMB_UV_ROTATION_OFFSET = 0
const FRONT_SURFACE_COLOR = 0x00ff88
const FRONT_SURFACE_EMISSIVE = 0x00aa44
const BACK_SURFACE_COLOR = 0xff4f8b
const BACK_SURFACE_EMISSIVE = 0x66152d
const UV_SCROLL_SPEED = 0.35
const THUMBNAIL_CAMERA_SIZE = 1.55
const DEFAULT_VERTEX_ALPHA_RANGE = 0.5
const PIVOT_RING_OBJECT_NAME = 'pivot-camera-facing-ring'

// Management controls: set to true when exposing thumbnail angle export.
const SHOW_MANAGEMENT_CONTROLS = false

interface ThumbnailRotationDegrees {
  x: number
  y: number
}

const DEFAULT_THUMBNAIL_ROTATION: ThumbnailRotationDegrees = { x: -12, y: 34 }
const THUMBNAIL_INITIAL_ROTATIONS: Partial<Record<EffectMeshType, ThumbnailRotationDegrees>> = {
  slash: { x: 1.178, y: -28.452 },
  arc: { x: 6.908, y: -32.463 },
  openCylinder: { x: 16.648, y: 30.562 },
  arcRibbon: { x: 3.47, y: -10.118 },
  ribbon: { x: 0.032, y: 11.082 },
  lightningRibbon: { x: 2.324, y: 9.363 },
  risingSpiralRibbon: { x: 27.534, y: 35.146 },
  cylinderSpiralRibbon: { x: -3.406, y: 31.135 },
  plane: { x: 1.178, y: 5.925 },
  honeycombPlane: { x: 1.178, y: 5.925 },
  honeycombRadialPlane: { x: 1.178, y: 5.925 },
  honeycombSphere: { x: 28.107, y: 33.427 },
  flatRing: { x: -8.562, y: -2.669 },
  sphere: { x: 28.107, y: 33.427 },
  hemisphere: { x: 27.534, y: 26.552 },
  zHemisphere: { x: 18.94, y: -61.111 },
  beamDome: { x: 28.107, y: -33.036 },
}

interface MeshThumbnailItem {
  scene: THREE.Scene
  camera: THREE.OrthographicCamera
  mesh: THREE.Mesh
  rotationX: number
  rotationY: number
}

interface MeshThumbnailDragState {
  itemIndex: number
  startX: number
  startY: number
  startRotationX: number
  startRotationY: number
}

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
  autoRotateY: boolean
  autoRotateYSpeed: number
  showMeshTypeGrid: boolean
  uvScrollResetVersion: number
  uvRotation: number
  mirrorZ: boolean
  doubleSided: boolean
  crossMesh: boolean
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
  textureTiling: {
    x: number
    y: number
  }
  textureSource: TextureSource | null
  language: Language
  onMeshReady?: (mesh: THREE.Mesh) => void
  onMeshTypeSelect?: (meshType: EffectMeshType) => void
}

const Viewport: React.FC<ViewportProps> = ({
  meshType,
  params,
  wireframe,
  showUV,
  showTextureIn3D,
  animateUVScroll,
  autoRotateY,
  autoRotateYSpeed,
  showMeshTypeGrid,
  uvScrollResetVersion,
  uvRotation,
  mirrorZ,
  doubleSided,
  crossMesh,
  showPolygonCount,
  showPivot,
  pivot,
  scale,
  rotation,
  textureTiling,
  textureSource,
  language,
  onMeshReady,
  onMeshTypeSelect,
}) => {
  const [polygonCount, setPolygonCount] = useState(0)
  const [thumbnailColumns, setThumbnailColumns] = useState(4)
  const [thumbnailRotationExportMessage, setThumbnailRotationExportMessage] = useState('')
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
  const autoRotateYRef = useRef(autoRotateY)
  const autoRotateYSpeedRef = useRef(autoRotateYSpeed)
  const showMeshTypeGridRef = useRef(showMeshTypeGrid)
  const rotationRef = useRef(rotation)
  const autoRotateYOffsetRef = useRef(0)
  const meshThumbnailItemsRef = useRef<MeshThumbnailItem[]>([])
  const meshThumbnailDragRef = useRef<MeshThumbnailDragState | null>(null)
  const meshThumbnailGridNeedsRenderRef = useRef(true)
  const cameraViewOffsetRef = useRef({ x: 0, y: 0 })
  const cameraViewOffsetDragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    startOffsetX: number
    startOffsetY: number
  } | null>(null)

  const markMeshThumbnailGridDirty = () => {
    meshThumbnailGridNeedsRenderRef.current = true
  }

  const applyMeshRotation = (yOffsetDegrees = 0) => {
    if (!meshRef.current) return

    const currentRotation = rotationRef.current
    meshRef.current.rotation.set(
      THREE.MathUtils.degToRad(currentRotation.x),
      THREE.MathUtils.degToRad(currentRotation.y + yOffsetDegrees),
      THREE.MathUtils.degToRad(currentRotation.z)
    )
  }

  const updateCameraProjection = (
    camera: THREE.PerspectiveCamera,
    viewportWidth: number,
    viewportHeight: number
  ) => {
    camera.aspect = viewportWidth / viewportHeight

    const viewOffset = cameraViewOffsetRef.current
    if (Math.abs(viewOffset.x) < 0.001 && Math.abs(viewOffset.y) < 0.001) {
      camera.clearViewOffset()
    } else {
      camera.setViewOffset(
        viewportWidth,
        viewportHeight,
        viewOffset.x,
        viewOffset.y,
        viewportWidth,
        viewportHeight
      )
    }

    camera.updateProjectionMatrix()
  }

  const renderPreviewScene = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) => {
    applyMeshRotation(autoRotateYRef.current ? autoRotateYOffsetRef.current : 0)
    updatePivotMarkerFacing(camera)
    renderer.render(scene, camera)
    applyMeshRotation(0)
  }

  const updatePivotMarkerFacing = (camera: THREE.PerspectiveCamera) => {
    const pivotMarker = pivotMarkerRef.current
    if (!pivotMarker) return

    const ring = pivotMarker.getObjectByName(PIVOT_RING_OBJECT_NAME)
    if (ring) {
      ring.quaternion.copy(camera.quaternion)
    }
  }

  const renderMeshThumbnailGrid = (
    renderer: THREE.WebGLRenderer,
    width: number,
    height: number
  ) => {
    const items = meshThumbnailItemsRef.current
    if (items.length === 0) return

    const columns = getThumbnailColumnCount(width, items.length)
    const rows = Math.ceil(items.length / columns)
    const cellWidth = width / columns
    const cellHeight = height / rows
    const yRotationOffset = autoRotateYRef.current ? THREE.MathUtils.degToRad(autoRotateYOffsetRef.current) : 0

    renderer.setScissorTest(true)

    items.forEach((item, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const viewportX = Math.floor(column * cellWidth)
      const viewportY = Math.floor(height - (row + 1) * cellHeight)
      const viewportWidth = Math.ceil(cellWidth)
      const viewportHeight = Math.ceil(cellHeight)

      updateThumbnailCamera(item.camera, viewportWidth, viewportHeight)
      item.mesh.rotation.set(
        item.rotationX,
        item.rotationY + yRotationOffset,
        0
      )

      renderer.setViewport(viewportX, viewportY, viewportWidth, viewportHeight)
      renderer.setScissor(viewportX, viewportY, viewportWidth, viewportHeight)
      renderer.setClearColor(0x151515, 1)
      renderer.clear()
      renderer.render(item.scene, item.camera)
    })

    renderer.setScissorTest(false)
  }

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
    autoRotateYRef.current = autoRotateY

    if (!autoRotateY) {
      autoRotateYOffsetRef.current = 0
      applyMeshRotation(0)
    }

    markMeshThumbnailGridDirty()
  }, [autoRotateY])

  useEffect(() => {
    autoRotateYSpeedRef.current = autoRotateYSpeed
  }, [autoRotateYSpeed])

  useEffect(() => {
    cameraViewOffsetRef.current = { x: 0, y: 0 }

    const camera = cameraRef.current
    const container = containerRef.current
    if (!camera || !container) return

    const viewportWidth = showUVRef.current
      ? Math.floor(container.clientWidth / 2)
      : container.clientWidth
    updateCameraProjection(camera, viewportWidth, container.clientHeight)
  }, [meshType])

  useEffect(() => {
    showMeshTypeGridRef.current = showMeshTypeGrid

    if (showMeshTypeGrid) {
      meshThumbnailItemsRef.current = createMeshThumbnailItems()
      setThumbnailColumns(
        getThumbnailColumnCount(
          containerRef.current?.clientWidth ?? 0,
          meshThumbnailItemsRef.current.length
        )
      )
      markMeshThumbnailGridDirty()
      return
    }

    disposeMeshThumbnailItems(meshThumbnailItemsRef.current)
    meshThumbnailItemsRef.current = []
    meshThumbnailDragRef.current = null
  }, [showMeshTypeGrid])

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
    const geometry = createEffectGeometry(meshType, params, uvRotation, mirrorZ, doubleSided, crossMesh, pivot)
    const useDoubleSidedGeometry = shouldUseDoubleSidedGeometry(meshType, doubleSided)
    setPolygonCount(getGeometryPolygonCount(geometry))
    const checkerTexture = createCheckerTexture(8, 8)
    checkerTextureRef.current = checkerTexture
    const shouldShowSurfaceTexture = showUV || showTextureIn3D
    const frontMaterial = createSurfaceMaterial(
      THREE.FrontSide,
      true,
      shouldShowSurfaceTexture ? checkerTexture : null,
      hasVertexAlpha(geometry)
    )
    const backMaterial = createSurfaceMaterial(
      THREE.BackSide,
      false,
      shouldShowSurfaceTexture ? checkerTexture : null,
      hasVertexAlpha(geometry)
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
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.ROTATE,
    }
    controls.rotateSpeed = 0.8
    controls.minDistance = 2
    controls.maxDistance = 12
    controls.target.set(0, 0, 0)
    controls.update()

    const applyCurrentCameraViewOffset = () => {
      const currentWidth = containerRef.current?.clientWidth || width
      const currentHeight = containerRef.current?.clientHeight || height
      const previewWidth = showUVRef.current ? Math.floor(currentWidth / 2) : currentWidth
      updateCameraProjection(camera, previewWidth, currentHeight)
    }

    const handleCameraViewOffsetPointerDown = (event: PointerEvent) => {
      if (event.button !== 1 || showMeshTypeGridRef.current) return

      event.preventDefault()
      event.stopPropagation()
      renderer.domElement.setPointerCapture(event.pointerId)
      cameraViewOffsetDragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startOffsetX: cameraViewOffsetRef.current.x,
        startOffsetY: cameraViewOffsetRef.current.y,
      }
      document.body.style.cursor = 'move'
    }

    const handleCameraViewOffsetPointerMove = (event: PointerEvent) => {
      const drag = cameraViewOffsetDragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return

      event.preventDefault()
      cameraViewOffsetRef.current = {
        x: drag.startOffsetX - (event.clientX - drag.startX),
        y: drag.startOffsetY - (event.clientY - drag.startY),
      }
      applyCurrentCameraViewOffset()
    }

    const handleCameraViewOffsetPointerUp = (event: PointerEvent) => {
      const drag = cameraViewOffsetDragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return

      cameraViewOffsetDragRef.current = null
      document.body.style.cursor = ''
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId)
      }
    }

    renderer.domElement.addEventListener('pointerdown', handleCameraViewOffsetPointerDown, {
      capture: true,
    })
    renderer.domElement.addEventListener('pointermove', handleCameraViewOffsetPointerMove)
    renderer.domElement.addEventListener('pointerup', handleCameraViewOffsetPointerUp)
    renderer.domElement.addEventListener('pointercancel', handleCameraViewOffsetPointerUp)

    // Animation loop
    let animationId: number
    let previousTime = performance.now()
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      const currentTime = performance.now()
      const deltaSeconds = (currentTime - previousTime) / 1000
      previousTime = currentTime

      if (!showMeshTypeGridRef.current && animateUVScrollRef.current) {
        scrollPreviewTexture(deltaSeconds)
      }

      if (autoRotateYRef.current) {
        autoRotateYOffsetRef.current =
          (autoRotateYOffsetRef.current + deltaSeconds * autoRotateYSpeedRef.current) % 360
      }

      controls.update()

      if (showMeshTypeGridRef.current) {
        const currentWidth = containerRef.current?.clientWidth || width
        const currentHeight = containerRef.current?.clientHeight || height

        if (autoRotateYRef.current || meshThumbnailGridNeedsRenderRef.current) {
          renderer.setViewport(0, 0, currentWidth, currentHeight)
          renderer.setScissorTest(false)
          renderer.setClearColor(0x151515, 1)
          renderer.clear()
          renderMeshThumbnailGrid(renderer, currentWidth, currentHeight)
          meshThumbnailGridNeedsRenderRef.current = false
        }

        return
      }

      if (showUVRef.current) {
        const currentWidth = containerRef.current?.clientWidth || width
        const currentHeight = containerRef.current?.clientHeight || height
        const halfWidth = Math.floor(currentWidth / 2)
        const uvWidth = currentWidth - halfWidth

        updateCameraProjection(camera, halfWidth, currentHeight)
        if (uvCameraRef.current) {
          updateUVPreviewCamera(uvCameraRef.current, uvWidth, currentHeight)
        }

        renderer.setScissorTest(true)

        // Render left side (3D mesh)
        renderer.setViewport(0, 0, halfWidth, currentHeight)
        renderer.setScissor(0, 0, halfWidth, currentHeight)
        renderer.setClearColor(0x1a1a1a, 1)
        renderer.clear()
        renderPreviewScene(renderer, scene, camera)

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
        updateCameraProjection(camera, currentWidth, currentHeight)
        renderer.setViewport(0, 0, currentWidth, currentHeight)
        renderer.setClearColor(0x1a1a1a, 1)
        renderer.clear()
        renderPreviewScene(renderer, scene, camera)
      }
    }
    animate()

    // Handle viewport resize from both window changes and panel collapse/expand.
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width
      const newHeight = containerRef.current?.clientHeight || height
      if (newWidth <= 0 || newHeight <= 0) return

      updateCameraProjection(camera, showUVRef.current ? Math.floor(newWidth / 2) : newWidth, newHeight)
      if (uvCameraRef.current) {
        updateUVPreviewCamera(uvCameraRef.current, Math.ceil(newWidth / 2), newHeight)
      }
      renderer.setSize(newWidth, newHeight)
      setThumbnailColumns(getThumbnailColumnCount(newWidth, meshThumbnailItemsRef.current.length))
      markMeshThumbnailGridDirty()
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => handleResize())
        : null
    if (resizeObserver) {
      resizeObserver.observe(containerRef.current)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('pointerdown', handleCameraViewOffsetPointerDown, {
        capture: true,
      })
      renderer.domElement.removeEventListener('pointermove', handleCameraViewOffsetPointerMove)
      renderer.domElement.removeEventListener('pointerup', handleCameraViewOffsetPointerUp)
      renderer.domElement.removeEventListener('pointercancel', handleCameraViewOffsetPointerUp)
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
      disposeMeshThumbnailItems(meshThumbnailItemsRef.current)
      meshThumbnailItemsRef.current = []
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
    const newGeometry = createEffectGeometry(meshType, params, uvRotation, mirrorZ, doubleSided, crossMesh, pivot)
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

    applyPreviewTexture(getPreviewTexture())
    onMeshReady?.(meshRef.current)
  }, [meshType, params, uvRotation, mirrorZ, doubleSided, crossMesh, pivot])

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

    rotationRef.current = rotation
    applyMeshRotation(0)
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

  useEffect(() => {
    if (checkerTextureRef.current) {
      applyTextureTiling(checkerTextureRef.current)
    }

    if (uploadedTextureRef.current) {
      applyTextureTiling(uploadedTextureRef.current)
    }

    applyPreviewTexture(getPreviewTexture())
  }, [textureTiling])

  // Sync wireframe state and preview texture display with the mesh material
  useEffect(() => {
    if (!meshRef.current) return

    const texture = getPreviewTexture()
    applyPreviewTexture(texture)

    const frontMaterial = meshRef.current.material
    const backMaterial = backMeshRef.current?.material
    const shouldShowSurfaceTexture = showUV || showTextureIn3D
    const useVertexAlpha = hasVertexAlpha(meshRef.current.geometry)
    const updateMaterial = (mat: THREE.Material, isFrontSurface: boolean) => {
      if (mat instanceof THREE.MeshPhongMaterial) {
        mat.wireframe = false
        mat.map = shouldShowSurfaceTexture ? texture : null
        mat.emissiveMap = shouldShowSurfaceTexture ? texture : null
        applySurfaceAppearance(mat, isFrontSurface, shouldShowSurfaceTexture, useVertexAlpha)
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
    applyTextureTiling(texture)
    texture.needsUpdate = true
  }

  const applyTextureTiling = (texture: THREE.Texture) => {
    texture.repeat.set(
      Math.max(0.01, textureTiling.x),
      Math.max(0.01, textureTiling.y)
    )
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

    const useVertexAlpha = hasVertexAlpha(meshRef.current.geometry)
    const updateMaterial = (mat: THREE.Material, isFrontSurface: boolean) => {
      if (mat instanceof THREE.MeshPhongMaterial) {
        mat.map = showSurfaceTextureRef.current ? texture : null
        mat.emissiveMap = showSurfaceTextureRef.current ? texture : null
        applySurfaceAppearance(mat, isFrontSurface, showSurfaceTextureRef.current, useVertexAlpha)
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
    applyTextureTiling(texture)
    texture.needsUpdate = true
    return texture
  }

  const createSurfaceMaterial = (
    side: THREE.Side,
    isFrontSurface: boolean,
    map: THREE.Texture | null,
    useVertexAlpha: boolean
  ): THREE.MeshPhongMaterial => {
    const material = new THREE.MeshPhongMaterial({
      wireframe: false,
      map,
      side,
      vertexColors: useVertexAlpha,
      transparent: map !== null || useVertexAlpha,
      alphaTest: map !== null || useVertexAlpha ? 0.001 : 0,
      polygonOffset: wireframe,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    })
    applySurfaceAppearance(material, isFrontSurface, map !== null, useVertexAlpha)
    return material
  }

  const applySurfaceAppearance = (
    material: THREE.MeshPhongMaterial,
    isFrontSurface: boolean,
    useTextureColor: boolean,
    useVertexAlpha: boolean
  ) => {
    material.vertexColors = useVertexAlpha
    material.color.setHex(
      useTextureColor
        ? 0x000000
        : isFrontSurface
          ? FRONT_SURFACE_COLOR
          : BACK_SURFACE_COLOR
    )
    material.emissive.setHex(
      useTextureColor
        ? 0xffffff
        : isFrontSurface
          ? FRONT_SURFACE_EMISSIVE
          : BACK_SURFACE_EMISSIVE
    )
    material.emissiveMap = useTextureColor ? material.map : null
    material.transparent = useTextureColor || useVertexAlpha
    material.alphaTest = useTextureColor || useVertexAlpha ? 0.001 : 0
  }

  const handleViewportPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!showMeshTypeGrid || event.button !== 0 || !containerRef.current) return

    const itemIndex = getThumbnailIndexFromPointer(event.clientX, event.clientY)
    if (itemIndex === null) return

    const item = meshThumbnailItemsRef.current[itemIndex]
    if (!item) return

    event.preventDefault()
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    meshThumbnailDragRef.current = {
      itemIndex,
      startX: event.clientX,
      startY: event.clientY,
      startRotationX: item.rotationX,
      startRotationY: item.rotationY,
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const drag = meshThumbnailDragRef.current
      if (!drag) return

      const targetItem = meshThumbnailItemsRef.current[drag.itemIndex]
      if (!targetItem) return

      moveEvent.preventDefault()
      const deltaX = moveEvent.clientX - drag.startX
      const deltaY = moveEvent.clientY - drag.startY
      targetItem.rotationY = drag.startRotationY + deltaX * 0.01
      targetItem.rotationX = drag.startRotationX + deltaY * 0.01
      markMeshThumbnailGridDirty()
    }

    const handlePointerUp = () => {
      meshThumbnailDragRef.current = null
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  const handleThumbnailRotationExport = async () => {
    const output = createThumbnailRotationOutput()
    console.info(output)

    try {
      await navigator.clipboard.writeText(output)
      setThumbnailRotationExportMessage(t.thumbnailRotationCopied)
    } catch {
      setThumbnailRotationExportMessage(t.thumbnailRotationLogged)
    }

    window.setTimeout(() => setThumbnailRotationExportMessage(''), 2200)
  }

  const createThumbnailRotationOutput = () => {
    const rotationLines = MESH_TYPE_OPTION_VALUES.map((value, index) => {
      const item = meshThumbnailItemsRef.current[index]
      const rotation = item
        ? {
            x: THREE.MathUtils.radToDeg(item.rotationX),
            y: THREE.MathUtils.radToDeg(item.rotationY),
          }
        : getThumbnailInitialRotation(value)

      return `  ${value}: { x: ${formatRotationDegrees(rotation.x)}, y: ${formatRotationDegrees(rotation.y)} },`
    })

    return [
      'const THUMBNAIL_INITIAL_ROTATIONS: Partial<Record<EffectMeshType, ThumbnailRotationDegrees>> = {',
      ...rotationLines,
      '}',
    ].join('\n')
  }

  const formatRotationDegrees = (value: number) => {
    const roundedValue = Math.round(value * 1000) / 1000
    return Object.is(roundedValue, -0) ? '0' : String(roundedValue)
  }

  const getThumbnailIndexFromPointer = (clientX: number, clientY: number): number | null => {
    const container = containerRef.current
    const items = meshThumbnailItemsRef.current
    if (!container || items.length === 0) return null

    const rect = container.getBoundingClientRect()
    const localX = clientX - rect.left
    const localY = clientY - rect.top
    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) return null

    const columns = getThumbnailColumnCount(rect.width, items.length)
    const rows = Math.ceil(items.length / columns)
    const column = Math.min(columns - 1, Math.floor(localX / (rect.width / columns)))
    const row = Math.min(rows - 1, Math.floor(localY / (rect.height / rows)))
    const itemIndex = row * columns + column
    return itemIndex < items.length ? itemIndex : null
  }

  const getThumbnailColumnCount = (width: number, itemCount: number) => {
    const preferredColumns = width >= 1320 ? 5 : width >= 900 ? 4 : width >= 620 ? 3 : 2
    return Math.min(preferredColumns, Math.max(itemCount, 1))
  }

  const updateThumbnailCamera = (
    camera: THREE.OrthographicCamera,
    width: number,
    height: number
  ) => {
    const aspect = width / Math.max(height, 1)
    camera.left = -THUMBNAIL_CAMERA_SIZE * aspect
    camera.right = THUMBNAIL_CAMERA_SIZE * aspect
    camera.top = THUMBNAIL_CAMERA_SIZE
    camera.bottom = -THUMBNAIL_CAMERA_SIZE
    camera.updateProjectionMatrix()
  }

  const createMeshThumbnailItems = (): MeshThumbnailItem[] => {
    return MESH_TYPE_OPTION_VALUES.map((value) => {
      const geometry = createEffectGeometry(
        value,
        getMeshTypeTemplateParams(value),
        0,
        getMeshTypeTemplateOptions(value).mirrorZ,
        false,
        false,
        { x: 0, y: 0, z: 0 }
      )
      normalizeThumbnailGeometry(geometry)

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x151515)
      scene.add(new THREE.AmbientLight(0xffffff, 0.72))

      const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
      keyLight.position.set(2.5, 3, 4)
      scene.add(keyLight)

      const frontMaterial = new THREE.MeshPhongMaterial({
        color: FRONT_SURFACE_COLOR,
        emissive: FRONT_SURFACE_EMISSIVE,
        side: THREE.FrontSide,
        shininess: 30,
      })
      const backMaterial = new THREE.MeshPhongMaterial({
        color: BACK_SURFACE_COLOR,
        emissive: BACK_SURFACE_EMISSIVE,
        side: THREE.BackSide,
        shininess: 24,
      })
      const initialRotation = getThumbnailInitialRotation(value)
      const initialRotationX = THREE.MathUtils.degToRad(initialRotation.x)
      const initialRotationY = THREE.MathUtils.degToRad(initialRotation.y)
      const mesh = new THREE.Mesh(geometry, frontMaterial)
      mesh.rotation.set(initialRotationX, initialRotationY, 0)
      const backMesh = new THREE.Mesh(geometry, backMaterial)
      mesh.add(backMesh)
      mesh.add(createMeshWireframe(geometry))
      scene.add(mesh)

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20)
      camera.position.set(0, 0, 5)
      camera.lookAt(0, 0, 0)
      updateThumbnailCamera(camera, 1, 1)

      return {
        scene,
        camera,
        mesh,
        rotationX: initialRotationX,
        rotationY: initialRotationY,
      }
    })
  }

  const getThumbnailInitialRotation = (selectedMeshType: EffectMeshType): ThumbnailRotationDegrees => {
    return THUMBNAIL_INITIAL_ROTATIONS[selectedMeshType] ?? DEFAULT_THUMBNAIL_ROTATION
  }

  const normalizeThumbnailGeometry = (geometry: THREE.BufferGeometry) => {
    geometry.computeBoundingBox()
    const boundingBox = geometry.boundingBox
    if (!boundingBox) return

    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    boundingBox.getCenter(center)
    boundingBox.getSize(size)
    geometry.translate(-center.x, -center.y, -center.z)

    const largestAxis = Math.max(size.x, size.y, size.z, 0.001)
    const scale = 1.9 / largestAxis
    geometry.scale(scale, scale, scale)
    geometry.computeBoundingSphere()
  }

  const disposeMeshThumbnailItems = (items: MeshThumbnailItem[]) => {
    items.forEach(({ scene }) => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose()

          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    })
  }

  const createEffectGeometry = (
    selectedMeshType: EffectMeshType,
    meshParams: EffectMeshParams,
    rotation: number,
    shouldMirrorZ: boolean,
    shouldDoubleSide: boolean,
    shouldCrossMesh: boolean,
    pivotPosition: ViewportProps['pivot']
  ): THREE.BufferGeometry => {
    const geometry =
      shouldUseCrossGeometry(selectedMeshType, shouldCrossMesh) && shouldUseDoubleSidedGeometry(selectedMeshType, shouldDoubleSide)
        ? generateDoubleSidedCrossEffectMesh(selectedMeshType, meshParams)
        : shouldUseCrossGeometry(selectedMeshType, shouldCrossMesh)
          ? generateCrossEffectMesh(selectedMeshType, meshParams)
          : shouldUseDoubleSidedGeometry(selectedMeshType, shouldDoubleSide)
            ? createDoubleSidedEffectGeometry(selectedMeshType, meshParams)
            : generateEffectMesh(selectedMeshType, meshParams)
    if (shouldMirrorZ) {
      const mirroredGeometry = createZMirroredGeometry(geometry)
      geometry.dispose()
      mirroredGeometry.translate(-pivotPosition.x, -pivotPosition.y, -pivotPosition.z)
      applyVertexAlphaGradient(mirroredGeometry, selectedMeshType, meshParams)
      applyUVRotation(mirroredGeometry, rotation + getUvRotationOffset(selectedMeshType))
      return mirroredGeometry
    }

    geometry.translate(-pivotPosition.x, -pivotPosition.y, -pivotPosition.z)
    applyVertexAlphaGradient(geometry, selectedMeshType, meshParams)
    applyUVRotation(geometry, rotation + getUvRotationOffset(selectedMeshType))
    return geometry
  }

  type VertexAlphaAxis = 'x' | 'y' | 'z'
  type VertexAlphaEdge = 'min' | 'max'
  type VertexAlphaProfile =
    | { type: 'axis'; axis: VertexAlphaAxis; firstEdge: VertexAlphaEdge; secondEdge: VertexAlphaEdge }
    | { type: 'uvU'; firstEdge: VertexAlphaEdge; secondEdge: VertexAlphaEdge }
    | { type: 'radius'; firstEdge: VertexAlphaEdge; secondEdge: VertexAlphaEdge }

  const applyVertexAlphaGradient = (
    geometry: THREE.BufferGeometry,
    selectedMeshType: EffectMeshType,
    meshParams: EffectMeshParams
  ) => {
    const alphaProfile = getVertexAlphaProfile(selectedMeshType)

    if (!alphaProfile || !(meshParams.vertexAlphaEnabled ?? false)) {
      geometry.deleteAttribute('color')
      return
    }

    const firstAlphaStrength = THREE.MathUtils.clamp(meshParams.topAlpha ?? 1, 0, 2)
    const secondAlphaStrength = THREE.MathUtils.clamp(meshParams.bottomAlpha ?? 1, 0, 2)
    const firstAlphaRange = THREE.MathUtils.clamp(
      meshParams.topAlphaRange ?? meshParams.alphaRange ?? DEFAULT_VERTEX_ALPHA_RANGE,
      0,
      1
    )
    const secondAlphaRange = THREE.MathUtils.clamp(
      meshParams.bottomAlphaRange ?? meshParams.alphaRange ?? DEFAULT_VERTEX_ALPHA_RANGE,
      0,
      1
    )
    const effectiveFirstAlphaStrength = firstAlphaRange <= 0 ? 0 : firstAlphaStrength
    const effectiveSecondAlphaStrength = secondAlphaRange <= 0 ? 0 : secondAlphaStrength
    if (effectiveFirstAlphaStrength <= 0 && effectiveSecondAlphaStrength <= 0) {
      geometry.deleteAttribute('color')
      return
    }

    const position = geometry.getAttribute('position')
    const uv = geometry.getAttribute('uv')
    if (!position) return

    geometry.computeBoundingBox()
    const boundingBox = geometry.boundingBox
    if (!boundingBox) return

    const radiusBounds = alphaProfile.type === 'radius' ? getRadiusBounds(position, boundingBox) : null
    const colors = new Float32Array(position.count * 4)

    for (let i = 0; i < position.count; i++) {
      const ratio = getVertexAlphaRatio(position, uv, i, alphaProfile, boundingBox, radiusBounds)
      const firstFade = smoothstep(0, firstAlphaRange, getEdgeDistance(ratio, alphaProfile.firstEdge))
      const secondFade = smoothstep(0, secondAlphaRange, getEdgeDistance(ratio, alphaProfile.secondEdge))
      const alphaFromFirst = THREE.MathUtils.clamp(
        1 - effectiveFirstAlphaStrength * (1 - firstFade),
        0,
        1
      )
      const alphaFromSecond = THREE.MathUtils.clamp(
        1 - effectiveSecondAlphaStrength * (1 - secondFade),
        0,
        1
      )
      const alpha = Math.min(alphaFromFirst, alphaFromSecond)
      const offset = i * 4

      colors[offset] = 1
      colors[offset + 1] = 1
      colors[offset + 2] = 1
      colors[offset + 3] = alpha
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
  }

  const getVertexAlphaProfile = (selectedMeshType: EffectMeshType): VertexAlphaProfile | null => {
    switch (selectedMeshType) {
      case 'arc':
      case 'arcRibbon':
        return { type: 'uvU', firstEdge: 'min', secondEdge: 'max' }
      case 'slash':
      case 'ribbon':
      case 'lightningRibbon':
      case 'risingSpiralRibbon':
      case 'cylinderSpiralRibbon':
      case 'plane':
        return { type: 'uvU', firstEdge: 'max', secondEdge: 'min' }
      case 'beamDome':
        return { type: 'axis', axis: 'z', firstEdge: 'min', secondEdge: 'max' }
      case 'flatRing':
      case 'honeycombRadialPlane':
        return { type: 'radius', firstEdge: 'max', secondEdge: 'min' }
      case 'openCylinder':
      case 'sphere':
      case 'hemisphere':
      case 'zHemisphere':
      case 'honeycombPlane':
      case 'honeycombSphere':
        return { type: 'axis', axis: 'y', firstEdge: 'max', secondEdge: 'min' }
      default:
        return null
    }
  }

  const getVertexAlphaRatio = (
    position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
    uv: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | undefined,
    index: number,
    profile: VertexAlphaProfile,
    boundingBox: THREE.Box3,
    radiusBounds: { min: number; max: number } | null
  ): number => {
    if (profile.type === 'uvU' && uv) {
      return THREE.MathUtils.clamp(uv.getX(index), 0, 1)
    }

    if (profile.type === 'uvU') {
      return 0.5
    }

    if (profile.type === 'radius') {
      const centerX = (boundingBox.min.x + boundingBox.max.x) * 0.5
      const centerY = (boundingBox.min.y + boundingBox.max.y) * 0.5
      const radius = Math.hypot(position.getX(index) - centerX, position.getY(index) - centerY)
      const bounds = radiusBounds ?? { min: 0, max: 1 }
      return THREE.MathUtils.clamp((radius - bounds.min) / Math.max(bounds.max - bounds.min, 0.000001), 0, 1)
    }

    const min = boundingBox.min[profile.axis]
    const max = boundingBox.max[profile.axis]
    const value = profile.axis === 'x'
      ? position.getX(index)
      : profile.axis === 'y'
        ? position.getY(index)
        : position.getZ(index)
    return THREE.MathUtils.clamp((value - min) / Math.max(max - min, 0.000001), 0, 1)
  }

  const getRadiusBounds = (
    position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
    boundingBox: THREE.Box3
  ): { min: number; max: number } => {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    const centerX = (boundingBox.min.x + boundingBox.max.x) * 0.5
    const centerY = (boundingBox.min.y + boundingBox.max.y) * 0.5

    for (let i = 0; i < position.count; i++) {
      const radius = Math.hypot(position.getX(i) - centerX, position.getY(i) - centerY)
      min = Math.min(min, radius)
      max = Math.max(max, radius)
    }

    return { min, max }
  }

  const getEdgeDistance = (ratio: number, edge: VertexAlphaEdge): number => (
    edge === 'min' ? ratio : 1 - ratio
  )

  const hasVertexAlpha = (geometry: THREE.BufferGeometry): boolean => {
    const color = geometry.getAttribute('color')
    return !!color && color.itemSize >= 4
  }

  const smoothstep = (edge0: number, edge1: number, value: number): number => {
    const amount = THREE.MathUtils.clamp((value - edge0) / Math.max(edge1 - edge0, 0.000001), 0, 1)
    return amount * amount * (3 - amount * 2)
  }

  const shouldUseDoubleSidedGeometry = (
    selectedMeshType: EffectMeshType,
    shouldDoubleSide: boolean
  ): boolean =>
    (
      selectedMeshType === 'lightningRibbon' ||
      selectedMeshType === 'ribbon' ||
      selectedMeshType === 'arcRibbon' ||
      selectedMeshType === 'slash' ||
      selectedMeshType === 'risingSpiralRibbon' ||
      selectedMeshType === 'cylinderSpiralRibbon' ||
      selectedMeshType === 'openCylinder'
    ) &&
    shouldDoubleSide

  const getUvRotationOffset = (selectedMeshType: EffectMeshType): number =>
    isHoneycombMeshType(selectedMeshType)
      ? HONEYCOMB_UV_ROTATION_OFFSET
      : SLASH_UV_ROTATION_OFFSET

  const isHoneycombMeshType = (selectedMeshType: EffectMeshType): boolean =>
    selectedMeshType === 'honeycombPlane' ||
    selectedMeshType === 'honeycombRadialPlane' ||
    selectedMeshType === 'honeycombSphere'

  const shouldUseCrossGeometry = (
    selectedMeshType: EffectMeshType,
    shouldCrossMesh: boolean
  ): boolean =>
    (
      selectedMeshType === 'slash' ||
      selectedMeshType === 'arc' ||
      selectedMeshType === 'arcRibbon' ||
      selectedMeshType === 'ribbon' ||
      selectedMeshType === 'lightningRibbon' ||
      selectedMeshType === 'risingSpiralRibbon' ||
      selectedMeshType === 'cylinderSpiralRibbon' ||
      selectedMeshType === 'plane' ||
      selectedMeshType === 'flatRing'
    ) &&
    shouldCrossMesh

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

    if (selectedMeshType === 'ribbon') {
      return generateDoubleSidedRibbonMesh(meshParams)
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
    copyZMirroredHoneycombPartsUserData(sourceGeometry, mirroredGeometry, vertexCount)
    mirroredGeometry.computeVertexNormals()
    return mirroredGeometry
  }

  const copyZMirroredHoneycombPartsUserData = (
    sourceGeometry: THREE.BufferGeometry,
    mirroredGeometry: THREE.BufferGeometry,
    sourceVertexCount: number
  ): void => {
    const sourceData = getHoneycombPartsUserData(sourceGeometry.userData)
    if (!sourceData) return

    const mirroredData: HoneycombPartsUserData = {
      version: 1,
      parts: sourceData.parts.map((part) => ({
        ...part,
        vertexRanges: [
          ...part.vertexRanges,
          ...part.vertexRanges.map((range) => ({
            start: sourceVertexCount + range.start,
            count: range.count,
          })),
        ],
        triangleStart: part.triangleStart * 2,
        triangleCount: part.triangleCount * 2,
      })),
    }

    mirroredGeometry.userData[HONEYCOMB_PARTS_USER_DATA_KEY] = mirroredData
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
    markerGroup.renderOrder = 1000
    const axes = new THREE.AxesHelper(0.45)
    axes.renderOrder = 1000
    axes.traverse((object) => {
      if (object instanceof THREE.LineSegments) {
        const material = object.material
        if (Array.isArray(material)) {
          material.forEach((item) => {
            item.depthTest = false
            item.depthWrite = false
            item.transparent = true
          })
        } else {
          material.depthTest = false
          material.depthWrite = false
          material.transparent = true
        }
      }
    })

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.07, 0.085, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      })
    )
    ring.name = PIVOT_RING_OBJECT_NAME
    ring.renderOrder = 1001

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 16, 8),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      })
    )
    center.renderOrder = 1002

    markerGroup.add(axes, ring, center)
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
    <div
      ref={containerRef}
      className={`viewport ${showMeshTypeGrid ? 'mesh-thumbnail-grid-active' : ''}`}
      onPointerDown={handleViewportPointerDown}
    >
      {showMeshTypeGrid && (
        <div
          className="mesh-thumbnail-grid-overlay"
          style={{ gridTemplateColumns: `repeat(${thumbnailColumns}, 1fr)` }}
        >
          {SHOW_MANAGEMENT_CONTROLS && (
            <>
              <button
                type="button"
                className="mesh-thumbnail-export-btn"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleThumbnailRotationExport}
              >
                {t.thumbnailRotationExport}
              </button>
              {thumbnailRotationExportMessage && (
                <div className="mesh-thumbnail-export-message">
                  {thumbnailRotationExportMessage}
                </div>
              )}
            </>
          )}
          {MESH_TYPE_OPTION_VALUES.map((value) => (
            <div key={value} className="mesh-thumbnail-tile">
              <button
                type="button"
                className="mesh-thumbnail-label"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onMeshTypeSelect?.(value)}
              >
                {t.meshTypes[value]}
              </button>
            </div>
          ))}
        </div>
      )}
      {showPolygonCount && !showMeshTypeGrid && (
        <div className={`polygon-count-overlay ${showUV ? 'uv-visible' : ''}`}>
          {polygonCount.toLocaleString()} {t.triangles}
        </div>
      )}
    </div>
  )
}

export default Viewport
