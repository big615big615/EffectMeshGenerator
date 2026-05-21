import * as THREE from 'three'

const FBX_VERSION = 7400
const GEOMETRY_ID = 2001
const MODEL_ID = 1001
const MATERIAL_ID = 3001
const FBX_HEADER_MAGIC = 'Kaydara FBX Binary  \0'
const FBX_FOOTER_MAGIC = [
  0xfa, 0xbc, 0xab, 0x09, 0xd0, 0xc8, 0xd4, 0x66,
  0xb1, 0x76, 0xfb, 0x83, 0x1c, 0xf7, 0x26, 0x7e,
]
const FBX_FOOTER_MAGIC_2 = [0xf8, 0x5a, 0x8c, 0x6a]
const FBX_NULL_RECORD_SIZE = 13

interface FBXMeshData {
  modelName: string
  vertices: number[]
  polygonIndices: number[]
  vertexIndices: number[]
  normals: number[]
  uvValues: number[]
}

type FBXProperty =
  | { type: 'C'; value: boolean }
  | { type: 'D'; value: number }
  | { type: 'I'; value: number }
  | { type: 'L'; value: number }
  | { type: 'S'; value: string }
  | { type: 'd'; value: number[] }
  | { type: 'i'; value: number[] }

interface FBXNode {
  name: string
  properties: FBXProperty[]
  children: FBXNode[]
}

export class FBXExporter {
  parse(object: THREE.Object3D): ArrayBuffer {
    return this.generateFBXContent(object)
  }

  private generateFBXContent(object: THREE.Object3D): ArrayBuffer {
    const mesh = this.findMesh(object)
    if (!mesh) {
      throw new Error('No mesh found for FBX export')
    }

    mesh.updateMatrixWorld(true)

    const vertexIndices = this.extractVertexIndices(mesh)
    const data: FBXMeshData = {
      modelName: this.getSafeModelName(mesh.name || 'SlashMesh'),
      vertices: this.extractVertices(mesh),
      polygonIndices: this.createPolygonIndices(vertexIndices),
      vertexIndices,
      normals: this.extractNormals(mesh),
      uvValues: this.extractUVValues(mesh),
    }

    const writer = new FBXBinaryWriter()
    this.writeBinaryHeader(writer)
    this.createSceneNodes(data, new Date()).forEach((node) => this.writeNode(writer, node))
    writer.writeZeros(FBX_NULL_RECORD_SIZE)
    this.writeBinaryFooter(writer)
    return writer.toArrayBuffer()
  }

  private createSceneNodes(data: FBXMeshData, timestamp: Date): FBXNode[] {
    return [
      node('FBXHeaderExtension', [], [
        node('FBXHeaderVersion', [int(1003)]),
        node('FBXVersion', [int(FBX_VERSION)]),
        node('Creator', [str('Effect Mesh Generator')]),
        node('CreationTimeStamp', [], [
          node('Version', [int(1000)]),
          node('Year', [int(timestamp.getFullYear())]),
          node('Month', [int(timestamp.getMonth() + 1)]),
          node('Day', [int(timestamp.getDate())]),
          node('Hour', [int(timestamp.getHours())]),
          node('Minute', [int(timestamp.getMinutes())]),
          node('Second', [int(timestamp.getSeconds())]),
          node('Millisecond', [int(timestamp.getMilliseconds())]),
        ]),
      ]),
      node('GlobalSettings', [], [
        node('Version', [int(1000)]),
        node('Properties70', [], [
          propertyNode('UpAxis', 'int', 'Integer', '', int(1)),
          propertyNode('UpAxisSign', 'int', 'Integer', '', int(1)),
          propertyNode('FrontAxis', 'int', 'Integer', '', int(2)),
          propertyNode('FrontAxisSign', 'int', 'Integer', '', int(1)),
          propertyNode('CoordAxis', 'int', 'Integer', '', int(0)),
          propertyNode('CoordAxisSign', 'int', 'Integer', '', int(1)),
          propertyNode('UnitScaleFactor', 'double', 'Number', '', double(1)),
          propertyNode('OriginalUnitScaleFactor', 'double', 'Number', '', double(1)),
        ]),
      ]),
      node('Definitions', [], [
        node('Version', [int(100)]),
        node('Count', [int(3)]),
        node('ObjectType', [str('Geometry')], [node('Count', [int(1)])]),
        node('ObjectType', [str('Model')], [node('Count', [int(1)])]),
        node('ObjectType', [str('Material')], [node('Count', [int(1)])]),
      ]),
      node('Objects', [], [
        this.createGeometryNode(data),
        this.createModelNode(data.modelName),
        this.createMaterialNode(),
      ]),
      node('Connections', [], [
        node('C', [str('OO'), long(GEOMETRY_ID), long(MODEL_ID)]),
        node('C', [str('OO'), long(MODEL_ID), long(0)]),
        node('C', [str('OO'), long(MATERIAL_ID), long(MODEL_ID)]),
      ]),
      node('Takes', [], [
        node('Current', [str('')]),
      ]),
    ]
  }

