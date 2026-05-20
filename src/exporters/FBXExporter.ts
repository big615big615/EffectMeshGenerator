import * as THREE from 'three'

/**
 * FBX形式エクスポーター
 * Three.js FBXExporter をベースにしたシンプル版実装
 */
export class FBXExporter {
  parse(object: THREE.Object3D): string {
    const fbxContent = this.generateFBXContent(object)
    return fbxContent
  }

  private generateFBXContent(object: THREE.Object3D): string {
    // FBXファイルのバイナリシグネチャ
    const header = '; FBX 7.4.0 project file\n'
    const info = '; Created by Effect Mesh Generator\n'

    let content = header + info + '\n'

    // FBXのテンプレート構造
    content += 'FBXHeaderExtension:  {\n'
    content += '  FBXHeaderVersion: 1003\n'
    content += '  FBXVersion: 7400\n'
    content += '  Creator: "Effect Mesh Generator"\n'
    content += '  CreationTimeStamp: {\n'
    content += '    Version: 1000\n'
    content += '    Year: ' + new Date().getFullYear() + '\n'
    content += '    Month: ' + (new Date().getMonth() + 1) + '\n'
    content += '    Day: ' + new Date().getDate() + '\n'
    content += '    Hour: ' + new Date().getHours() + '\n'
    content += '    Minute: ' + new Date().getMinutes() + '\n'
    content += '    Second: ' + new Date().getSeconds() + '\n'
    content += '  }\n'
    content += '}\n\n'

    // Geometry information
    content += 'GlobalSettings:  {\n'
    content += '  Version: 1000\n'
    content += '  Properties70:  {\n'
    content += '    P: "UpAxis", "enum", "", "",1\n'
    content += '    P: "UpAxisSign", "int", "Integer", "",1\n'
    content += '    P: "FrontAxis", "enum", "", "",2\n'
    content += '    P: "FrontAxisSign", "int", "Integer", "",1\n'
    content += '    P: "CoordAxis", "enum", "", "",0\n'
    content += '    P: "CoordAxisSign", "int", "Integer", "",1\n'
    content += '    P: "UnitScaleFactor", "double", "Number", "",1\n'
    content += '  }\n'
    content += '}\n\n'

    // Model information
    content += 'Model: 1001, "Model::Mesh", "Mesh"  {\n'
    content += '  Version: 232\n'
    content += '  Properties70:  {\n'

    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry as THREE.BufferGeometry
      const vertices = geometry.getAttribute('position') as THREE.BufferAttribute
      const vertexCount = vertices ? vertices.count : 0

      content += `    P: "Lcl Translation", "Lcl Translation", "", "A+",${object.position.x},${object.position.y},${object.position.z}\n`
      content += '    P: "Lcl Rotation", "Lcl Rotation", "", "A+",0,0,0\n'
      content += '    P: "Lcl Scaling", "Lcl Scaling", "", "A+",1,1,1\n'
      content += '    P: "VertexCount", "int", "Integer", "",' + vertexCount + '\n'
    }

    content += '  }\n'
    content += '}\n\n'

    // Geometry
    content += 'Geometry: 2001, "Geometry::", "Mesh"  {\n'
    content += '  Vertices: *' + this.extractVertices(object).length + ' {\n'
    content += '    a: ' + this.extractVertices(object).join(',') + '\n'
    content += '  }\n'

    const indices = this.extractIndices(object)
    if (indices.length > 0) {
      content += '  PolygonVertexIndex: *' + indices.length + ' {\n'
      content += '    a: ' + indices.join(',') + '\n'
      content += '  }\n'
    }

    content += '  LayerElementNormal: 0  {\n'
    content += '    Version: 101\n'
    content += '    Name: ""\n'
    content += '    MappingInformationType: "ByVertice"\n'
    content += '    ReferenceInformationType: "Direct"\n'
    content += '  }\n'
    content += '}\n\n'

    // Material
    content += 'Material: 3001, "Material::DefaultMaterial", ""  {\n'
    content += '  Version: 102\n'
    content += '  ShadingModel: "phong"\n'
    content += '  MultiLayer: 0\n'
    content += '  Properties70:  {\n'
    content += '    P: "AmbientColor", "ColorRGB", "Color", "",0,0,0\n'
    content += '    P: "DiffuseColor", "ColorRGB", "Color", "",0.666667,1,0.498039\n'
    content += '    P: "SpecularColor", "ColorRGB", "Color", "",0.5,0.5,0.5\n'
    content += '    P: "TransparencyFactor", "Number", "", "A",0\n'
    content += '  }\n'
    content += '}\n'

    return content
  }

  private extractVertices(object: THREE.Object3D): number[] {
    const vertices: number[] = []

    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry as THREE.BufferGeometry
      const positionAttribute = geometry.getAttribute('position')

      if (positionAttribute) {
        for (let i = 0; i < positionAttribute.count; i++) {
          vertices.push(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i)
          )
        }
      }
    }

    return vertices
  }

  private extractIndices(object: THREE.Object3D): number[] {
    const indices: number[] = []

    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry as THREE.BufferGeometry

      if (geometry.index) {
        const indexAttribute = geometry.index
        for (let i = 0; i < indexAttribute.count; i++) {
          indices.push(indexAttribute.getX(i) as number)
          // FBXの形式では、ポリゴンの最後のインデックスを負にする
          if ((i + 1) % 3 === 0) {
            indices[indices.length - 1] = -(indices[indices.length - 1] as number) - 1
          }
        }
      } else {
        // インデックスがない場合は自動生成
        const positionAttribute = geometry.getAttribute('position')
        if (positionAttribute) {
          for (let i = 0; i < positionAttribute.count; i++) {
            indices.push(i)
            if ((i + 1) % 3 === 0) {
              indices[indices.length - 1] = -(indices[indices.length - 1] as number) - 1
            }
          }
        }
      }
    }

    return indices
  }
}
