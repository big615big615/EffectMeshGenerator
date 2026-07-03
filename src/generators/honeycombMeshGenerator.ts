import * as THREE from 'three'
import type { EffectMeshParams, HoneycombUvMode } from './effectMeshGenerator'
import {
  HONEYCOMB_PARTS_USER_DATA_KEY,
  type HoneycombPartMetadata,
  type HoneycombPartsUserData,
} from './honeycombPartMetadata'

interface HoneycombCell {
  center: THREE.Vector2
  corners: THREE.Vector2[]
}

interface SphericalHoneycombCell {
  center: THREE.Vector3
  corners: THREE.Vector3[]
}

interface PlanarHoneycombAxisBend {
  arcAngle: number
  amount: number
  span: number
}

interface PlanarHoneycombBend {
  yAxis: PlanarHoneycombAxisBend
  xAxis: PlanarHoneycombAxisBend
  xAxisMode: PlanarHoneycombXAxisMode
}

type PlanarHoneycombXAxisMode = 'spherical' | 'axis'
type Triangle = [number, number, number]

const HEX_CORNER_COUNT = 6
const HEX_HEIGHT_SCALE = Math.sqrt(3)
const HONEYCOMB_UV_MODE_LAYOUT: HoneycombUvMode = 'layout'
const HONEYCOMB_FULL_RING_CURVE = 2
const SPHERICAL_UV_REFERENCE_AXES = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 0),
]

export function generateHoneycombPlaneMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const rows = Math.max(1, Math.floor(params.divisions))
  const columns = Math.max(1, Math.floor(params.widthDivisions))
  const targetSize = getHoneycombPlanarSize(params)
  const allCells = createHoneycombCells(
    rows,
    columns,
    targetSize,
    targetSize,
    params.honeycombExtraOffsetRows ?? false
  )
  const cellInset = getHoneycombCellInset(params)
  const uvMode = getHoneycombUvMode(params)
  const planarBend = createPlanarHoneycombBend(
    allCells,
    params,
    shouldCloseHoneycombPlaneRing(params, columns) ? columns : null,
    'spherical'
  )
  const cells = filterRandomHoneycombCells(allCells, params)

  return createHoneycombGeometry(cells, cellInset, uvMode, (point) => mapPlanarHoneycombPoint(point, planarBend))
}

export function generateHoneycombRadialPlaneMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const rings = Math.max(0, Math.floor(params.divisions) - 1)
  const targetSize = getHoneycombPlanarSize(params)
  const allCells = createRadialHoneycombCells(
    rings,
    targetSize,
    targetSize,
    getHoneycombCenterRingRemoval(params)
  )
  const cellInset = getHoneycombCellInset(params)
  const uvMode = getHoneycombUvMode(params)
  const planarBend = createPlanarHoneycombBend(allCells, params, null, 'spherical')
  const cells = filterRandomHoneycombCells(allCells, params)

  return createHoneycombGeometry(cells, cellInset, uvMode, (point) => mapPlanarHoneycombPoint(point, planarBend))
}

export function generateHoneycombSphereMesh(params: EffectMeshParams): THREE.BufferGeometry {
  const frequency = Math.max(2, Math.floor(params.divisions))
  const radius = Math.max(params.length * 0.5, 0.001)
  const sphereMesh = createSubdividedIcosahedron(frequency)
  const cells = filterRandomHoneycombCells(
    clipSphericalHoneycombCellsByY(
      createSphericalDualCells(sphereMesh.vertices, sphereMesh.triangles, radius),
      params
    ),
    params
  )
  const cellInset = getHoneycombCellInset(params)
  const uvMode = getHoneycombUvMode(params)

  return createSphericalHoneycombGeometry(cells, radius, cellInset, uvMode)
}

