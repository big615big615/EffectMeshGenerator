import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { FBXExporter } from './FBXExporter'
import { getHoneycombPartsUserData } from '../generators/honeycombPartMetadata'

const POSITION_MERGE_PRECISION = 100000

interface ExportOBJOptions {
  mergeSharedPositions?: boolean
  objectName?: string
}

interface HoneycombPartJSONPoint {
  x: number
  y: number
  z: number
}

interface HoneycombPartJSONSurface {
  vertexStart: number
  vertexCount: number
  center: [number, number, number]
  centerPosition: HoneycombPartJSONPoint
  corners: Array<[number, number, number]>
  cornerPositions: HoneycombPartJSONPoint[]
}

interface HoneycombPartJSONPart {
  id: number
  cornerCount: number
  triangleStart: number
  triangleCount: number
  polygonVertexStart: number
  polygonVertexCount: number
  vertexRanges: Array<{ start: number; count: number }>
  center: [number, number, number]
  centerPosition: HoneycombPartJSONPoint
  corners: Array<[number, number, number]>
  cornerPositions: HoneycombPartJSONPoint[]
  surfaces: HoneycombPartJSONSurface[]
  triangles: Array<[number, number, number]>
}

interface HoneycombPartJSON {
  format: 'effect-mesh-generator-honeycomb-parts'
  version: 1
  meshName: string
  coordinateSpace: 'exported-mesh-local'
  vertexCount: number
  triangleCount: number
  partCount: number
  notes: string[]
  parts: HoneycombPartJSONPart[]
}

/**
 * メッシュをFBX形式でエクスポート
 */
export async function exportAsFBX(mesh: THREE.Mesh, fileName: string): Promise<void> {
  try {
    const exporter = new FBXExporter()
    const clonedMesh = cloneMeshForDownload(mesh, fileName)
    const fbxContent = exporter.parse(clonedMesh)
    const blob = new Blob([fbxContent], { type: 'application/octet-stream' })
    downloadFile(blob, `${fileName}.fbx`)
  } catch (error) {
    throw error
  }
}

export async function exportAsFBXASCII(mesh: THREE.Mesh, fileName: string): Promise<void> {
  try {
    const exporter = new FBXExporter()
    const clonedMesh = cloneMeshForDownload(mesh, fileName)
    const fbxContent = exporter.parse(clonedMesh, { format: 'ascii' })
    const blob = new Blob([fbxContent], { type: 'text/plain' })
    downloadFile(blob, `${fileName}.ascii.fbx`)
  } catch (error) {
    throw error
  }
}

export function canExportHoneycombPartJSON(mesh: THREE.Mesh | null): boolean {
  if (!mesh) return false
  return getHoneycombPartsUserData(mesh.geometry.userData) !== null
}

export async function exportHoneycombPartJSON(mesh: THREE.Mesh, fileName: string): Promise<void> {
  const json = createHoneycombPartJSON(mesh, createOBJName(fileName))
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
  downloadFile(blob, `${fileName}.honeycomb-parts.json`)
}

/**
 * メッシュをGLB形式でエクスポート (バイナリ、推奨形式)
 */
export async function exportAsGLB(mesh: THREE.Mesh, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter()
    const scene = new THREE.Scene()
    const clonedMesh = cloneMeshForExport(mesh)
    scene.add(clonedMesh)

    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: 'application/octet-stream' })
          downloadFile(blob, `${fileName}.glb`)
          resolve()
        } else {
          reject(new Error('Unexpected export result type'))
        }
      },
      (error) => {
        reject(error)
      },
      { binary: true }
    )
  })
}

/**
 * メッシュをGLTF形式でエクスポート (JSON形式)
 */
export async function exportAsGLTF(mesh: THREE.Mesh, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter()
    const scene = new THREE.Scene()
    const clonedMesh = cloneMeshForExport(mesh)
    scene.add(clonedMesh)

    exporter.parse(
      scene,
      (result) => {
        const json = JSON.stringify(result, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        downloadFile(blob, `${fileName}.gltf`)
        resolve()
      },
      (error) => {
        reject(error)
      },
      { binary: false }
    )
  })
}

/**
 * メッシュをOBJ形式でエクスポート (汎用フォーマット)
 */
