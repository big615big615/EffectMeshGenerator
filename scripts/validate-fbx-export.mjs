import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

const workspaceRoot = process.cwd()
const outputDir = path.join(workspaceRoot, 'tmp', 'fbx-validation')
const externalImporterExe = process.env.FBX_IMPORT_VALIDATOR_EXE || null
const binaryFooterMagic = Uint8Array.from([
  0xfa, 0xbc, 0xab, 0x09, 0xd0, 0xc8, 0xd4, 0x66,
  0xb1, 0x76, 0xfb, 0x83, 0x1c, 0xf7, 0x26, 0x7e,
])
const binaryFooterEndMagic = Uint8Array.from([
  0xf8, 0x5a, 0x8c, 0x6a, 0xde, 0xf5, 0xd9, 0x7e,
  0xec, 0xe9, 0x0c, 0xe3, 0x75, 0x8f, 0x29, 0x0b,
])
const unitySafeCreationTime = '1970-01-01 10:00:00:000'
const unityMeterUnitScaleFactor = 100
const args = process.argv.slice(2)
const fileArgIndex = args.indexOf('--file')
const externalFile = fileArgIndex >= 0 ? args[fileArgIndex + 1] : null
const shouldSkipExternalImport = args.includes('--no-external-import')

function main() {
  if (externalFile) {
    validateExistingFile(path.resolve(externalFile))
    return
  }

  fs.mkdirSync(outputDir, { recursive: true })
  const FBXExporter = loadSymbolFromTs('src/exporters/FBXExporter.ts', 'FBXExporter')
  const generateSlashMesh = loadSymbolFromTs('src/generators/slashMeshGenerator.ts', 'generateSlashMesh')
  const cases = [
    {
      name: 'plane',
      geometry: createPlaneGeometry(),
    },
    {
      name: 'slash',
      geometry: generateSlashMesh(16, 4, 1, 4, 0.5, 0.5, 0.2, 0.2, 0.4, 0, 1, false),
    },
    {
      name: 'slash-alpha',
      geometry: createAlphaSlashGeometry(generateSlashMesh(16, 4, 1, 4, 0.5, 0.5, 0.2, 0.2, 0.4, 0, 1, false)),
      expectColorLayer: true,
    },
  ]

  cases.forEach(({ name, geometry, expectColorLayer = false }) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial())
    mesh.name = `Validator${capitalize(name)}`
    const exporter = new FBXExporter()
    const binary = exporter.parse(mesh)
    const ascii = exporter.parse(mesh, { format: 'ascii' })
    const binaryPath = path.join(outputDir, `${name}.fbx`)
    const asciiPath = path.join(outputDir, `${name}.ascii.fbx`)
    fs.writeFileSync(binaryPath, Buffer.from(binary))
    fs.writeFileSync(asciiPath, ascii)
    validateBinaryBuffer(binary, {
      expectedGeometryClassName: `${mesh.name}Geometry`,
      expectedModelClassName: mesh.name,
      expectColorLayer,
    })
    validateWithThreeLoader(binary, `${name} binary`)
    validateWithThreeLoader(new TextEncoder().encode(ascii).buffer, `${name} ascii`)
    validateWithExternalImporter(binaryPath, geometry.getAttribute('position').count, Math.floor(geometry.index.count / 3))
    console.log(`[ok] ${name}: ${path.relative(workspaceRoot, binaryPath)}`)
  })
}

function validateExistingFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`)
  }

  const buffer = fs.readFileSync(filePath)
  validateWithThreeLoader(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), filePath)
  validateWithExternalImporter(filePath)
  console.log(`[ok] ${filePath}`)
}

function loadSymbolFromTs(sourcePath, returnName) {
  let source = fs.readFileSync(path.join(workspaceRoot, sourcePath), 'utf8')
  source = source.replace(/import \* as THREE from 'three'\r?\n/g, '')
  source = source.replace(/^export /gm, '')
  const js = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      useDefineForClassFields: true,
    },
  }).outputText
  return vm.runInNewContext(`${js}\n${returnName};`, {
    THREE,
    console,
    TextEncoder,
    ArrayBuffer,
    Uint8Array,
    DataView,
    BigInt,
  })
}

function createPlaneGeometry() {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    -0.5, 0.5, 0,
    0.5, 0.5, 0,
  ]), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ]), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array([0, 2, 1, 1, 2, 3]), 1))
  geometry.computeVertexNormals()
  return geometry
}

function createAlphaSlashGeometry(geometry) {
  const position = geometry.getAttribute('position')
  const colors = new Float32Array(position.count * 4)

  geometry.computeBoundingBox()
  const minY = geometry.boundingBox.min.y
  const maxY = geometry.boundingBox.max.y
  const rangeY = Math.max(maxY - minY, 0.000001)

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i)
    const verticalRatio = Math.min(Math.max((y - minY) / rangeY, 0), 1)
    const edgeDistance = Math.min(verticalRatio, 1 - verticalRatio)
    const alpha = Math.min(Math.max(edgeDistance / 0.5, 0), 1)
    const offset = i * 4

    colors[offset] = 1
    colors[offset + 1] = 1
    colors[offset + 2] = 1
    colors[offset + 3] = alpha
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
  return geometry
}

function validateBinaryBuffer(buffer, expected) {
  const bytes = new Uint8Array(buffer)
  const header = new TextDecoder('latin1').decode(bytes.slice(0, 21))
  if (header !== 'Kaydara FBX Binary  \u0000') {
    throw new Error(`Invalid binary FBX header: ${JSON.stringify(header)}`)
  }
  if (!bytesEndWith(bytes, binaryFooterEndMagic)) {
    throw new Error('Binary FBX footer end magic is invalid')
  }
  if (bytesEndWith(bytes, binaryFooterMagic)) {
    throw new Error('Binary FBX footer repeats the start magic at EOF')
  }

  const binaryText = new TextDecoder('latin1').decode(bytes)
  const geometryClassName = `${expected.expectedGeometryClassName}\u0000\u0001Geometry`
  const modelClassName = `${expected.expectedModelClassName}\u0000\u0001Model`
  if (!binaryText.includes(geometryClassName)) {
    throw new Error(`Missing binary Geometry class name marker: ${geometryClassName}`)
  }
  if (!binaryText.includes(modelClassName)) {
    throw new Error(`Missing binary Model class name marker: ${modelClassName}`)
  }
  if (binaryText.includes(`Geometry::${expected.expectedGeometryClassName}`)) {
    throw new Error('Binary FBX still contains ASCII-style Geometry:: name')
  }
  if (!binaryText.includes(unitySafeCreationTime)) {
    throw new Error('Binary FBX top-level CreationTime is not using the Unity-safe fixed value')
  }
  const unitScaleFactor = findFBXPropertyDoubleValue(bytes, 'UnitScaleFactor')
  const originalUnitScaleFactor = findFBXPropertyDoubleValue(bytes, 'OriginalUnitScaleFactor')
  if (unitScaleFactor !== unityMeterUnitScaleFactor) {
    throw new Error(`Binary FBX UnitScaleFactor should be ${unityMeterUnitScaleFactor}, got ${unitScaleFactor}`)
  }
  if (originalUnitScaleFactor !== unityMeterUnitScaleFactor) {
    throw new Error(`Binary FBX OriginalUnitScaleFactor should be ${unityMeterUnitScaleFactor}, got ${originalUnitScaleFactor}`)
  }

  const polygonVertexIndexCount = findIntArrayCount(bytes, 'PolygonVertexIndex')
  const edgeCount = findIntArrayCount(bytes, 'Edges')
  const uvIndexCount = findIntArrayCount(bytes, 'UVIndex')
  const colorIndexCount = findIntArrayCount(bytes, 'ColorIndex')
  const hasColorLayer = binaryText.includes('LayerElementColor')
  if (expected.expectColorLayer && !hasColorLayer) {
    throw new Error('Binary FBX is missing expected LayerElementColor data')
  }
  if (polygonVertexIndexCount <= 0) {
    throw new Error('Binary FBX has no PolygonVertexIndex data')
  }
  if (edgeCount <= 0) {
    throw new Error('Binary FBX has no Edges data')
  }
  if (edgeCount >= polygonVertexIndexCount) {
    throw new Error(`Binary FBX Edges count looks invalid: edges=${edgeCount}, loops=${polygonVertexIndexCount}`)
  }
  if (uvIndexCount !== polygonVertexIndexCount) {
    throw new Error(`Binary FBX UVIndex count mismatch: uvIndex=${uvIndexCount}, loops=${polygonVertexIndexCount}`)
  }
  if (hasColorLayer && colorIndexCount !== polygonVertexIndexCount) {
    throw new Error(`Binary FBX ColorIndex count mismatch: colorIndex=${colorIndexCount}, loops=${polygonVertexIndexCount}`)
  }
}

function bytesEndWith(bytes, suffix) {
  if (bytes.length < suffix.length) {
    return false
  }

  const offset = bytes.length - suffix.length
  for (let i = 0; i < suffix.length; i++) {
    if (bytes[offset + i] !== suffix[i]) {
      return false
    }
  }

  return true
}

function findIntArrayCount(bytes, nodeName) {
  const nameBytes = new TextEncoder().encode(nodeName)
  const pattern = new Uint8Array(2 + nameBytes.length)
  pattern[0] = nameBytes.length
  pattern.set(nameBytes, 1)
  pattern[pattern.length - 1] = 'i'.charCodeAt(0)

  for (let i = 0; i <= bytes.length - pattern.length - 4; i++) {
    let matches = true
    for (let j = 0; j < pattern.length; j++) {
      if (bytes[i + j] !== pattern[j]) {
        matches = false
        break
      }
    }

    if (matches) {
      return new DataView(bytes.buffer, bytes.byteOffset + i + pattern.length, 4).getUint32(0, true)
    }
  }

  return 0
}

function findFBXPropertyDoubleValue(bytes, propertyName) {
  const pattern = concatBytes(
    stringPropertyBytes(propertyName),
    stringPropertyBytes('double'),
    stringPropertyBytes('Number'),
    stringPropertyBytes(''),
    Uint8Array.of('D'.charCodeAt(0))
  )

  for (let i = 0; i <= bytes.length - pattern.length - 8; i++) {
    let matches = true
    for (let j = 0; j < pattern.length; j++) {
      if (bytes[i + j] !== pattern[j]) {
        matches = false
        break
      }
    }

    if (matches) {
      return new DataView(bytes.buffer, bytes.byteOffset + i + pattern.length, 8).getFloat64(0, true)
    }
  }

  return null
}

function stringPropertyBytes(value) {
  const encoded = new TextEncoder().encode(value)
  const bytes = new Uint8Array(1 + 4 + encoded.length)
  bytes[0] = 'S'.charCodeAt(0)
  new DataView(bytes.buffer).setUint32(1, encoded.length, true)
  bytes.set(encoded, 5)
  return bytes
}

function concatBytes(...chunks) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0)
  const bytes = new Uint8Array(length)
  let offset = 0

  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }

  return bytes
}

function validateWithThreeLoader(buffer, label) {
  const group = new FBXLoader().parse(buffer, '')
  const meshes = []
  group.traverse((object) => {
    if (object.type === 'Mesh') {
      meshes.push(object)
    }
  })

  if (meshes.length === 0) {
    throw new Error(`${label}: three.js FBXLoader found no Mesh objects`)
  }

  const mesh = meshes[0]
  const position = mesh.geometry.getAttribute('position')
  if (!position || position.count === 0) {
    throw new Error(`${label}: Mesh has no positions`)
  }
}

function validateWithExternalImporter(filePath, expectedVertices = null, expectedPolygons = null) {
  if (shouldSkipExternalImport || !externalImporterExe || !fs.existsSync(externalImporterExe)) {
    return
  }

  const expression = [
    'import bpy, json',
    "bpy.ops.object.select_all(action='SELECT')",
    'bpy.ops.object.delete()',
    `bpy.ops.import_scene.fbx(filepath=${JSON.stringify(filePath)})`,
    "meshes=[m for m in bpy.data.meshes if not m.name.startswith('Cube')]",
    "print('FBX_IMPORT_SUMMARY=' + json.dumps({'objects': len(bpy.data.objects), 'meshes': len(meshes), 'mesh_names': [m.name for m in meshes], 'vertices': [len(m.vertices) for m in meshes], 'polygons': [len(m.polygons) for m in meshes]}))",
  ].join('; ')

  const output = execFileSync(externalImporterExe, [
    '--background',
    '--factory-startup',
    '--python-expr',
    expression,
  ], { encoding: 'utf8' })
  const summaryLine = output.split(/\r?\n/).find((line) => line.startsWith('FBX_IMPORT_SUMMARY='))
  if (!summaryLine) {
    throw new Error(`External FBX importer did not print FBX_IMPORT_SUMMARY for ${filePath}`)
  }

  const summary = JSON.parse(summaryLine.slice('FBX_IMPORT_SUMMARY='.length))
  if (summary.meshes < 1) {
    throw new Error(`External FBX importer found no meshes in ${filePath}`)
  }
  if (expectedVertices !== null && !summary.vertices.includes(expectedVertices)) {
    throw new Error(`External FBX importer vertex count mismatch for ${filePath}: ${summary.vertices.join(', ')}`)
  }
  if (expectedPolygons !== null && !summary.polygons.includes(expectedPolygons)) {
    throw new Error(`External FBX importer polygon count mismatch for ${filePath}: ${summary.polygons.join(', ')}`)
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

main()