function clipSphericalHoneycombCellsByY(
  cells: SphericalHoneycombCell[],
  params: EffectMeshParams
): SphericalHoneycombCell[] {
  const clipAmount = THREE.MathUtils.clamp(params.yClip, 0, 1)

  if (clipAmount <= 0.0001 || cells.length <= 1) {
    return cells
  }

  const removeCount = Math.min(
    Math.floor(cells.length * clipAmount),
    cells.length - 1
  )

  if (removeCount <= 0) {
    return cells
  }

  const removedIndices = new Set(
    cells
      .map((cell, index) => ({ index, y: cell.center.y }))
      .sort((a, b) => a.y - b.y)
      .slice(0, removeCount)
      .map(({ index }) => index)
  )

  return cells.filter((_, index) => !removedIndices.has(index))
}

function filterRandomHoneycombCells<T>(cells: T[], params: EffectMeshParams): T[] {
  const removalAmount = THREE.MathUtils.clamp(params.honeycombRandomRemoval ?? 0, 0, 1)

  if (removalAmount <= 0.0001 || cells.length <= 1) {
    return cells
  }

  const removeCount = Math.min(
    Math.floor(cells.length * removalAmount),
    cells.length - 1
  )

  if (removeCount <= 0) {
    return cells
  }

  const removedIndices = new Set(
    cells
      .map((_, index) => ({
        index,
        randomValue: getHoneycombRandomValue(index, params.seed),
      }))
      .sort((a, b) => a.randomValue - b.randomValue)
      .slice(0, removeCount)
      .map(({ index }) => index)
  )

  return cells.filter((_, index) => !removedIndices.has(index))
}

function getHoneycombRandomValue(index: number, seed: number): number {
  const value = Math.sin((index + 1) * 12.9898 + Math.floor(seed) * 78.233) * 43758.5453123
  return value - Math.floor(value)
}

function createHoneycombCells(
  rows: number,
  columns: number,
  targetWidth: number,
  targetHeight: number,
  extraOffsetRows: boolean
): HoneycombCell[] {
  const widthForUnitRadius = 2 + Math.max(0, columns - 1) * 1.5
  const heightForUnitRadius = getHoneycombUnitHeight(rows, columns, extraOffsetRows)
  const radius = Math.max(
    Math.min(targetWidth / widthForUnitRadius, targetHeight / heightForUnitRadius),
    0.001
  )
  const xStep = radius * 1.5
  const yStep = radius * HEX_HEIGHT_SCALE
  const cells: HoneycombCell[] = []

  for (let column = 0; column < columns; column++) {
    const isOffsetColumn = column % 2 === 1
    const columnYOffset = isOffsetColumn ? yStep * 0.5 : 0
    const rowCount = rows + (extraOffsetRows && isOffsetColumn ? 1 : 0)
    const rowStart = extraOffsetRows && isOffsetColumn ? -1 : 0

    for (let row = 0; row < rowCount; row++) {
      const center = new THREE.Vector2(column * xStep, (row + rowStart) * yStep + columnYOffset)
      cells.push({
        center,
        corners: createHexCorners(center, radius),
      })
    }
  }

  centerCells(cells)
  return cells
}

function createRadialHoneycombCells(
  rings: number,
  targetWidth: number,
  targetHeight: number,
  centerRingRemoval: number
): HoneycombCell[] {
  const cells: HoneycombCell[] = []
  const unitRadius = 1
  const startRing = Math.min(centerRingRemoval, rings)

  if (startRing === 0) {
    pushAxialHoneycombCell(cells, 0, 0, unitRadius)
  }

  for (let ring = Math.max(1, startRing); ring <= rings; ring++) {
    let q = -ring
    let r = ring

    getAxialDirections().forEach(([directionQ, directionR]) => {
      for (let step = 0; step < ring; step++) {
        pushAxialHoneycombCell(cells, q, r, unitRadius)
        q += directionQ
        r += directionR
      }
    })
  }

  scaleCellsToBounds(cells, targetWidth, targetHeight)
  centerCells(cells)
  return cells
}

function pushAxialHoneycombCell(
  cells: HoneycombCell[],
  q: number,
  r: number,
  radius: number
): void {
  const center = axialToHoneycombPoint(q, r, radius)
  cells.push({
    center,
    corners: createHexCorners(center, radius),
  })
}

function axialToHoneycombPoint(q: number, r: number, radius: number): THREE.Vector2 {
  return new THREE.Vector2(
    radius * 1.5 * q,
    radius * HEX_HEIGHT_SCALE * (r + q * 0.5)
  )
}

