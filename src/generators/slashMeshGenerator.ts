import * as THREE from 'three'

export function generateSlashMesh(
  divisions: number,
  thickness: number,
  length: number,
  curve: number
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()

  // Create the curve path using Catmull-Rom spline
  const points: THREE.Vector3[] = []

  // Define control points for the slash curve
  const controlPoints = [
    new THREE.Vector3(0, -length / 2, 0),
    new THREE.Vector3(0, -length / 4, curve),
    new THREE.Vector3(0, length / 4, curve),
    new THREE.Vector3(0, length / 2, 0),
  ]

  const curve3D = new THREE.CatmullRomCurve3(controlPoints)

  // Sample points along the curve
  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions
    const point = curve3D.getPoint(t)
    points.push(point)
  }

  // Create vertices and indices for the ribbon geometry
  const vertices: number[] = []
  const indices: number[] = []

  // For each point on the curve, create two vertices (top and bottom of the ribbon)
  for (let i = 0; i < points.length; i++) {
    const point = points[i]

    // Get tangent to curve for perpendicular direction
    const tangent = curve3D.getTangent(i / divisions).normalize()

    // Create perpendicular vector (up direction for ribbon width)
    const perpendicular = new THREE.Vector3(0, 0, 1)
      .cross(tangent)
      .normalize()
      .multiplyScalar(thickness / 2)

    // Top vertex
    const topVertex = point.clone().add(perpendicular)
    vertices.push(topVertex.x, topVertex.y, topVertex.z)

    // Bottom vertex
    const bottomVertex = point.clone().sub(perpendicular)
    vertices.push(bottomVertex.x, bottomVertex.y, bottomVertex.z)
  }

  // Create indices for triangles
  for (let i = 0; i < divisions; i++) {
    const base = i * 2

    // First triangle
    indices.push(base, base + 1, base + 2)
    // Second triangle
    indices.push(base + 1, base + 3, base + 2)
  }

  // Create UV coordinates for the ribbon
  const uvs: number[] = []

  for (let i = 0; i < points.length; i++) {
    const t = i / divisions
    uvs.push(t, 0)
    uvs.push(t, 1)
  }

  // Set geometry attributes
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))

  // Compute normals for proper lighting
  geometry.computeVertexNormals()

  return geometry
}
