import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { FBXExporter } from './FBXExporter'

const POSITION_MERGE_PRECISION = 100000

interface ExportOBJOptions {
  mergeSharedPositions?: boolean
  objectName?: string
}

/**
 * メッシュをFBX形式でエクスポート
 */
export async function exportAsFBX(mesh: THREE.Mesh, fileName: string): Promise<void> {
  try {
    const exporter = new FBXExporter()
    const fbxBuffer = exporter.parse(mesh)
    const blob = new Blob([fbxBuffer], { type: 'application/octet-stream' })
    downloadFile(blob, `${fileName}.fbx`)
  } catch (error) {
    throw error
  }
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