function getAxialDirections(): Array<[number, number]> {
  return [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ]
}

function scaleCellsToBounds(cells: HoneycombCell[], targetWidth: number, targetHeight: number): void {
  const bounds = getCellBounds(cells)
  const size = new THREE.Vector2()
  bounds.getSize(size)
  const scale = Math.max(Math.min(targetWidth / Math.max(size.x, 0.001), targetHeight / Math.max(size.y, 0.001)), 0.001)

  cells.forEach((cell) => {
    cell.center.multiplyScalar(scale)
    cell.corners.forEach((corner) => corner.multiplyScalar(scale))
  })
}

function createPlanarHoneycombBend(
  cells: HoneycombCell[],
  params: EffectMeshParams,
  closedRingColumns: number | null,
  xAxisMode: PlanarHoneycombXAxisMode
): PlanarHoneycombBend {
  const bounds = getCellBounds(cells)
  const size = new THREE.Vector2()
  bounds.getSize(size)
  const closedRingWidth =
    closedRingColumns === null ? null : getClosedHoneycombRingWidth(cells, closedRingColumns)

  return {
    yAxis: createPlanarHoneycombAxisBend(params.curve, closedRingWidth ?? size.x, Math.PI * 2),
    xAxis: createPlanarHoneycombAxisBend(params.honeycombXCurve ?? 0, size.y, Math.PI),
    xAxisMode,
  }
}

function createPlanarHoneycombAxisBend(
  amount: number,
  span: number,
  maxArcAngle: number
): PlanarHoneycombAxisBend {
  const normalizedAmount = THREE.MathUtils.clamp(amount / HONEYCOMB_FULL_RING_CURVE, 0, 1)

  return {
    arcAngle: maxArcAngle * normalizedAmount,
    amount: normalizedAmount,
    span: Math.max(span, 0.001),
  }
}

function shouldCloseHoneycombPlaneRing(params: EffectMeshParams, columns: number): boolean {
  return columns > 1 && columns % 2 === 0 && params.curve >= HONEYCOMB_FULL_RING_CURVE
}

function getClosedHoneycombRingWidth(cells: HoneycombCell[], columns: number): number | null {
  const uniqueCenterX = Array.from(
    new Set(cells.map((cell) => cell.center.x.toFixed(6)))
  )
    .map(Number)
    .sort((a, b) => a - b)

  if (uniqueCenterX.length !== columns) return null

  const pitchSum = uniqueCenterX.slice(1).reduce((sum, centerX, index) => {
    return sum + centerX - uniqueCenterX[index]
  }, 0)
  const pitch = pitchSum / Math.max(uniqueCenterX.length - 1, 1)

  return pitch * columns
}

function mapPlanarHoneycombPoint(
  point: THREE.Vector2,
  bend: PlanarHoneycombBend
): THREE.Vector3 {
  const basePoint = mapPlanarHoneycombYAxisPoint(point, bend.yAxis)

  if (bend.xAxis.amount <= 0.0001) {
    return basePoint
  }

  if (bend.xAxisMode === 'axis') {
    return mapPlanarHoneycombDualAxisPoint(point, bend)
  }

  if (bend.yAxis.arcAngle <= 0.0001) {
    return mapPlanarHoneycombLatitudeOnlyPoint(point, bend.xAxis)
  }

  return basePoint.lerp(
    mapPlanarHoneycombSphericalPoint(point, bend),
    bend.xAxis.amount
  )
}

function mapPlanarHoneycombDualAxisPoint(
  point: THREE.Vector2,
  bend: PlanarHoneycombBend
): THREE.Vector3 {
  const yAxisBend = mapPlanarHoneycombAxisCoordinate(point.x, bend.yAxis)
  const xAxisBend = mapPlanarHoneycombAxisCoordinate(point.y, bend.xAxis)

  return new THREE.Vector3(
    yAxisBend.position,
    xAxisBend.position,
    yAxisBend.depth + xAxisBend.depth
  )
}