export async function exportAsOBJ(
  mesh: THREE.Mesh,
  fileName: string,
  options: ExportOBJOptions = {}
): Promise<void> {
  try {
    const clonedMesh = cloneMeshForExport(mesh)
    clonedMesh.position.set(0, 0, 0)
    clonedMesh.name = createOBJName(fileName)
    clonedMesh.updateMatrixWorld(true)
    const objString = exportOBJWithDisplayedUVs(clonedMesh, {
      ...options,
      objectName: clonedMesh.name,
    })
    const blob = new Blob([objString], { type: 'text/plain' })
    downloadFile(blob, `${fileName}.obj`)
  } catch (error) {
    throw error
  }
}

function cloneMeshForExport(mesh: THREE.Mesh): THREE.Mesh {
  const material = Array.isArray(mesh.material)
    ? mesh.material.map((item) => item.clone())
    : mesh.material.clone()
  const clonedMesh = new THREE.Mesh(mesh.geometry.clone(), material)

  clonedMesh.name = mesh.name
  clonedMesh.position.copy(mesh.position)
  clonedMesh.quaternion.copy(mesh.quaternion)
  clonedMesh.scale.copy(mesh.scale)
  clonedMesh.updateMatrix()
  clonedMesh.updateMatrixWorld(true)

  return clonedMesh
}

function cloneMeshForDownload(mesh: THREE.Mesh, fileName: string): THREE.Mesh {
  const clonedMesh = cloneMeshForExport(mesh)
  clonedMesh.position.set(0, 0, 0)
  clonedMesh.name = createOBJName(fileName)
  clonedMesh.updateMatrixWorld(true)
  return clonedMesh
}

function exportOBJWithDisplayedUVs(mesh: THREE.Mesh, options: ExportOBJOptions): string {
  const geometry = mesh.geometry
  const positions = geometry.getAttribute('position')
  const normals = geometry.getAttribute('normal')
  const uvs = geometry.getAttribute('uv')
  const indices = geometry.index
  const vertex = new THREE.Vector3()
  const normal = new THREE.Vector3()
  const mergedPositions: THREE.Vector3[] = []
  const positionObjIndices: number[] = []
  const positionIndexByKey = new Map<string, number>()

  mesh.updateMatrixWorld(true)
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)

  const objectName = options.objectName || createOBJName(mesh.name || 'SlashMesh')
  let output = `o ${objectName}\ng ${objectName}\n`

  if (positions) {
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i)
      vertex.applyMatrix4(mesh.matrixWorld)

      if (options.mergeSharedPositions) {
        const positionKey = createPositionKey(vertex)
        let objIndex = positionIndexByKey.get(positionKey)

        if (objIndex === undefined) {
          objIndex = mergedPositions.length + 1
          positionIndexByKey.set(positionKey, objIndex)
          mergedPositions.push(vertex.clone())
        }

        positionObjIndices[i] = objIndex
      } else {
        positionObjIndices[i] = i + 1
        mergedPositions.push(vertex.clone())
      }
    }

    for (const mergedPosition of mergedPositions) {
      output += `v ${mergedPosition.x} ${mergedPosition.y} ${mergedPosition.z}\n`
    }
  }

  if (uvs) {
    for (let i = 0; i < uvs.count; i++) {
      output += `vt ${uvs.getX(i)} ${1 - uvs.getY(i)}\n`
    }
  }

  if (normals) {
    for (let i = 0; i < normals.count; i++) {
      normal.fromBufferAttribute(normals, i)
      normal.applyMatrix3(normalMatrix).normalize()
      output += `vn ${normal.x} ${normal.y} ${normal.z}\n`
    }
  }

  const faceIndexCount = indices?.count ?? positions?.count ?? 0
  for (let i = 0; i < faceIndexCount; i += 3) {
    const face: string[] = []
    for (let j = 0; j < 3; j++) {
      const index = (indices ? indices.getX(i + j) : i + j) as number
      const positionObjIndex = positionObjIndices[index] ?? index + 1
      const uvObjIndex = index + 1
      const normalObjIndex = index + 1
      if (uvs && normals) {
        face.push(`${positionObjIndex}/${uvObjIndex}/${normalObjIndex}`)
      } else if (uvs) {
        face.push(`${positionObjIndex}/${uvObjIndex}`)
      } else if (normals) {
        face.push(`${positionObjIndex}//${normalObjIndex}`)
      } else {
        face.push(`${positionObjIndex}`)
      }
    }
    output += `f ${face.join(' ')}\n`
  }

  return output
}

