import * as THREE from 'three'

const FBX_VERSION = 7400
const GEOMETRY_ID = 784479235
const MODEL_ID = 858373917
const DOCUMENT_ID = 754421682
const DEFAULT_MODEL_NAME = 'EffectMesh'
const FBX_BINARY_HEADER = 'Kaydara FBX Binary  \0'
const FBX_BINARY_FOOTER_MAGIC = [
  0xfa, 0xbc, 0xab, 0x09, 0xd0, 0xc8, 0xd4, 0x66,
  0xb1, 0x76, 0xfb, 0x83, 0x1c, 0xf7, 0x26, 0x7e,
]
const FBX_BINARY_FOOTER_MAGIC_2 = [
  0xf8, 0x5a, 0x8c, 0x6a, 0xde, 0xf5, 0xd9, 0x7e,
  0xec, 0xe9, 0x0c, 0xe3, 0x75, 0x8f, 0x29, 0x0b,
]
const FBX_BINARY_CREATION_TIME = '1970-01-01 10:00:00:000'
const FBX_UNIT_SCALE_FACTOR = 100
const FBX_NULL_RECORD_SIZE = 13

type FBXExportFormat = 'binary' | 'ascii'
type NumericAttribute = THREE.BufferAttribute | THREE.InterleavedBufferAttribute

interface FBXParseOptions {
  format?: FBXExportFormat
}

interface FBXMeshData {
  modelName: string
  vertices: number[]
  polygonIndices: number[]
  edges: number[]
  polygonVertexNormals: number[]
  polygonVertexUVs: number[] | null
  polygonVertexUVIndices: number[] | null
  polygonVertexColors: number[] | null
  polygonVertexColorIndices: number[] | null
}

type FBXProperty =
  | { type: 'C'; value: boolean }
  | { type: 'D'; value: number }
  | { type: 'I'; value: number }
  | { type: 'L'; value: number }
  | { type: 'S'; value: string }
  | { type: 'R'; value: number[] }
  | { type: 'd'; value: number[] }
  | { type: 'i'; value: number[] }

interface FBXNode {
  name: string
  properties: FBXProperty[]
  children: FBXNode[]
}

export class FBXExporter {
  parse(object: THREE.Object3D): ArrayBuffer
  parse(object: THREE.Object3D, options: { format: 'binary' }): ArrayBuffer
  parse(object: THREE.Object3D, options: { format: 'ascii' }): string
  parse(object: THREE.Object3D, options: FBXParseOptions = {}): ArrayBuffer | string {
    const mesh = this.findMesh(object)
    if (!mesh) {
      throw new Error('No mesh found for FBX export')
    }

    mesh.updateMatrixWorld(true)
    const format = options.format || 'binary'
    const nodes = this.createSceneNodes(this.extractMeshData(mesh), new Date(), format)
    return format === 'ascii'
      ? new FBXASCIIWriter().write(nodes)
      : new FBXBinaryWriter().write(nodes)
  }