function mapPlanarHoneycombYAxisPoint(
  point: THREE.Vector2,
  bend: PlanarHoneycombAxisBend
): THREE.Vector3 {
  const yAxisBend = mapPlanarHoneycombAxisCoordinate(point.x, bend)

  return new THREE.Vector3(
    yAxisBend.position,
    point.y,
    yAxisBend.depth
  )
}

function mapPlanarHoneycombSphericalPoint(
  point: THREE.Vector2,
  bend: PlanarHoneycombBend
): THREE.Vector3 {
  const radius = bend.yAxis.span / bend.yAxis.arcAngle
  const longitude = point.x / radius
  const latitude = getPlanarHoneycombLatitude(point.y, bend.xAxis)
  const horizontalRadius = Math.cos(latitude) * radius

  return new THREE.Vector3(
    Math.sin(longitude) * horizontalRadius,
    Math.sin(latitude) * radius,
    Math.cos(longitude) * horizontalRadius - radius
  )
}

function mapPlanarHoneycombLatitudeOnlyPoint(
  point: THREE.Vector2,
  bend: PlanarHoneycombAxisBend
): THREE.Vector3 {
  const latitude = getPlanarHoneycombLatitude(point.y, bend)
  const radius = bend.span / Math.max(bend.arcAngle, 0.0001)
  const curvedPoint = new THREE.Vector3(
    point.x,
    Math.sin(latitude) * radius,
    (Math.cos(latitude) - 1) * radius
  )

  return new THREE.Vector3(point.x, point.y, 0).lerp(curvedPoint, bend.amount)
}

function getPlanarHoneycombLatitude(value: number, bend: PlanarHoneycombAxisBend): number {
  const normalizedY = THREE.MathUtils.clamp(value / (bend.span * 0.5), -1, 1)
  return normalizedY * bend.arcAngle * 0.5
}

function mapPlanarHoneycombAxisCoordinate(
  value: number,
  bend: PlanarHoneycombAxisBend
): { position: number; depth: number } {
  if (bend.arcAngle <= 0.0001) {
    return { position: value, depth: 0 }
  }

  const radius = bend.span / bend.arcAngle
  const angle = value / radius

  return {
    position: Math.sin(angle) * radius,
    depth: (Math.cos(angle) - 1) * radius,
  }
}

function getHoneycombUnitHeight(rows: number, columns: number, extraOffsetRows: boolean): number {
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (let column = 0; column < columns; column++) {
    const isOffsetColumn = column % 2 === 1
    const columnYOffset = isOffsetColumn ? HEX_HEIGHT_SCALE * 0.5 : 0
    const rowCount = rows + (extraOffsetRows && isOffsetColumn ? 1 : 0)
    const rowStart = extraOffsetRows && isOffsetColumn ? -1 : 0
    minY = Math.min(minY, columnYOffset + rowStart * HEX_HEIGHT_SCALE)
    maxY = Math.max(maxY, columnYOffset + (rowStart + rowCount - 1) * HEX_HEIGHT_SCALE)
  }

  return maxY - minY + HEX_HEIGHT_SCALE
}

function createHexCorners(center: THREE.Vector2, radius: number): THREE.Vector2[] {
  const corners: THREE.Vector2[] = []

  for (let i = 0; i < HEX_CORNER_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / HEX_CORNER_COUNT
    corners.push(
      new THREE.Vector2(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius
      )
    )
  }

  return corners
}

function centerCells(cells: HoneycombCell[]): void {
  const bounds = getCellBounds(cells)
  const offset = new THREE.Vector2(
    (bounds.min.x + bounds.max.x) * -0.5,
    (bounds.min.y + bounds.max.y) * -0.5
  )

  cells.forEach((cell) => {
    cell.center.add(offset)
    cell.corners.forEach((corner) => corner.add(offset))
  })
}

