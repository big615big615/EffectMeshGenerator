export const HONEYCOMB_PARTS_USER_DATA_KEY = 'honeycombParts'

export interface HoneycombPartVertexRange {
  start: number
  count: number
}

export interface HoneycombPartMetadata {
  id: number
  vertexRanges: HoneycombPartVertexRange[]
  triangleStart: number
  triangleCount: number
  cornerCount: number
}

export interface HoneycombPartsUserData {
  version: 1
  parts: HoneycombPartMetadata[]
}

export function getHoneycombPartsUserData(userData: Record<string, unknown>): HoneycombPartsUserData | null {
  const value = userData[HONEYCOMB_PARTS_USER_DATA_KEY]
  if (!isHoneycombPartsUserData(value)) {
    return null
  }

  return value
}

export function isHoneycombPartsUserData(value: unknown): value is HoneycombPartsUserData {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<HoneycombPartsUserData>
  return candidate.version === 1 && Array.isArray(candidate.parts)
}
