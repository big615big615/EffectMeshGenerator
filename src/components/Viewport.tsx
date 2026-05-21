import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { generateSlashMesh } from '../generators/slashMeshGenerator'
import './Viewport.css'

const UV_VIEW_PADDING = 1.08
const SLASH_UV_ROTATION_OFFSET = 270

interface ViewportProps {
  params: {
    divisions: number
    widthDivisions: number
    thickness: number
    length: number
    curve: number
    topCurve: number
    taper: number
  }
  wireframe: boolean
  showUV: boolean
  uvRotation: number
  showPivot: boolean
  pivot: {
    x: number
    y: number
    z: number
  }
  onMeshReady?: (mesh: THREE.Mesh) => void
}

const Viewport: React.FC<ViewportProps> = ({
  params,
  wireframe,
  showUV,
  uvRotation,
  showPivot,
  pivot,
  onMeshReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const meshWireframeRef = useRef<THREE.Group | null>(null)
  const pivotMarkerRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const uvSceneRef = useRef<THREE.Scene | null>(null)
  const uvCameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const uvWireframeRef = useRef<THREE.Group | null>(null)
  const checkerTextureRef = useRef<THREE.Texture | null>(null)
  const showUVRef = useRef(showUV)

  useEffect(() => {
    showUVRef.current = showUV
  }, [showUV])

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
    camera.position.set(0, 0, 5)
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
    const geometry = createSlashGeometry(params, uvRotation, pivot)
    const checkerTexture = createCheckerTexture(8, 8)
    checkerTextureRef.current = checkerTexture
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x00aa44,
      wireframe: false,
      map: showUV ? checkerTexture : null,
      side: THREE.DoubleSide,
      polygonOffset: wireframe,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(pivot.x, pivot.y, pivot.z)
    const meshWireframe = createMeshWireframe(geometry)
    meshWireframe.visible = wireframe
    mesh.add(meshWireframe)
    scene.add(mesh)
    meshRef.current = mesh
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
    const animate = () => {
      animationId = requestAnimationFrame(animate)
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
      material.dispose()
      renderer.dispose()
    }
  }, [])

  // Update mesh when params change
  useEffect(() => {
    if (!sceneRef.current || !meshRef.current) return

    const oldGeometry = meshRef.current.geometry
    const newGeometry = createSlashGeometry(params, uvRotation, pivot)
    meshRef.current.geometry = newGeometry
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
      disposeWireframeGroup(uvWireframeRef.current)
      const newUVWireframe = createUVWireframe(newGeometry)
      uvWireframeRef.current = newUVWireframe
      uvSceneRef.current?.clear()
      if (uvSceneRef.current) {
        const uvBackground = createUVBackground(checkerTextureRef.current ?? createCheckerTexture(8, 8))
        uvSceneRef.current.add(uvBackground)
        uvSceneRef.current.add(newUVWireframe)
      }
    }
  }, [params, uvRotation, pivot])

  useEffect(() => {
    if (!pivotMarkerRef.current) return

    pivotMarkerRef.current.visible = showPivot
    pivotMarkerRef.current.position.set(pivot.x, pivot.y, pivot.z)
  }, [showPivot, pivot])

  // Sync wireframe state and checker texture display with the mesh material
  useEffect(() => {
    if (!meshRef.current) return

    const texture = checkerTextureRef.current ?? createCheckerTexture(8, 8)
    checkerTextureRef.current = texture

    const material = meshRef.current.material
    const updateMaterial = (mat: THREE.Material) => {
      if (mat instanceof THREE.MeshPhongMaterial) {
        mat.wireframe = false
        mat.map = showUV ? texture : null
        mat.polygonOffset = wireframe
        mat.needsUpdate = true
      }
    }

    if (Array.isArray(material)) {
      material.forEach(updateMaterial)
    } else {
      updateMaterial(material)
    }

    if (meshWireframeRef.current) {
      meshWireframeRef.current.visible = wireframe
    }
  }, [wireframe, showUV])

  const createCheckerTexture = (columns: number, rows: number): THREE.Texture => {
    const size = 512
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
        const isEven = (x + y) % 2 === 0
        ctx.fillStyle = isEven ? '#ddd' : '#666'
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)

        const index = y * columns + x + 1
        ctx.fillStyle = isEven ? '#222' : '#eee'
        ctx.font = `${Math.floor(cellHeight * 0.36)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${index}`, x * cellWidth + cellWidth / 2, y * cellHeight + cellHeight / 2)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.flipY = false
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.needsUpdate = true
    return texture
  }

  const createSlashGeometry = (
    meshParams: ViewportProps['params'],
    rotation: number,
    pivotPosition: ViewportProps['pivot']
  ): THREE.BufferGeometry => {
    const geometry = generateSlashMesh(
      meshParams.divisions,
      meshParams.widthDivisions,
      meshParams.thickness,
      meshParams.length,
      meshParams.curve,
      meshParams.topCurve,
      meshParams.taper
    )
    applyUVRotation(geometry, rotation + SLASH_UV_ROTATION_OFFSET)
    geometry.translate(-pivotPosition.x, -pivotPosition.y, -pivotPosition.z)
    return geometry
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

  return <div ref={containerRef} className="viewport" />
}

export default Viewport
