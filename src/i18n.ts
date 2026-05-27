import type { EffectMeshType } from './generators/effectMeshGenerator'

export type Language = 'ja' | 'en'

type MeshTypeLabels = Record<EffectMeshType, string>

export interface UiText {
  language: string
  japanese: string
  english: string
  panelTitle: string
  meshType: string
  divisions: string
  widthDivisions: string
  thickness: string
  length: string
  curve: string
  topCurve: string
  taper: string
  spread: string
  twist: string
  waveCount: string
  seed: string
  cylinderDivisions: string
  cylinderScale: string
  yClip: string
  wireframe: string
  showUV: string
  texture3D: string
  uvScroll: string
  reset: string
  texture: string
  chooseImage: string
  checker: string
  uvRotate: string
  mirrorZ: string
  polygonCount: string
  show: string
  on: string
  off: string
  pivot: string
  pivotPosition: string
  scale: string
  rotation: string
  dragToAdjust: string
  export: string
  status: string
  ready: string
  loading: string
  exportWaiting: string
  exportFailed: string
  unknownError: string
  exporting: string
  degrees: string
  triangles: string
  downloadAsFBX: string
  downloadAsGLB: string
  downloadAsGLTF: string
  downloadAsOBJ: string
  meshTypes: MeshTypeLabels
}

const meshTypesEn: MeshTypeLabels = {
  slash: 'Slash / Crescent',
  ribbon: 'Ribbon / Trail',
  lightningRibbon: 'Lightning Ribbon / Bolt',
  arc: 'Arc / Ring Segment',
  spiral: 'Spiral',
  risingSpiralRibbon: 'Rising Spiral Ribbon / Tornado',
  cylinderSpiralRibbon: 'Cylinder Spiral Ribbon / Tornado',
  burst: 'Burst',
  plane: 'Plane / Quad',
  flatRing: 'Flat Ring',
  sphere: 'Sphere',
  hemisphere: 'Hemisphere',
  zHemisphere: 'Z Hemisphere',
  openCylinder: 'Cylinder / No Caps',
  beamDome: 'Beam / Dome Cap',
}

const meshTypesJa: MeshTypeLabels = {
  slash: 'スラッシュ / 三日月',
  ribbon: 'リボン / 軌跡',
  lightningRibbon: 'ライトニングリボン / 稲妻',
  arc: '円弧 / リング断片',
  spiral: 'スパイラル',
  risingSpiralRibbon: '上昇スパイラルリボン / 竜巻',
  cylinderSpiralRibbon: '円柱スパイラルリボン / 竜巻',
  burst: 'バースト',
  plane: '平面 / 四角形',
  flatRing: 'フラットリング',
  sphere: '球',
  hemisphere: '半球',
  zHemisphere: 'Z半球',
  openCylinder: '円柱 / キャップなし',
  beamDome: 'ビーム / ドームキャップ',
}

export const uiText: Record<Language, UiText> = {
  ja: {
    language: '言語',
    japanese: '日本語',
    english: 'English',
    panelTitle: 'メッシュ設定',
    meshType: 'メッシュタイプ',
    divisions: '分割数',
    widthDivisions: '幅方向の分割数',
    thickness: '厚み',
    length: '長さ',
    curve: '曲線強度',
    topCurve: '上方向の曲線',
    taper: 'テーパー',
    spread: '広がり',
    twist: 'ねじれ',
    waveCount: '波数',
    seed: 'シード',
    cylinderDivisions: '円柱分割数',
    cylinderScale: '円柱スケール',
    yClip: 'Yクリップ',
    wireframe: 'ワイヤーフレーム',
    showUV: 'UV表示',
    texture3D: '3Dテクスチャ',
    uvScroll: 'UVスクロール',
    reset: 'リセット',
    texture: 'テクスチャ',
    chooseImage: '画像を選択',
    checker: 'チェッカー',
    uvRotate: 'UV回転',
    mirrorZ: 'Zミラー',
    polygonCount: 'ポリゴン数',
    show: '表示',
    on: 'オン',
    off: 'オフ',
    pivot: 'ピボット',
    pivotPosition: 'ピボット位置',
    scale: 'スケール',
    rotation: '回転',
    dragToAdjust: '左右にドラッグして調整',
    export: 'エクスポート',
    status: '状態',
    ready: '準備完了',
    loading: '読み込み中...',
    exportWaiting: 'メッシュの生成待機中です',
    exportFailed: 'エクスポート失敗',
    unknownError: '不明なエラー',
    exporting: 'エクスポート中...',
    degrees: '度',
    triangles: '三角形',
    downloadAsFBX: 'FBX形式でダウンロード (Maya, 3DS Max, MotionBuilder対応)',
    downloadAsGLB: 'GLB形式でダウンロード (Unity, UE5推奨)',
    downloadAsGLTF: 'GLTF形式でダウンロード (JSON形式)',
    downloadAsOBJ: 'OBJ形式でダウンロード (汎用フォーマット)',
    meshTypes: meshTypesJa,
  },
  en: {
    language: 'Language',
    japanese: 'Japanese',
    english: 'English',
    panelTitle: 'Mesh Settings',
    meshType: 'Mesh Type',
    divisions: 'Divisions',
    widthDivisions: 'Width Divisions',
    thickness: 'Thickness',
    length: 'Length',
    curve: 'Curve Strength',
    topCurve: 'Top Curve',
    taper: 'Taper',
    spread: 'Spread',
    twist: 'Twist',
    waveCount: 'Wave Count',
    seed: 'Seed',
    cylinderDivisions: 'Cylinder Divisions',
    cylinderScale: 'Cylinder Scale',
    yClip: 'Y Clip',
    wireframe: 'Wireframe',
    showUV: 'Show UV',
    texture3D: '3D Texture',
    uvScroll: 'UV Scroll',
    reset: 'Reset',
    texture: 'Texture',
    chooseImage: 'Choose Image',
    checker: 'Checker',
    uvRotate: 'UV Rotate',
    mirrorZ: 'Mirror Z',
    polygonCount: 'Polygon Count',
    show: 'Show',
    on: 'ON',
    off: 'OFF',
    pivot: 'Pivot',
    pivotPosition: 'Pivot Position',
    scale: 'Scale',
    rotation: 'Rotation',
    dragToAdjust: 'Drag horizontally to adjust',
    export: 'Export',
    status: 'Status',
    ready: 'Ready',
    loading: 'Loading...',
    exportWaiting: 'Waiting for mesh generation',
    exportFailed: 'Export failed',
    unknownError: 'Unknown error',
    exporting: 'Exporting...',
    degrees: 'deg',
    triangles: 'tris',
    downloadAsFBX: 'Download as FBX (Maya, 3DS Max, MotionBuilder)',
    downloadAsGLB: 'Download as GLB (recommended for Unity, UE5)',
    downloadAsGLTF: 'Download as GLTF (JSON format)',
    downloadAsOBJ: 'Download as OBJ (general format)',
    meshTypes: meshTypesEn,
  },
}