  private createSceneNodes(data: FBXMeshData, timestamp: Date, format: FBXExportFormat): FBXNode[] {
    const nodes: FBXNode[] = [
      node('FBXHeaderExtension', [], [
        node('FBXHeaderVersion', [int(1003)]),
        node('FBXVersion', [int(FBX_VERSION)]),
        ...(format === 'binary' ? [node('EncryptionType', [int(0)])] : []),
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
        node('Creator', [str('Effect Mesh Generator')]),
        ...(format === 'binary' ? [node('SceneInfo', [str('GlobalInfo'), str('UserData')], [
          node('Type', [str('UserData')]),
          node('Version', [int(100)]),
          node('MetaData', [], [
            node('Version', [int(100)]),
            node('Title', [str('')]),
            node('Subject', [str('')]),
            node('Author', [str('Effect Mesh Generator')]),
            node('Keywords', [str('')]),
            node('Revision', [str('')]),
            node('Comment', [str('')]),
          ]),
          node('Properties70', [], [
            propertyNode('DocumentUrl', 'KString', 'Url', '', str('/effect-mesh-generator.fbx')),
            propertyNode('SrcDocumentUrl', 'KString', 'Url', '', str('/effect-mesh-generator.fbx')),
            propertyNode('Original', 'Compound', '', ''),
            propertyNode('Original|ApplicationVendor', 'KString', '', '', str('Effect Mesh Generator')),
            propertyNode('Original|ApplicationName', 'KString', '', '', str('Effect Mesh Generator')),
            propertyNode('Original|ApplicationVersion', 'KString', '', '', str('0.1.0')),
            propertyNode('Original|DateTime_GMT', 'DateTime', '', '', str('01/01/1970 00:00:00.000')),
            propertyNode('Original|FileName', 'KString', '', '', str('/effect-mesh-generator.fbx')),
            propertyNode('LastSaved', 'Compound', '', ''),
            propertyNode('LastSaved|ApplicationVendor', 'KString', '', '', str('Effect Mesh Generator')),
            propertyNode('LastSaved|ApplicationName', 'KString', '', '', str('Effect Mesh Generator')),
            propertyNode('LastSaved|ApplicationVersion', 'KString', '', '', str('0.1.0')),
            propertyNode('LastSaved|DateTime_GMT', 'DateTime', '', '', str('01/01/1970 00:00:00.000')),
            propertyNode('Original|ApplicationNativeFile', 'KString', '', '', str('')),
          ]),
        ])] : []),
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
          propertyNode('OriginalUpAxis', 'int', 'Integer', '', int(-1)),
          propertyNode('OriginalUpAxisSign', 'int', 'Integer', '', int(1)),
          propertyNode('UnitScaleFactor', 'double', 'Number', '', double(FBX_UNIT_SCALE_FACTOR)),
          propertyNode('OriginalUnitScaleFactor', 'double', 'Number', '', double(FBX_UNIT_SCALE_FACTOR)),
          propertyNode('AmbientColor', 'ColorRGB', 'Color', '', double(0), double(0), double(0)),
          propertyNode('DefaultCamera', 'KString', '', '', str('Producer Perspective')),
          propertyNode('TimeMode', 'enum', '', '', int(11)),
          propertyNode('TimeSpanStart', 'KTime', 'Time', '', long(0)),
          propertyNode('TimeSpanStop', 'KTime', 'Time', '', long(46186158000)),
          propertyNode('CustomFrameRate', 'double', 'Number', '', double(24)),
        ]),
      ]),
      this.createDefinitionsNode(),
      node('Objects', [], [
        this.createGeometryNode(data, format),
        this.createModelNode(data.modelName, format),
      ]),
      node('Connections', [], [
        node('C', [str('OO'), long(MODEL_ID), long(0)]),
        node('C', [str('OO'), long(GEOMETRY_ID), long(MODEL_ID)]),
      ]),
      node('Takes', [], [
        node('Current', [str('')]),
      ]),
    ]

    if (format === 'binary') {
      nodes.splice(
        1,
        0,
        node('FileId', [rawBytes([
          0x28, 0xb3, 0x2a, 0xeb, 0xb6, 0x24, 0xcc, 0xc2,
          0xbf, 0xc8, 0xb0, 0x2a, 0xa9, 0x2b, 0xfc, 0xf1,
        ])]),
        node('CreationTime', [str(FBX_BINARY_CREATION_TIME)]),
        node('Creator', [str('Effect Mesh Generator')])
      )
      nodes.splice(
        5,
        0,
        node('Documents', [], [
          node('Count', [int(1)]),
          node('Document', [long(DOCUMENT_ID), str('Scene'), str('Scene')], [
            node('Properties70', [], [
              propertyNode('SourceObject', 'object', '', ''),
              propertyNode('ActiveAnimStackName', 'KString', '', '', str('')),
            ]),
            node('RootNode', [long(0)]),
          ]),
        ]),
        node('References')
      )
    }

    return nodes
  }

  private createDefinitionsNode(): FBXNode {
    return node('Definitions', [], [
      node('Version', [int(100)]),
      node('Count', [int(3)]),
      node('ObjectType', [str('GlobalSettings')], [
        node('Count', [int(1)]),
      ]),
      node('ObjectType', [str('Geometry')], [
        node('Count', [int(1)]),
        node('PropertyTemplate', [str('FbxMesh')], [
          node('Properties70', [], [
            propertyNode('Color', 'ColorRGB', 'Color', '', double(0.8), double(0.8), double(0.8)),
            propertyNode('BBoxMin', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('BBoxMax', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('Primary Visibility', 'bool', '', '', int(1)),
            propertyNode('Casts Shadows', 'bool', '', '', int(1)),
            propertyNode('Receive Shadows', 'bool', '', '', int(1)),
          ]),
        ]),
      ]),
      node('ObjectType', [str('Model')], [
        node('Count', [int(1)]),
        node('PropertyTemplate', [str('FbxNode')], [
          node('Properties70', [], [
            propertyNode('QuaternionInterpolate', 'enum', '', '', int(0)),
            propertyNode('RotationOffset', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('RotationPivot', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('ScalingOffset', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('ScalingPivot', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('TranslationActive', 'bool', '', '', int(0)),
            propertyNode('TranslationMin', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('TranslationMax', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('TranslationMinX', 'bool', '', '', int(0)),
            propertyNode('TranslationMinY', 'bool', '', '', int(0)),
            propertyNode('TranslationMinZ', 'bool', '', '', int(0)),
            propertyNode('TranslationMaxX', 'bool', '', '', int(0)),
            propertyNode('TranslationMaxY', 'bool', '', '', int(0)),
            propertyNode('TranslationMaxZ', 'bool', '', '', int(0)),
            propertyNode('RotationOrder', 'enum', '', '', int(0)),
            propertyNode('RotationSpaceForLimitOnly', 'bool', '', '', int(0)),
            propertyNode('RotationStiffnessX', 'double', 'Number', '', double(0)),
            propertyNode('RotationStiffnessY', 'double', 'Number', '', double(0)),
            propertyNode('RotationStiffnessZ', 'double', 'Number', '', double(0)),
            propertyNode('AxisLen', 'double', 'Number', '', double(10)),
            propertyNode('PreRotation', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('PostRotation', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('RotationActive', 'bool', '', '', int(0)),
            propertyNode('RotationMin', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('RotationMax', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('RotationMinX', 'bool', '', '', int(0)),
            propertyNode('RotationMinY', 'bool', '', '', int(0)),
            propertyNode('RotationMinZ', 'bool', '', '', int(0)),
            propertyNode('RotationMaxX', 'bool', '', '', int(0)),
            propertyNode('RotationMaxY', 'bool', '', '', int(0)),
            propertyNode('RotationMaxZ', 'bool', '', '', int(0)),
            propertyNode('InheritType', 'enum', '', '', int(0)),
            propertyNode('ScalingActive', 'bool', '', '', int(0)),
            propertyNode('ScalingMin', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('ScalingMax', 'Vector3D', 'Vector', '', double(1), double(1), double(1)),
            propertyNode('ScalingMinX', 'bool', '', '', int(0)),
            propertyNode('ScalingMinY', 'bool', '', '', int(0)),
            propertyNode('ScalingMinZ', 'bool', '', '', int(0)),
            propertyNode('ScalingMaxX', 'bool', '', '', int(0)),
            propertyNode('ScalingMaxY', 'bool', '', '', int(0)),
            propertyNode('ScalingMaxZ', 'bool', '', '', int(0)),
            propertyNode('GeometricTranslation', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('GeometricRotation', 'Vector3D', 'Vector', '', double(0), double(0), double(0)),
            propertyNode('GeometricScaling', 'Vector3D', 'Vector', '', double(1), double(1), double(1)),
            propertyNode('MinDampRangeX', 'double', 'Number', '', double(0)),
            propertyNode('MinDampRangeY', 'double', 'Number', '', double(0)),
            propertyNode('MinDampRangeZ', 'double', 'Number', '', double(0)),
            propertyNode('MaxDampRangeX', 'double', 'Number', '', double(0)),
            propertyNode('MaxDampRangeY', 'double', 'Number', '', double(0)),
            propertyNode('MaxDampRangeZ', 'double', 'Number', '', double(0)),
            propertyNode('MinDampStrengthX', 'double', 'Number', '', double(0)),
            propertyNode('MinDampStrengthY', 'double', 'Number', '', double(0)),
            propertyNode('MinDampStrengthZ', 'double', 'Number', '', double(0)),
            propertyNode('MaxDampStrengthX', 'double', 'Number', '', double(0)),
            propertyNode('MaxDampStrengthY', 'double', 'Number', '', double(0)),
            propertyNode('MaxDampStrengthZ', 'double', 'Number', '', double(0)),
            propertyNode('PreferedAngleX', 'double', 'Number', '', double(0)),
            propertyNode('PreferedAngleY', 'double', 'Number', '', double(0)),
            propertyNode('PreferedAngleZ', 'double', 'Number', '', double(0)),
            propertyNode('LookAtProperty', 'object', '', ''),
            propertyNode('UpVectorProperty', 'object', '', ''),
            propertyNode('Show', 'bool', '', '', int(1)),
            propertyNode('NegativePercentShapeSupport', 'bool', '', '', int(1)),
            propertyNode('DefaultAttributeIndex', 'int', 'Integer', '', int(-1)),
            propertyNode('Freeze', 'bool', '', '', int(0)),
            propertyNode('LODBox', 'bool', '', '', int(0)),
            propertyNode('Lcl Translation', 'Lcl Translation', '', 'A', double(0), double(0), double(0)),
            propertyNode('Lcl Rotation', 'Lcl Rotation', '', 'A', double(0), double(0), double(0)),
            propertyNode('Lcl Scaling', 'Lcl Scaling', '', 'A', double(1), double(1), double(1)),
            propertyNode('Visibility', 'Visibility', '', 'A', double(1)),
            propertyNode('Visibility Inheritance', 'Visibility Inheritance', '', '', int(1)),
          ]),
        ]),
      ]),
    ])
  }

  private createGeometryNode(data: FBXMeshData, format: FBXExportFormat): FBXNode {
    return node(
      'Geometry',
      [long(GEOMETRY_ID), str(`Geometry::${data.modelName}Geometry`), str('Mesh')],
      [
        ...(format === 'binary' ? [node('Properties70')] : []),
        node('GeometryVersion', [int(124)]),
        node('Vertices', [doubleArray(data.vertices)]),
        node('PolygonVertexIndex', [intArray(data.polygonIndices)]),
        node('Edges', [intArray(data.edges)]),
        node('LayerElementNormal', [int(0)], [
          node('Version', [int(101)]),
          node('Name', [str('')]),
          node('MappingInformationType', [str('ByPolygonVertex')]),
          node('ReferenceInformationType', [str('Direct')]),
          node('Normals', [doubleArray(data.polygonVertexNormals)]),
        ]),
        ...(data.polygonVertexUVs && data.polygonVertexUVIndices ? [node('LayerElementUV', [int(0)], [
          node('Version', [int(101)]),
          node('Name', [str('UVChannel_1')]),
          node('MappingInformationType', [str('ByPolygonVertex')]),
          node('ReferenceInformationType', [str('IndexToDirect')]),
          node('UV', [doubleArray(data.polygonVertexUVs)]),
          node('UVIndex', [intArray(data.polygonVertexUVIndices)]),
        ])] : []),
        ...(data.polygonVertexColors && data.polygonVertexColorIndices ? [node('LayerElementColor', [int(0)], [
          node('Version', [int(101)]),
          node('Name', [str('Color')]),
          node('MappingInformationType', [str('ByPolygonVertex')]),
          node('ReferenceInformationType', [str('IndexToDirect')]),
          node('Colors', [doubleArray(data.polygonVertexColors)]),
          node('ColorIndex', [intArray(data.polygonVertexColorIndices)]),
        ])] : []),
        node('Layer', [int(0)], [
          node('Version', [int(100)]),
          layerElementNode('LayerElementNormal'),
          ...(data.polygonVertexUVs ? [layerElementNode('LayerElementUV')] : []),
          ...(data.polygonVertexColors ? [layerElementNode('LayerElementColor')] : []),
        ]),
      ]
    )
  }

  private createModelNode(modelName: string, format: FBXExportFormat): FBXNode {
    return node('Model', [long(MODEL_ID), str(`Model::${modelName}`), str('Mesh')], [
      node('Version', [int(232)]),
      node('Properties70', [], [
        propertyNode('Lcl Translation', 'Lcl Translation', '', 'A+', double(0), double(0), double(0)),
        propertyNode('Lcl Rotation', 'Lcl Rotation', '', 'A+', double(0), double(0), double(0)),
        propertyNode('Lcl Scaling', 'Lcl Scaling', '', 'A+', double(1), double(1), double(1)),
        propertyNode('InheritType', 'enum', '', '', int(1)),
        propertyNode('DefaultAttributeIndex', 'int', 'Integer', '', int(0)),
      ]),
      ...(format === 'binary' ? [node('MultiLayer', [int(0)]), node('MultiTake', [int(0)])] : []),
      node('Shading', [bool(true)]),
      node('Culling', [str('CullingOff')]),
    ])
  }

  private extractMeshData(mesh: THREE.Mesh): FBXMeshData {
    const geometry = mesh.geometry
    const positionAttribute = geometry.getAttribute('position')

    if (!positionAttribute) {
      throw new Error('Mesh is missing position data')
    }

    const vertexIndices = this.extractVertexIndices(geometry, positionAttribute)
    if (vertexIndices.length % 3 !== 0) {
      throw new Error('FBX export only supports triangle meshes')
    }

    const normalGeometry = geometry.getAttribute('normal') ? null : geometry.clone()
    if (normalGeometry) {
      normalGeometry.computeVertexNormals()
    }

    const normalAttribute = geometry.getAttribute('normal') || normalGeometry?.getAttribute('normal') || null
    const uvAttribute = geometry.getAttribute('uv') || null
    const colorAttribute = geometry.getAttribute('color') || null
    const data: FBXMeshData = {
      modelName: this.getSafeModelName(mesh.name || DEFAULT_MODEL_NAME),
      vertices: this.extractVertices(mesh, positionAttribute),
      polygonIndices: this.createPolygonIndices(vertexIndices),
      edges: this.createEdges(vertexIndices),
      polygonVertexNormals: this.extractPolygonVertexNormals(mesh, normalAttribute, vertexIndices),
      polygonVertexUVs: uvAttribute ? this.extractPolygonVertexUVs(uvAttribute, vertexIndices) : null,
      polygonVertexUVIndices: uvAttribute ? this.createSequentialIndices(vertexIndices.length) : null,
      polygonVertexColors: colorAttribute ? this.extractPolygonVertexColors(colorAttribute, vertexIndices) : null,
      polygonVertexColorIndices: colorAttribute ? this.createSequentialIndices(vertexIndices.length) : null,
    }

    normalGeometry?.dispose()
    return data
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

  private extractVertices(mesh: THREE.Mesh, positionAttribute: NumericAttribute): number[] {
    const vertices: number[] = []
    const vertex = new THREE.Vector3()

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.set(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      )
      vertex.applyMatrix4(mesh.matrixWorld)
      vertices.push(vertex.x, vertex.y, vertex.z)
    }

    return vertices
  }

  private extractVertexIndices(
    geometry: THREE.BufferGeometry,
    positionAttribute: NumericAttribute
  ): number[] {
    const indices: number[] = []
    const indexAttribute = geometry.index

    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i++) {
        indices.push(indexAttribute.getX(i))
      }
      return indices
    }

    for (let i = 0; i < positionAttribute.count; i++) {
      indices.push(i)
    }

    return indices
  }

  private createPolygonIndices(vertexIndices: number[]): number[] {
    return vertexIndices.map((index, itemIndex) => (
      (itemIndex + 1) % 3 === 0 ? -index - 1 : index
    ))
  }

  private createEdges(vertexIndices: number[]): number[] {
    const edges: number[] = []
    const edgeKeys = new Set<string>()

    for (let polygonStart = 0; polygonStart < vertexIndices.length; polygonStart += 3) {
      for (let corner = 0; corner < 3; corner++) {
        const loopIndex = polygonStart + corner
        const nextLoopIndex = polygonStart + ((corner + 1) % 3)
        const vertexA = vertexIndices[loopIndex]
        const vertexB = vertexIndices[nextLoopIndex]
        const edgeKey = vertexA < vertexB ? `${vertexA}:${vertexB}` : `${vertexB}:${vertexA}`

        if (!edgeKeys.has(edgeKey)) {
          edgeKeys.add(edgeKey)
          edges.push(loopIndex)
        }
      }
    }

    return edges
  }

  private createSequentialIndices(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index)
  }

  private extractPolygonVertexNormals(
    mesh: THREE.Mesh,
    normalAttribute: NumericAttribute | null,
    vertexIndices: number[]
  ): number[] {
    const normals: number[] = []
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
    const normal = new THREE.Vector3()

    for (const vertexIndex of vertexIndices) {
      if (normalAttribute && vertexIndex < normalAttribute.count) {
        normal.set(
          normalAttribute.getX(vertexIndex),
          normalAttribute.getY(vertexIndex),
          normalAttribute.getZ(vertexIndex)
        )
      } else {
        normal.set(0, 0, 1)
      }

      normal.applyMatrix3(normalMatrix)
      if (normal.lengthSq() <= 0.0000001) {
        normal.set(0, 0, 1)
      } else {
        normal.normalize()
      }
      normals.push(normal.x, normal.y, normal.z)
    }

    return normals
  }

  private extractPolygonVertexUVs(
    uvAttribute: NumericAttribute | null,
    vertexIndices: number[]
  ): number[] {
    const uvs: number[] = []

    for (const vertexIndex of vertexIndices) {
      if (uvAttribute && vertexIndex < uvAttribute.count) {
        uvs.push(uvAttribute.getX(vertexIndex), 1 - uvAttribute.getY(vertexIndex))
      } else {
        uvs.push(0, 0)
      }
    }

    return uvs
  }

  private extractPolygonVertexColors(
    colorAttribute: NumericAttribute | null,
    vertexIndices: number[]
  ): number[] {
    const colors: number[] = []

    for (const vertexIndex of vertexIndices) {
      if (colorAttribute && vertexIndex < colorAttribute.count && colorAttribute.itemSize >= 3) {
        colors.push(
          normalizeColor(colorAttribute.getX(vertexIndex)),
          normalizeColor(colorAttribute.getY(vertexIndex)),
          normalizeColor(colorAttribute.getZ(vertexIndex)),
          colorAttribute.itemSize >= 4 ? normalizeColor(colorAttribute.getW(vertexIndex)) : 1
        )
      } else {
        colors.push(1, 1, 1, 1)
      }
    }

    return colors
  }

  private getSafeModelName(name: string): string {
    return name.trim().replace(/[",\r\n\t]/g, '_') || DEFAULT_MODEL_NAME
  }
}

class FBXASCIIWriter {
  private lines: string[] = []
  private indentLevel = 0

  write(nodes: FBXNode[]): string {
    this.line('; FBX 7.4.0 project file')
    this.line('; Generated by Effect Mesh Generator')
    this.line('')
    nodes.forEach((fbxNode) => this.writeNode(fbxNode))
    return `${this.lines.join('\n')}\n`
  }

  private writeNode(fbxNode: FBXNode): void {
    const arrayProperty = getArrayProperty(fbxNode)
    if (arrayProperty) {
      this.node(`${fbxNode.name}: *${arrayProperty.value.length}`, () => {
        this.line(`a: ${arrayProperty.value.map(arrayProperty.type === 'i' ? formatInteger : formatNumber).join(',')}`)
      })
      return
    }

    const properties = fbxNode.properties.map(formatASCIIProperty).join(', ')

    if (fbxNode.properties.length === 0 && fbxNode.children.length === 0) {
      this.node(`${fbxNode.name}:`, () => {})
      return
    }

    if (fbxNode.children.length > 0) {
      this.node(`${fbxNode.name}:${properties ? ` ${properties}` : ''}`, () => {
        fbxNode.children.forEach((child) => this.writeNode(child))
      })
      return
    }

    this.line(`${fbxNode.name}: ${properties}`)
  }

  private node(header: string, writeChildren: () => void): void {
    this.line(`${header} {`)
    this.indentLevel += 1
    writeChildren()
    this.indentLevel -= 1
    this.line('}')
  }

  private line(value = ''): void {
    this.lines.push(`${'\t'.repeat(this.indentLevel)}${value}`)
  }
}

class FBXBinaryWriter {
  private bytes: number[] = []
  private readonly encoder = new TextEncoder()

  get offset(): number {
    return this.bytes.length
  }

  write(nodes: FBXNode[]): ArrayBuffer {
    this.writeHeader()
    nodes.forEach((fbxNode) => this.writeNode(fbxNode))
    this.writeZeros(FBX_NULL_RECORD_SIZE)
    this.writeFooter()
    return Uint8Array.from(this.bytes).buffer
  }

  private writeHeader(): void {
    this.writeAscii(FBX_BINARY_HEADER)
    this.writeUint8(0x1a)
    this.writeUint8(0x00)
    this.writeUint32(FBX_VERSION)
  }

  private writeFooter(): void {
    this.writeBytes(FBX_BINARY_FOOTER_MAGIC)

    const paddingLength = (16 - (this.offset % 16)) % 16
    this.writeZeros(paddingLength)

    this.writeUint32(FBX_VERSION)
    this.writeZeros(120)
    this.writeBytes(FBX_BINARY_FOOTER_MAGIC_2)
  }

  private writeNode(fbxNode: FBXNode): void {
    const endOffsetPosition = this.reserveUint32()

    this.writeUint32(fbxNode.properties.length)
    const propertyListLengthPosition = this.reserveUint32()
    this.writeUint8(fbxNode.name.length)
    this.writeAscii(fbxNode.name)

    const propertyStartOffset = this.offset
    fbxNode.properties.forEach((property, propertyIndex) => (
      this.writeProperty(this.getBinaryProperty(fbxNode, property, propertyIndex))
    ))
    this.patchUint32(propertyListLengthPosition, this.offset - propertyStartOffset)

    fbxNode.children.forEach((child) => this.writeNode(child))
    if (fbxNode.children.length > 0 || isEmptyBranchNode(fbxNode)) {
      this.writeZeros(FBX_NULL_RECORD_SIZE)
    }

    this.patchUint32(endOffsetPosition, this.offset)
  }

  private writeProperty(property: FBXProperty): void {
    this.writeAscii(property.type)

    switch (property.type) {
      case 'C':
        this.writeUint8(property.value ? 1 : 0)
        break
      case 'D':
        this.writeFloat64(property.value)
        break
      case 'I':
        this.writeInt32(property.value)
        break
      case 'L':
        this.writeInt64(property.value)
        break
      case 'S':
        this.writeStringProperty(property.value)
        break
      case 'R':
        this.writeRawProperty(property.value)
        break
      case 'd':
        this.writeFloat64Array(property.value)
        break
      case 'i':
        this.writeInt32Array(property.value)
        break
    }
  }

  private getBinaryProperty(
    fbxNode: FBXNode,
    property: FBXProperty,
    propertyIndex: number
  ): FBXProperty {
    if (property.type !== 'S' || !isBinaryObjectNameProperty(fbxNode, propertyIndex)) {
      return property
    }

    const className = getBinaryObjectClassName(fbxNode)
    if (!className) {
      return property
    }

    const objectName = stripFBXClassPrefix(property.value, className)
    return str(`${objectName}\u0000\u0001${className}`)
  }

  private reserveUint32(): number {
    const position = this.offset
    this.writeUint32(0)
    return position
  }

  private patchUint32(position: number, value: number): void {
    const bytes = this.numberToBytes(4, (view) => view.setUint32(0, value, true))
    this.bytes.splice(position, bytes.length, ...bytes)
  }

  private writeZeros(count: number): void {
    for (let i = 0; i < count; i++) {
      this.writeUint8(0)
    }
  }

  private writeBytes(values: number[] | Uint8Array): void {
    this.bytes.push(...values)
  }

  private writeAscii(value: string): void {
    this.writeBytes(this.encoder.encode(value))
  }

  private writeUint8(value: number): void {
    this.bytes.push(value & 0xff)
  }

  private writeInt32(value: number): void {
    this.writeNumber(4, (view) => view.setInt32(0, value, true))
  }

  private writeUint32(value: number): void {
    this.writeNumber(4, (view) => view.setUint32(0, value, true))
  }

  private writeInt64(value: number): void {
    this.writeNumber(8, (view) => view.setBigInt64(0, BigInt(value), true))
  }

  private writeFloat64(value: number): void {
    this.writeNumber(8, (view) => view.setFloat64(0, value, true))
  }

  private writeStringProperty(value: string): void {
    const encoded = this.encoder.encode(value)
    this.writeUint32(encoded.length)
    this.writeBytes(encoded)
  }

  private writeRawProperty(value: number[]): void {
    this.writeUint32(value.length)
    this.writeBytes(value)
  }

  private writeInt32Array(values: number[]): void {
    this.writeUint32(values.length)
    this.writeUint32(0)
    this.writeUint32(values.length * 4)
    values.forEach((value) => this.writeInt32(value))
  }

  private writeFloat64Array(values: number[]): void {
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

function rawBytes(value: number[]): FBXProperty {
  return { type: 'R', value }
}

function doubleArray(value: number[]): FBXProperty {
  return { type: 'd', value }
}

function intArray(value: number[]): FBXProperty {
  return { type: 'i', value }
}

function getBinaryObjectClassName(fbxNode: FBXNode): string | null {
  switch (fbxNode.name) {
    case 'Geometry':
    case 'Model':
    case 'SceneInfo':
    case 'Material':
    case 'Texture':
    case 'Video':
    case 'Deformer':
    case 'Pose':
      return fbxNode.name
    default:
      return null
  }
}

function stripFBXClassPrefix(value: string, className: string): string {
  const prefix = `${className}::`
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}

function isBinaryObjectNameProperty(fbxNode: FBXNode, propertyIndex: number): boolean {
  return fbxNode.name === 'SceneInfo' ? propertyIndex === 0 : propertyIndex === 1
}

function isEmptyBranchNode(fbxNode: FBXNode): boolean {
  return fbxNode.properties.length === 0 && (
    fbxNode.name === 'Properties70' ||
    fbxNode.name === 'References'
  )
}

function getArrayProperty(fbxNode: FBXNode): Extract<FBXProperty, { type: 'd' | 'i' }> | null {
  if (fbxNode.properties.length !== 1 || fbxNode.children.length > 0) {
    return null
  }

  const property = fbxNode.properties[0]
  return property.type === 'd' || property.type === 'i' ? property : null
}

function formatASCIIProperty(property: FBXProperty): string {
  switch (property.type) {
    case 'C':
      return property.value ? 'T' : 'F'
    case 'D':
    case 'I':
    case 'L':
      return formatNumber(property.value)
    case 'S':
      return quote(property.value)
    case 'R':
      return property.value.map(formatInteger).join(',')
    case 'd':
      return property.value.map(formatNumber).join(',')
    case 'i':
      return property.value.map(formatInteger).join(',')
  }
}

function formatFBXTimestamp(value: Date): string {
  return [
    value.getFullYear().toString().padStart(4, '0'),
    (value.getMonth() + 1).toString().padStart(2, '0'),
    value.getDate().toString().padStart(2, '0'),
  ].join('-') + ' ' + [
    value.getHours().toString().padStart(2, '0'),
    value.getMinutes().toString().padStart(2, '0'),
    value.getSeconds().toString().padStart(2, '0'),
  ].join(':') + `:${value.getMilliseconds().toString().padStart(3, '0')}`
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n\t]/g, '_')}"`
}

function formatInteger(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('FBX export encountered a non-finite integer value')
  }

  return `${Math.trunc(value)}`
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('FBX export encountered a non-finite numeric value')
  }

  if (Math.abs(value) < 0.0000000001) {
    return '0'
  }

  return value.toFixed(10).replace(/\.?0+$/, '')
}

function normalizeColor(value: number): number {
  if (!Number.isFinite(value)) {
    return 1
  }

  const normalizedValue = value > 1 ? value / 255 : value
  return THREE.MathUtils.clamp(normalizedValue, 0, 1)
}