  private createGeometryNode(data: FBXMeshData): FBXNode {
    const children = [
      node('GeometryVersion', [int(124)]),
      node('Vertices', [doubleArray(data.vertices)]),
      node('PolygonVertexIndex', [intArray(data.polygonIndices)]),
    ]

    if (data.normals.length > 0) {
      children.push(node('LayerElementNormal', [int(0)], [
        node('Version', [int(101)]),
        node('Name', [str('')]),
        node('MappingInformationType', [str('ByPolygonVertex')]),
        node('ReferenceInformationType', [str('IndexToDirect')]),
        node('Normals', [doubleArray(data.normals)]),
        node('NormalsIndex', [intArray(data.vertexIndices)]),
      ]))
    }

    if (data.uvValues.length > 0) {
      children.push(node('LayerElementUV', [int(0)], [
        node('Version', [int(101)]),
        node('Name', [str('UVChannel_1')]),
        node('MappingInformationType', [str('ByPolygonVertex')]),
        node('ReferenceInformationType', [str('IndexToDirect')]),
        node('UV', [doubleArray(data.uvValues)]),
        node('UVIndex', [intArray(data.vertexIndices)]),
      ]))
    }

    children.push(
      node('LayerElementMaterial', [int(0)], [
        node('Version', [int(101)]),
        node('Name', [str('')]),
        node('MappingInformationType', [str('AllSame')]),
        node('ReferenceInformationType', [str('IndexToDirect')]),
        node('Materials', [intArray([0])]),
      ]),
      node('Layer', [int(0)], this.createLayerNodes(data))
    )

    return node(
      'Geometry',
      [long(GEOMETRY_ID), str(`Geometry::${data.modelName}Geometry`), str('Mesh')],
      children
    )
  }

  private createLayerNodes(data: FBXMeshData): FBXNode[] {
    const layerNodes = [node('Version', [int(100)])]

    if (data.normals.length > 0) {
      layerNodes.push(layerElementNode('LayerElementNormal'))
    }

    if (data.uvValues.length > 0) {
      layerNodes.push(layerElementNode('LayerElementUV'))
    }

    layerNodes.push(layerElementNode('LayerElementMaterial'))
    return layerNodes
  }

  private createModelNode(modelName: string): FBXNode {
    return node('Model', [long(MODEL_ID), str(`Model::${modelName}`), str('Mesh')], [
      node('Version', [int(232)]),
      node('Shading', [bool(true)]),
      node('Culling', [str('CullingOff')]),
      node('Properties70', [], [
        propertyNode('Lcl Translation', 'Lcl Translation', '', 'A+', double(0), double(0), double(0)),
        propertyNode('Lcl Rotation', 'Lcl Rotation', '', 'A+', double(0), double(0), double(0)),
        propertyNode('Lcl Scaling', 'Lcl Scaling', '', 'A+', double(1), double(1), double(1)),
        propertyNode('InheritType', 'enum', '', '', int(1)),
        propertyNode('DefaultAttributeIndex', 'int', 'Integer', '', int(0)),
      ]),
    ])
  }

  private createMaterialNode(): FBXNode {
    return node('Material', [long(MATERIAL_ID), str('Material::DefaultMaterial'), str('Phong')], [
      node('Version', [int(102)]),
      node('ShadingModel', [str('Phong')]),
      node('MultiLayer', [int(0)]),
      node('Properties70', [], [
        propertyNode('AmbientColor', 'Color', '', 'A', double(0), double(0), double(0)),
        propertyNode('DiffuseColor', 'Color', '', 'A', double(0.666667), double(1), double(0.498039)),
        propertyNode('SpecularColor', 'Color', '', 'A', double(0.5), double(0.5), double(0.5)),
        propertyNode('EmissiveColor', 'Color', '', 'A', double(0), double(0.666667), double(0.266667)),
        propertyNode('Opacity', 'double', 'Number', '', double(1)),
        propertyNode('Shininess', 'double', 'Number', '', double(20)),
      ]),
    ])
  }