function createHoneycombGeometry(
  cells: HoneycombCell[],
  cellInset: number,
  uvMode: HoneycombUvMode,
  mapVertex: (point: THREE.Vector2) => THREE.Vector3,
  forceOutwardTriangles = false
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const parts: HoneycombPartMetadata[] = []
  const layoutUvBounds =
    uvMode === 'layout' ? getPlanarHoneycombLayoutUvBounds(cells, cellInset) : null

  cells.forEach((cell, id) => {
    const baseIndex = positions.length / 3
    const triangleStart = indices.length / 3
    const displayCorners = cell.corners.map((corner) =>
      corner.clone().lerp(cell.center, cellInset)
    )
    const uvPoints = [cell.center, ...displayCorners]
    const vertices = [mapVertex(cell.center), ...displayCorners.map(mapVertex)]

    vertices.forEach((vertex) => {
      positions.push(vertex.x, vertex.y, vertex.z)
    })

    if (layoutUvBounds) {
      pushPlanarHoneycombLayoutUVs(uvs, uvPoints, layoutUvBounds)
    } else {
      pushHoneycombUVs(uvs, cell.corners.length, uvMode)
    }

    for (let i = 0; i < HEX_CORNER_COUNT; i++) {
      const a = baseIndex
      const b = baseIndex + i + 1
      const c = baseIndex + ((i + 1) % HEX_CORNER_COUNT) + 1

      if (forceOutwardTriangles && isTriangleFacingInward(vertices[0], vertices[i + 1], vertices[((i + 1) % HEX_CORNER_COUNT) + 1])) {
        indices.push(a, c, b)
      } else {
        indices.push(a, b, c)
      }
    }

    parts.push({
      id,
      vertexRanges: [{ start: baseIndex, count: vertices.length }],
      triangleStart,
      triangleCount: HEX_CORNER_COUNT,
      cornerCount: HEX_CORNER_COUNT,
    })
  })

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  setHoneycombPartsUserData(geometry, parts)
  geometry.computeVertexNormals()
  return geometry
}

function createSphericalHoneycombGeometry(
  cells: SphericalHoneycombCell[],
  radius: number,
  cellInset: number,
  uvMode: HoneycombUvMode
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const parts: HoneycombPartMetadata[] = []

  cells.forEach((cell, id) => {
    const baseIndex = positions.length / 3
    const triangleStart = indices.length / 3
    const vertices = [cell.center, ...insetSphericalCorners(cell, radius, cellInset)]

    vertices.forEach((vertex) => {
      positions.push(vertex.x, vertex.y, vertex.z)
    })

    if (uvMode === 'layout') {
      pushSphericalHoneycombLayoutUVs(uvs, vertices)
    } else {
      pushHoneycombUVs(uvs, cell.corners.length, uvMode)
    }

    for (let i = 0; i < cell.corners.length; i++) {
      const a = baseIndex
      const b = baseIndex + i + 1
      const c = baseIndex + ((i + 1) % cell.corners.length) + 1

      if (isTriangleFacingInward(vertices[0], vertices[i + 1], vertices[((i + 1) % cell.corners.length) + 1])) {
        indices.push(a, c, b)
      } else {
        indices.push(a, b, c)
      }
    }

    parts.push({
      id,
      vertexRanges: [{ start: baseIndex, count: vertices.length }],
      triangleStart,
      triangleCount: cell.corners.length,
      cornerCount: cell.corners.length,
    })
  })

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  setHoneycombPartsUserData(geometry, parts)
  geometry.computeVertexNormals()
  return geometry
}

function setHoneycombPartsUserData(
  geometry: THREE.BufferGeometry,
  parts: HoneycombPartMetadata[]
): void {
  const data: HoneycombPartsUserData = {
    version: 1,
    parts,
  }

  geometry.userData[HONEYCOMB_PARTS_USER_DATA_KEY] = data
}

function insetSphericalCorners(
  cell: SphericalHoneycombCell,
  radius: number,
  cellInset: number
): THREE.Vector3[] {
  if (cellInset <= 0) return cell.corners

  const centerDirection = cell.center.clone().normalize()

  return cell.corners.map((corner) =>
    corner
      .clone()
      .normalize()
      .lerp(centerDirection, cellInset)
      .normalize()
      .multiplyScalar(radius)
  )
}