function createHoneycombPartJSON(mesh: THREE.Mesh, meshName: string): HoneycombPartJSON {
  const geometry = mesh.geometry
  const position = geometry.getAttribute('position')
  const index = geometry.index
  const partData = getHoneycombPartsUserData(geometry.userData)

  if (!position) {
    throw new Error('Mesh is missing position data')
  }

  if (!partData) {
    throw new Error('Honeycomb part data is not available for this mesh')
  }

  const triangleCount = index
    ? Math.floor(index.count / 3)
    : Math.floor(position.count / 3)

  const parts = partData.parts.map((part) => {
    const surfaces = part.vertexRanges.map((range) => {
      const center = getPositionTuple(position, range.start)
      const corners: Array<[number, number, number]> = []

      for (let i = 1; i < range.count; i++) {
        corners.push(getPositionTuple(position, range.start + i))
      }

      return {
        vertexStart: range.start,
        vertexCount: range.count,
        center,
        centerPosition: toHoneycombPartJSONPoint(center),
        corners,
        cornerPositions: corners.map(toHoneycombPartJSONPoint),
      }
    })
    const center: [number, number, number] = surfaces[0]?.center ?? [0, 0, 0]
    const corners: Array<[number, number, number]> = surfaces[0]?.corners ?? []

    return {
      id: part.id,
      cornerCount: part.cornerCount,
      triangleStart: part.triangleStart,
      triangleCount: part.triangleCount,
      polygonVertexStart: part.triangleStart * 3,
      polygonVertexCount: part.triangleCount * 3,
      vertexRanges: part.vertexRanges,
      center,
      centerPosition: toHoneycombPartJSONPoint(center),
      corners,
      cornerPositions: corners.map(toHoneycombPartJSONPoint),
      surfaces,
      triangles: getTriangleTuples(geometry, part.triangleStart, part.triangleCount),
    }
  })

  return {
    format: 'effect-mesh-generator-honeycomb-parts',
    version: 1,
    meshName,
    coordinateSpace: 'exported-mesh-local',
    vertexCount: position.count,
    triangleCount,
    partCount: parts.length,
    notes: [
      'triangleStart and triangleCount refer to the exported mesh triangle order before Unity import optimization.',
      'Use centerPosition/cornerPositions for Unity JsonUtility-based position matching if Unity changes triangle order during import.',
      'Honeycomb sphere parts may include pentagons; check cornerCount per part.',
    ],
    parts,
  }
}

function getPositionTuple(
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  index: number
): [number, number, number] {
  return [
    position.getX(index),
    position.getY(index),
    position.getZ(index),
  ]
}

function toHoneycombPartJSONPoint([x, y, z]: [number, number, number]): HoneycombPartJSONPoint {
  return { x, y, z }
}

function getTriangleTuples(
  geometry: THREE.BufferGeometry,
  triangleStart: number,
  triangleCount: number
): Array<[number, number, number]> {
  const index = geometry.index
  const triangles: Array<[number, number, number]> = []

  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const itemIndex = (triangleStart + triangle) * 3
    triangles.push([
      index ? index.getX(itemIndex) : itemIndex,
      index ? index.getX(itemIndex + 1) : itemIndex + 1,
      index ? index.getX(itemIndex + 2) : itemIndex + 2,
    ])
  }

  return triangles
}

function createPositionKey(position: THREE.Vector3): string {
  const x = Math.round(position.x * POSITION_MERGE_PRECISION)
  const y = Math.round(position.y * POSITION_MERGE_PRECISION)
  const z = Math.round(position.z * POSITION_MERGE_PRECISION)
  return `${x},${y},${z}`
}

function createOBJName(name: string): string {
  return name.trim().replace(/[^\w.-]+/g, '_') || 'EffectMesh'
}

/**
 * ファイルをダウンロード
 */
function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