  private writeBinaryHeader(writer: FBXBinaryWriter): void {
    writer.writeAscii(FBX_HEADER_MAGIC)
    writer.writeUint8(0x1a)
    writer.writeUint8(0x00)
    writer.writeUint32(FBX_VERSION)
  }

  private writeBinaryFooter(writer: FBXBinaryWriter): void {
    writer.writeBytes(FBX_FOOTER_MAGIC)

    const paddingLength = 16 - (writer.offset % 16)
    writer.writeZeros(paddingLength === 0 ? 16 : paddingLength)

    writer.writeBytes(FBX_FOOTER_MAGIC_2)
    writer.writeUint32(FBX_VERSION)
    writer.writeZeros(120)
    writer.writeBytes(FBX_FOOTER_MAGIC)
  }

  private writeNode(writer: FBXBinaryWriter, fbxNode: FBXNode): void {
    const startOffset = writer.offset
    const endOffsetPosition = writer.reserveUint32()

    writer.writeUint32(fbxNode.properties.length)
    const propertyListLengthPosition = writer.reserveUint32()
    writer.writeUint8(fbxNode.name.length)
    writer.writeAscii(fbxNode.name)

    const propertyStartOffset = writer.offset
    fbxNode.properties.forEach((property) => this.writeProperty(writer, property))
    writer.patchUint32(propertyListLengthPosition, writer.offset - propertyStartOffset)

    fbxNode.children.forEach((child) => this.writeNode(writer, child))
    if (fbxNode.children.length > 0) {
      writer.writeZeros(FBX_NULL_RECORD_SIZE)
    }

    writer.patchUint32(endOffsetPosition, writer.offset)

    if (writer.offset <= startOffset) {
      throw new Error(`Failed to write FBX node: ${fbxNode.name}`)
    }
  }

  private writeProperty(writer: FBXBinaryWriter, property: FBXProperty): void {
    writer.writeAscii(property.type)

    switch (property.type) {
      case 'C':
        writer.writeUint8(property.value ? 1 : 0)
        break
      case 'D':
        writer.writeFloat64(property.value)
        break
      case 'I':
        writer.writeInt32(property.value)
        break
      case 'L':
        writer.writeInt64(property.value)
        break
      case 'S':
        writer.writeStringProperty(property.value)
        break
      case 'd':
        writer.writeFloat64Array(property.value)
        break
      case 'i':
        writer.writeInt32Array(property.value)
        break
    }
  }

  private findMesh(object: THREE.Object3D): THREE.Mesh | null {
    if (object instanceof THREE.Mesh) {
      return object
    }

    let mesh: THREE.Mesh | null = null
    object.traverse((child) => {
      if (mesh === null && child instanceof THREE.Mesh) {
        mesh = child
      }
    })

    return mesh
  }