function pushHoneycombUVs(
  uvs: number[],
  cornerCount: number,
  uvMode: HoneycombUvMode
): void {
  if (uvMode === 'polygon') {
    pushRegularPolygonUVs(uvs, cornerCount)
    return
  }

  pushSquareBoundaryPolygonUVs(uvs, cornerCount)
}

function getPlanarHoneycombLayoutUvBounds(
  cells: HoneycombCell[],
  cellInset: number
): THREE.Box2 {
  const bounds = new THREE.Box2()

  cells.forEach((cell) => {
    bounds.expandByPoint(cell.center)
    cell.corners.forEach((corner) => {
      bounds.expandByPoint(corner.clone().lerp(cell.center, cellInset))
    })
  })

  return bounds
}

function pushPlanarHoneycombLayoutUVs(
  uvs: number[],
  points: THREE.Vector2[],
  bounds: THREE.Box2
): void {
  const width = Math.max(bounds.max.x - bounds.min.x, 0.0001)
  const height = Math.max(bounds.max.y - bounds.min.y, 0.0001)

  points.forEach((point) => {
    const u = (point.x - bounds.min.x) / width
    const v = 1 - (point.y - bounds.min.y) / height
    uvs.push(u, v)
  })
}

function pushSphericalHoneycombLayoutUVs(uvs: number[], vertices: THREE.Vector3[]): void {
  const unwrappedUValues = vertices.map((vertex) => getSphericalHoneycombLayoutU(vertex))
  const centerU = unwrappedUValues[0] ?? 0.5

  unwrappedUValues.forEach((u, index) => {
    const vertex = vertices[index]
    const direction = vertex.clone().normalize()
    const latitude = Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1))
    const unwrappedU = unwrapSphericalHoneycombLayoutU(u, centerU)
    const v = 1 - (latitude + Math.PI * 0.5) / Math.PI
    uvs.push(unwrappedU, v)
  })
}

function getSphericalHoneycombLayoutU(vertex: THREE.Vector3): number {
  const direction = vertex.clone().normalize()
  const longitude = Math.atan2(direction.x, direction.z)
  return (longitude + Math.PI) / (Math.PI * 2)
}

function unwrapSphericalHoneycombLayoutU(u: number, centerU: number): number {
  let unwrappedU = u

  if (unwrappedU - centerU > 0.5) {
    unwrappedU -= 1
  } else if (unwrappedU - centerU < -0.5) {
    unwrappedU += 1
  }

  return unwrappedU
}

function pushRegularPolygonUVs(uvs: number[], cornerCount: number): void {
  uvs.push(0.5, 0.5)

  for (let i = 0; i < cornerCount; i++) {
    const angle = (Math.PI * 2 * i) / cornerCount
    uvs.push(Math.cos(angle) * 0.5 + 0.5, 0.5 - Math.sin(angle) * 0.5)
  }
}

function pushSquareBoundaryPolygonUVs(uvs: number[], cornerCount: number): void {
  uvs.push(0.5, 0.5)

  getSquareBoundaryPolygonUVs(cornerCount).forEach(([u, v]) => {
    uvs.push(u, v)
  })
}

function getSquareBoundaryPolygonUVs(cornerCount: number): Array<[number, number]> {
  if (cornerCount === 5) {
    return [
      [1, 0.5],
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ]
  }

  if (cornerCount === 6) {
    return [
      [1, 0.5],
      [1, 0],
      [0, 0],
      [0, 0.5],
      [0, 1],
      [1, 1],
    ]
  }

  return Array.from({ length: cornerCount }, (_, index) => {
    const distance = (index / Math.max(cornerCount, 1)) * 4

    if (distance < 1) return [1 - distance, 0]
    if (distance < 2) return [0, distance - 1]
    if (distance < 3) return [distance - 2, 1]
    return [1, 4 - distance]
  })
}

