import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { FBXExporter } from './FBXExporter'

/**
 * メッシュをFBX形式でエクスポート
 */
export async function exportAsFBX(mesh: THREE.Mesh, fileName: string): Promise<void> {
  try {
    const exporter = new FBXExporter()
    const fbxString = exporter.parse(mesh)
    const blob = new Blob([fbxString], { type: 'application/octet-stream' })
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
export async function exportAsOBJ(mesh: THREE.Mesh, fileName: string): Promise<void> {
  try {
    const exporter = new OBJExporter()
    const clonedMesh = cloneMeshForExport(mesh)
    const objString = exporter.parse(clonedMesh)
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