  private extractVertices(mesh: THREE.Mesh): number[] {
    const vertices: number[] = []
    const positionAttribute = mesh.geometry.getAttribute('position')
    const vertex = new THREE.Vector3()

    if (positionAttribute) {
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i)
        vertex.applyMatrix4(mesh.matrixWorld)
        vertices.push(vertex.x, vertex.y, vertex.z)
      }
    }

    return vertices
  }

  private extractVertexIndices(mesh: THREE.Mesh): number[] {
    const indices: number[] = []
    const indexAttribute = mesh.geometry.index

    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i++) {
        indices.push(indexAttribute.getX(i) as number)
      }
      return indices
    }

    const positionAttribute = mesh.geometry.getAttribute('position')
    if (positionAttribute) {
      for (let i = 0; i < positionAttribute.count; i++) {
        indices.push(i)
      }
    }

    return indices
  }

  private createPolygonIndices(vertexIndices: number[]): number[] {
    return vertexIndices.map((index, itemIndex) => (
      (itemIndex + 1) % 3 === 0 ? -index - 1 : index
    ))
  }

  private extractNormals(mesh: THREE.Mesh): number[] {
    const normals: number[] = []
    const normalAttribute = mesh.geometry.getAttribute('normal')
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
    const normal = new THREE.Vector3()

    if (normalAttribute) {
      for (let i = 0; i < normalAttribute.count; i++) {
        normal.fromBufferAttribute(normalAttribute, i)
        normal.applyMatrix3(normalMatrix).normalize()
        normals.push(normal.x, normal.y, normal.z)
      }
    }

    return normals
  }

  private extractUVValues(mesh: THREE.Mesh): number[] {
    const uvs: number[] = []
    const uvAttribute = mesh.geometry.getAttribute('uv')

    if (uvAttribute) {
      for (let i = 0; i < uvAttribute.count; i++) {
        uvs.push(uvAttribute.getX(i), 1 - uvAttribute.getY(i))
      }
    }

    return uvs
  }

  private getSafeModelName(name: string): string {
    const safeName = name.trim().replace(/[",\r\n\t]/g, '_')
    return safeName || 'SlashMesh'
  }
}

class FBXBinaryWriter {
  private bytes: number[] = []
  private readonly encoder = new TextEncoder()

  get offset(): number {
    return this.bytes.length
  }

  toArrayBuffer(): ArrayBuffer {
    return Uint8Array.from(this.bytes).buffer
  }

  reserveUint32(): number {
    const position = this.offset
    this.writeUint32(0)
    return position
  }

  patchUint32(position: number, value: number): void {
    const bytes = this.numberToBytes(4, (view) => view.setUint32(0, value, true))
    this.bytes.splice(position, bytes.length, ...bytes)
  }

  writeZeros(count: number): void {
    for (let i = 0; i < count; i++) {
      this.writeUint8(0)
    }
  }

  writeBytes(values: number[] | Uint8Array): void {
    this.bytes.push(...values)
  }

  writeAscii(value: string): void {
    this.writeBytes(this.encoder.encode(value))
  }

  writeUint8(value: number): void {
    this.bytes.push(value & 0xff)
  }

  writeInt32(value: number): void {
    this.writeNumber(4, (view) => view.setInt32(0, value, true))
  }

  writeUint32(value: number): void {
    this.writeNumber(4, (view) => view.setUint32(0, value, true))
  }

  writeInt64(value: number): void {
    this.writeNumber(8, (view) => view.setBigInt64(0, BigInt(value), true))
  }

  writeFloat64(value: number): void {
    this.writeNumber(8, (view) => view.setFloat64(0, value, true))
  }

  writeStringProperty(value: string): void {
    const encoded = this.encoder.encode(value)
    this.writeUint32(encoded.length)
    this.writeBytes(encoded)
  }

  writeInt32Array(values: number[]): void {
    this.writeUint32(values.length)
    this.writeUint32(0)
    this.writeUint32(values.length * 4)
    values.forEach((value) => this.writeInt32(value))
  }

  writeFloat64Array(values: number[]): void {
    this.writeUint32(values.length)
    this.writeUint32(0)
    this.writeUint32(values.length * 8)
    values.forEach((value) => this.writeFloat64(value))
  }

  private writeNumber(byteLength: number, write: (view: DataView) => void): void {
    this.writeBytes(this.numberToBytes(byteLength, write))
  }

  private numberToBytes(byteLength: number, write: (view: DataView) => void): Uint8Array {
    const buffer = new ArrayBuffer(byteLength)
    write(new DataView(buffer))
    return new Uint8Array(buffer)
  }
}

function node(name: string, properties: FBXProperty[] = [], children: FBXNode[] = []): FBXNode {
  return { name, properties, children }
}

function propertyNode(
  name: string,
  type: string,
  type2: string,
  flag: string,
  ...values: FBXProperty[]
): FBXNode {
  return node('P', [str(name), str(type), str(type2), str(flag), ...values])
}

function layerElementNode(type: string): FBXNode {
  return node('LayerElement', [], [
    node('Type', [str(type)]),
    node('TypedIndex', [int(0)]),
  ])
}

function bool(value: boolean): FBXProperty {
  return { type: 'C', value }
}

function double(value: number): FBXProperty {
  return { type: 'D', value }
}

function int(value: number): FBXProperty {
  return { type: 'I', value }
}

function long(value: number): FBXProperty {
  return { type: 'L', value }
}

function str(value: string): FBXProperty {
  return { type: 'S', value }
}

function doubleArray(value: number[]): FBXProperty {
  return { type: 'd', value }
}

function intArray(value: number[]): FBXProperty {
  return { type: 'i', value }
}