function createSubdividedIcosahedron(frequency: number): {
  vertices: THREE.Vector3[]
  triangles: Triangle[]
} {
  const baseVertices = createIcosahedronVertices()
  const baseTriangles = createIcosahedronTriangles()
  const vertices: THREE.Vector3[] = []
  const vertexIndexByKey = new Map<string, number>()
  const triangles: Triangle[] = []

  const getVertexIndex = (vertex: THREE.Vector3): number => {
    const normalizedVertex = vertex.clone().normalize()
    const key = createVertexKey(normalizedVertex)
    const existingIndex = vertexIndexByKey.get(key)

    if (existingIndex !== undefined) {
      return existingIndex
    }

    const index = vertices.length
    vertices.push(normalizedVertex)
    vertexIndexByKey.set(key, index)
    return index
  }

  baseTriangles.forEach(([aIndex, bIndex, cIndex]) => {
    const faceGrid = new Map<string, number>()
    const a = baseVertices[aIndex]
    const b = baseVertices[bIndex]
    const c = baseVertices[cIndex]

    for (let i = 0; i <= frequency; i++) {
      for (let j = 0; j <= frequency - i; j++) {
        const vertex = new THREE.Vector3()
          .addScaledVector(a, frequency - i - j)
          .addScaledVector(b, i)
          .addScaledVector(c, j)
          .multiplyScalar(1 / frequency)
        faceGrid.set(createFaceGridKey(i, j), getVertexIndex(vertex))
      }
    }

    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        pushOutwardTriangle(
          triangles,
          vertices,
          getFaceGridIndex(faceGrid, i, j),
          getFaceGridIndex(faceGrid, i + 1, j),
          getFaceGridIndex(faceGrid, i, j + 1)
        )

        if (j < frequency - i - 1) {
          pushOutwardTriangle(
            triangles,
            vertices,
            getFaceGridIndex(faceGrid, i + 1, j),
            getFaceGridIndex(faceGrid, i + 1, j + 1),
            getFaceGridIndex(faceGrid, i, j + 1)
          )
        }
      }
    }
  })

  return { vertices, triangles }
}

function createSphericalDualCells(
  vertices: THREE.Vector3[],
  triangles: Triangle[],
  radius: number
): SphericalHoneycombCell[] {
  const triangleCenters = triangles.map((triangle) =>
    new THREE.Vector3()
      .add(vertices[triangle[0]])
      .add(vertices[triangle[1]])
      .add(vertices[triangle[2]])
      .normalize()
      .multiplyScalar(radius)
  )
  const triangleIndicesByVertex = new Map<number, number[]>()

  triangles.forEach((triangle, triangleIndex) => {
    triangle.forEach((vertexIndex) => {
      const triangleIndices = triangleIndicesByVertex.get(vertexIndex) ?? []
      triangleIndices.push(triangleIndex)
      triangleIndicesByVertex.set(vertexIndex, triangleIndices)
    })
  })

  return vertices.map((vertex, vertexIndex) => {
    const normal = vertex.clone().normalize()
    const center = normal.clone().multiplyScalar(radius)
    const triangleIndices = triangleIndicesByVertex.get(vertexIndex) ?? []
    const corners = sortSphericalCellCorners(
      normal,
      triangleIndices.map((triangleIndex) => triangleCenters[triangleIndex])
    )

    return { center, corners }
  })
}

function sortSphericalCellCorners(normal: THREE.Vector3, corners: THREE.Vector3[]): THREE.Vector3[] {
  const reference = getSphericalUvReference(normal)
  const bitangent = new THREE.Vector3().crossVectors(normal, reference).normalize()

  const sortedCorners = [...corners].sort((a, b) => {
    const tangentA = a.clone().projectOnPlane(normal).normalize()
    const tangentB = b.clone().projectOnPlane(normal).normalize()
    const angleA = getPositiveAngle(tangentA, reference, bitangent)
    const angleB = getPositiveAngle(tangentB, reference, bitangent)
    return angleA - angleB
  })

  return rotateCornersToWorldTopEdge(sortedCorners)
}

function rotateCornersToWorldTopEdge(corners: THREE.Vector3[]): THREE.Vector3[] {
  if (corners.length < 3) return corners

  let topEdgeIndex = 0
  let topEdgeY = Number.NEGATIVE_INFINITY

  for (let i = 0; i < corners.length; i++) {
    const nextIndex = (i + 1) % corners.length
    const edgeY = (corners[i].y + corners[nextIndex].y) * 0.5

    if (edgeY > topEdgeY) {
      topEdgeY = edgeY
      topEdgeIndex = i
    }
  }

  const shift = topEdgeIndex - 1
  return corners.map((_, index) => {
    const sourceIndex = (index + shift + corners.length) % corners.length
    return corners[sourceIndex]
  })
}

function getSphericalUvReference(normal: THREE.Vector3): THREE.Vector3 {
  let bestReference = new THREE.Vector3(1, 0, 0)
  let bestLengthSq = 0

  SPHERICAL_UV_REFERENCE_AXES.forEach((axis) => {
    const projectedAxis = axis.clone().projectOnPlane(normal)
    const lengthSq = projectedAxis.lengthSq()

    if (lengthSq > bestLengthSq) {
      bestReference = projectedAxis
      bestLengthSq = lengthSq
    }
  })

  return bestReference.normalize()
}

function getPositiveAngle(
  tangent: THREE.Vector3,
  reference: THREE.Vector3,
  bitangent: THREE.Vector3
): number {
  const angle = Math.atan2(tangent.dot(bitangent), tangent.dot(reference))
  return angle < 0 ? angle + Math.PI * 2 : angle
}

function pushOutwardTriangle(
  triangles: Triangle[],
  vertices: THREE.Vector3[],
  a: number,
  b: number,
  c: number
): void {
  if (isTriangleFacingInward(vertices[a], vertices[b], vertices[c])) {
    triangles.push([a, c, b])
  } else {
    triangles.push([a, b, c])
  }
}

function createIcosahedronVertices(): THREE.Vector3[] {
  const t = (1 + Math.sqrt(5)) / 2

  return [
    new THREE.Vector3(-1, t, 0),
    new THREE.Vector3(1, t, 0),
    new THREE.Vector3(-1, -t, 0),
    new THREE.Vector3(1, -t, 0),
    new THREE.Vector3(0, -1, t),
    new THREE.Vector3(0, 1, t),
    new THREE.Vector3(0, -1, -t),
    new THREE.Vector3(0, 1, -t),
    new THREE.Vector3(t, 0, -1),
    new THREE.Vector3(t, 0, 1),
    new THREE.Vector3(-t, 0, -1),
    new THREE.Vector3(-t, 0, 1),
  ].map((vertex) => vertex.normalize())
}

function createIcosahedronTriangles(): Triangle[] {
  return [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ]
}

function getFaceGridIndex(faceGrid: Map<string, number>, i: number, j: number): number {
  const index = faceGrid.get(createFaceGridKey(i, j))

  if (index === undefined) {
    throw new Error(`Missing honeycomb sphere grid vertex at ${i}, ${j}`)
  }

  return index
}

function createFaceGridKey(i: number, j: number): string {
  return `${i}:${j}`
}

function createVertexKey(vertex: THREE.Vector3): string {
  return `${vertex.x.toFixed(8)}:${vertex.y.toFixed(8)}:${vertex.z.toFixed(8)}`
}

function getHoneycombCellInset(params: EffectMeshParams): number {
  return THREE.MathUtils.clamp(params.spread, 0, 0.75)
}

function getHoneycombPlanarSize(params: EffectMeshParams): number {
  return Math.max(params.length, 0.001)
}

function getHoneycombUvMode(params: EffectMeshParams): HoneycombUvMode {
  return params.honeycombUvMode ?? HONEYCOMB_UV_MODE_LAYOUT
}

function getHoneycombCenterRingRemoval(params: EffectMeshParams): number {
  return Math.max(0, Math.floor(params.honeycombCenterRingRemoval ?? 0))
}

function getCellBounds(cells: HoneycombCell[]): THREE.Box2 {
  const bounds = new THREE.Box2()

  cells.forEach((cell) => {
    bounds.expandByPoint(cell.center)
    cell.corners.forEach((corner) => bounds.expandByPoint(corner))
  })

  return bounds
}

function isTriangleFacingInward(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): boolean {
  const normal = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a))
  const centroid = new THREE.Vector3().addVectors(a, b).add(c).multiplyScalar(1 / 3)
  return normal.dot(centroid) < 0
}
