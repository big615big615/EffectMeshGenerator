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
  hemisphereDivisions: string
  widthDivisions: string
  thickness: string
  length: string
  size: string
  curve: string
  topCurve: string
  taper: string
  taperStart: string
  taperEnd: string
  taperBottom: string
  taperTop: string
  spread: string
  honeycombGap: string
  honeycombYCurve: string
  honeycombXCurve: string
  honeycombRandomRemoval: string
  honeycombRandomSeed: string
  honeycombUvMode: string
  honeycombUvSquare: string
  honeycombUvPolygon: string
  honeycombUvLayout: string
  honeycombExtraOffsetRows: string
  honeycombCenterRingRemoval: string
  bottomSpread: string
  vertexAlpha: string
  vertexAlphaTop: string
  vertexAlphaBottom: string
  vertexAlphaRange: string
  vertexAlphaTopRange: string
  vertexAlphaBottomRange: string
  vertexAlphaStrength: string
  vertexAlphaRangeShort: string
  vertexAlphaSideTop: string
  vertexAlphaSideBottom: string
  vertexAlphaSideStart: string
  vertexAlphaSideEnd: string
  vertexAlphaSideOuter: string
  vertexAlphaSideInner: string
  vertexAlphaSideTip: string
  vertexAlphaSideTail: string
  spreadStart: string
  spreadEnd: string
  twist: string
  wave: string
  waveCount: string
  waveCountX: string
  waveCountY: string
  waveHeight: string
  waveHeightX: string
  waveHeightY: string
  seed: string
  seedX: string
  seedY: string
  cylinderDivisions: string
  cylinderScale: string
  beamEndCap: string
  yClip: string
  wireframe: string
  showUV: string
  texture3D: string
  uvScroll: string
  autoRotateY: string
  autoRotateYSpeed: string
  meshTypeGrid: string
  thumbnailSelect: string
  thumbnailRotationExport: string
  thumbnailRotationCopied: string
  thumbnailRotationLogged: string
  reset: string
  texture: string
  textureTiling: string
  chooseImage: string
  checker: string
  uvRotate: string
  mirrorZ: string
  doubleSided: string
  crossMesh: string
  polygonCount: string
  show: string
  on: string
  off: string
  pivot: string
  pivotPosition: string
  pivotToBoundsCenter: string
  pivotSnapToVertex: string
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
  usageAndPrivacy: string
  close: string
  usageTermsTitle: string
  outputLicenseTitle: string
  outputLicenseBody: string
  attributionTitle: string
  attributionBody: string
  appLicenseTitle: string
  appLicenseBody: string
  privacyTitle: string
  privacyBody: string
  repositoryTitle: string
  repositoryBody: string
  repositoryLink: string
  contactTitle: string
  contactBody: string
  contactLink: string
  meshTypes: MeshTypeLabels
}

const meshTypesEn: MeshTypeLabels = {
  slash: 'Slash / Straight',
  ribbon: 'Ribbon / Wave',
  lightningRibbon: 'Ribbon / Lightning',
  arc: 'Slash / Arc',
  arcRibbon: 'Ribbon / Curve',
  spiral: 'Spiral',
  risingSpiralRibbon: 'Tornado / Ribbon',
  cylinderSpiralRibbon: 'Tornado / Cylinder',
  burst: 'Burst',
  plane: 'Plane',
  honeycombPlane: 'Honeycomb Plane',
  honeycombRadialPlane: 'Honeycomb Radial Plane',
  honeycombSphere: 'Honeycomb Sphere',
  flatRing: 'Ring',
  sphere: 'Sphere',
  hemisphere: 'Hemisphere Y',
  zHemisphere: 'Hemisphere Z',
  openCylinder: 'Shockwave / Cylinder',
  beamDome: 'Beam',
}

const meshTypesJa: MeshTypeLabels = {
  slash: 'スラッシュ / 三日月',
  ribbon: 'リボン / 軌跡',
  lightningRibbon: 'ライトニングリボン / 稲妻',
  arc: '円弧 / リング断片',
  arcRibbon: 'リボン/カーブ',
  spiral: 'スパイラル',
  risingSpiralRibbon: '上昇スパイラルリボン / 竜巻',
  cylinderSpiralRibbon: '円柱スパイラルリボン / 竜巻',
  burst: 'バースト',
  plane: '平面 / 四角形',
  honeycombPlane: 'ハニカム / 平面',
  honeycombRadialPlane: 'ハニカム / 放射平面',
  honeycombSphere: 'ハニカム / 球面',
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
    divisions: '分割数 X',
    hemisphereDivisions: '分割数/半球',
    widthDivisions: '分割数 Y',
    thickness: '幅',
    length: '長さ',
    size: '大きさ',
    curve: 'カーブ',
    topCurve: 'ふくらみ',
    taper: 'テーパー',
    taperStart: 'テーパー 始点',
    taperEnd: 'テーパー 終点',
    taperBottom: 'テーパー 下部',
    taperTop: 'テーパー 上部',
    spread: '広がり',
    honeycombGap: '隙間',
    honeycombYCurve: 'Y軸カーブ',
    honeycombXCurve: 'X軸カーブ',
    honeycombRandomRemoval: 'ランダム削除',
    honeycombRandomSeed: 'ランダムシード',
    honeycombUvMode: 'UV形状',
    honeycombUvSquare: '四角',
    honeycombUvPolygon: '六角形',
    honeycombUvLayout: '全体配置',
    honeycombExtraOffsetRows: '偶数列+1',
    honeycombCenterRingRemoval: '中心リング削除',
    bottomSpread: '下部広がり',
    vertexAlpha: '頂点アルファ',
    vertexAlphaTop: '強度 上部',
    vertexAlphaBottom: '強度 下部',
    vertexAlphaRange: '頂点アルファ 範囲',
    vertexAlphaTopRange: '範囲 上部',
    vertexAlphaBottomRange: '範囲 下部',
    vertexAlphaStrength: '強度',
    vertexAlphaRangeShort: '範囲',
    vertexAlphaSideTop: '上部',
    vertexAlphaSideBottom: '下部',
    vertexAlphaSideStart: '始点',
    vertexAlphaSideEnd: '終点',
    vertexAlphaSideOuter: '外周',
    vertexAlphaSideInner: '内周',
    vertexAlphaSideTip: '先端',
    vertexAlphaSideTail: '終端',
    spreadStart: '広がり 下部',
    spreadEnd: '広がり 上部',
    twist: 'ねじれ',
    wave: '波',
    waveCount: '波数',
    waveCountX: '波数 X',
    waveCountY: '波数 Y',
    waveHeight: '波の高さ',
    waveHeightX: '波の高さ X',
    waveHeightY: '波の高さ Y',
    seed: 'シード',
    seedX: 'シード X',
    seedY: 'シード Y',
    cylinderDivisions: '分割数/円柱',
    cylinderScale: '円柱スケール',
    beamEndCap: '先端を閉じる',
    yClip: 'Yクリップ',
    wireframe: 'ワイヤーフレーム',
    showUV: 'UV表示',
    texture3D: 'テクスチャ表示',
    uvScroll: 'UVスクロール',
    autoRotateY: '撮影用Y回転',
    autoRotateYSpeed: 'Y回転速度',
    meshTypeGrid: 'サムネイルグリッド',
    thumbnailSelect: 'サムネイル選択',
    thumbnailRotationExport: '角度を出力',
    thumbnailRotationCopied: 'コピーしました',
    thumbnailRotationLogged: 'コンソールへ出力しました',
    reset: 'リセット',
    texture: 'テクスチャ',
    textureTiling: 'タイリング',
    chooseImage: '画像を選択',
    checker: 'チェッカー',
    uvRotate: 'UV回転',
    mirrorZ: 'Zミラー',
    doubleSided: '両面',
    crossMesh: 'クロスメッシュ',
    polygonCount: 'ポリゴン数',
    show: '表示',
    on: 'オン',
    off: 'オフ',
    pivot: 'ピボット',
    pivotPosition: 'ピボット位置',
    pivotToBoundsCenter: '中心へ',
    pivotSnapToVertex: 'スナップ',
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
    usageAndPrivacy: '利用条件 / Privacy',
    close: '閉じる',
    usageTermsTitle: '利用条件とプライバシー',
    outputLicenseTitle: '生成メッシュの利用',
    outputLicenseBody:
      'このツールで生成・エクスポートしたメッシュは、個人制作、商用作品、ゲーム、映像、アセット制作などで自由に利用できます。',
    attributionTitle: 'クレジット表記',
    attributionBody:
      '生成メッシュの利用にあたってクレジット表記は不要です。もし可能であれば Effect Mesh Generator の名前やリンクを添えてもらえると嬉しいです。',
    appLicenseTitle: 'アプリ本体のライセンス',
    appLicenseBody:
      'アプリ本体のソースコードは MIT License です。ソースコードをコピー、改変、再配布する場合は、著作権表示とライセンス文を残してください。',
    privacyTitle: 'テクスチャとデータ',
    privacyBody:
      '選択したテクスチャ画像と生成メッシュはブラウザ内で処理されます。このアプリは画像やメッシュデータをサーバーへ保存・送信しません。',
    repositoryTitle: 'GitHub リポジトリ',
    repositoryBody:
      'ソースコード、README、利用条件、更新履歴は GitHub リポジトリで確認できます。',
    repositoryLink: 'GitHub リポジトリを開く',
    contactTitle: '問い合わせ',
    contactBody:
      '不具合、要望、利用条件についての相談はお問い合わせフォームから連絡してください。返信が必要な場合は、フォーム内にメールアドレスなどの連絡先を任意で記載してください。',
    contactLink: 'お問い合わせフォームを開く',
    meshTypes: {
      ...meshTypesJa,
      slash: 'スラッシュ/直線',
      ribbon: 'リボン/波型',
      lightningRibbon: 'リボン/稲妻',
      arc: 'スラッシュ/円弧',
      arcRibbon: 'リボン/カーブ',
      risingSpiralRibbon: '竜巻/リボン',
      cylinderSpiralRibbon: '竜巻/円柱',
      plane: '平面',
      honeycombPlane: 'ハニカム/平面',
      honeycombRadialPlane: 'ハニカム/放射',
      honeycombSphere: 'ハニカム/球面',
      flatRing: 'リング',
      hemisphere: '半球Y',
      zHemisphere: '半球Z',
      openCylinder: '衝撃波/円柱',
      beamDome: 'ビーム',
    },
  },
  en: {
    language: 'Language',
    japanese: 'Japanese',
    english: 'English',
    panelTitle: 'Mesh Settings',
    meshType: 'Mesh Type',
    divisions: 'Divisions X',
    hemisphereDivisions: 'Divisions / Hemisphere',
    widthDivisions: 'Divisions Y',
    thickness: 'Width',
    length: 'Length',
    size: 'Size',
    curve: 'Curve',
    topCurve: 'Bulge',
    taper: 'Taper',
    taperStart: 'Taper Start',
    taperEnd: 'Taper End',
    taperBottom: 'Taper Bottom',
    taperTop: 'Taper Top',
    spread: 'Spread',
    honeycombGap: 'Gap',
    honeycombYCurve: 'Y Axis Curve',
    honeycombXCurve: 'X Axis Curve',
    honeycombRandomRemoval: 'Random Removal',
    honeycombRandomSeed: 'Random Seed',
    honeycombUvMode: 'UV Shape',
    honeycombUvSquare: 'Square',
    honeycombUvPolygon: 'Hexagon',
    honeycombUvLayout: 'Layout',
    honeycombExtraOffsetRows: 'Even Columns +1',
    honeycombCenterRingRemoval: 'Remove Center Rings',
    bottomSpread: 'Bottom Spread',
    vertexAlpha: 'Vertex Alpha',
    vertexAlphaTop: 'Strength Top',
    vertexAlphaBottom: 'Strength Bottom',
    vertexAlphaRange: 'Vertex Alpha Range',
    vertexAlphaTopRange: 'Range Top',
    vertexAlphaBottomRange: 'Range Bottom',
    vertexAlphaStrength: 'Strength',
    vertexAlphaRangeShort: 'Range',
    vertexAlphaSideTop: 'Top',
    vertexAlphaSideBottom: 'Bottom',
    vertexAlphaSideStart: 'Start',
    vertexAlphaSideEnd: 'End',
    vertexAlphaSideOuter: 'Outer',
    vertexAlphaSideInner: 'Inner',
    vertexAlphaSideTip: 'Tip',
    vertexAlphaSideTail: 'Tail',
    spreadStart: 'Spread Bottom',
    spreadEnd: 'Spread Top',
    twist: 'Twist',
    wave: 'Wave',
    waveCount: 'Wave Count',
    waveCountX: 'Wave Count X',
    waveCountY: 'Wave Count Y',
    waveHeight: 'Wave Height',
    waveHeightX: 'Wave Height X',
    waveHeightY: 'Wave Height Y',
    seed: 'Seed',
    seedX: 'Seed X',
    seedY: 'Seed Y',
    cylinderDivisions: 'Divisions / Cylinder',
    cylinderScale: 'Cylinder Scale',
    beamEndCap: 'Close Tip',
    yClip: 'Y Clip',
    wireframe: 'Wireframe',
    showUV: 'Show UV',
    texture3D: 'Texture Display',
    uvScroll: 'UV Scroll',
    autoRotateY: 'Y Auto Rotate',
    autoRotateYSpeed: 'Y Rotation Speed',
    meshTypeGrid: 'Thumbnail Grid',
    thumbnailSelect: 'Thumbnail Select',
    thumbnailRotationExport: 'Export Angles',
    thumbnailRotationCopied: 'Copied',
    thumbnailRotationLogged: 'Logged to console',
    reset: 'Reset',
    texture: 'Texture',
    textureTiling: 'Tiling',
    chooseImage: 'Choose Image',
    checker: 'Checker',
    uvRotate: 'UV Rotate',
    mirrorZ: 'Mirror Z',
    doubleSided: 'Double Sided',
    crossMesh: 'Cross Mesh',
    polygonCount: 'Polygon Count',
    show: 'Show',
    on: 'ON',
    off: 'OFF',
    pivot: 'Pivot',
    pivotPosition: 'Pivot Position',
    pivotToBoundsCenter: 'Center',
    pivotSnapToVertex: 'Snap',
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
    usageAndPrivacy: 'Usage / Privacy',
    close: 'Close',
    usageTermsTitle: 'Usage Terms and Privacy',
    outputLicenseTitle: 'Generated Meshes',
    outputLicenseBody:
      'Meshes generated and exported with this tool may be used freely in personal projects, commercial works, games, videos, and asset production.',
    attributionTitle: 'Attribution',
    attributionBody:
      'Attribution is not required for generated meshes. Credit or a link to Effect Mesh Generator is appreciated when practical.',
    appLicenseTitle: 'Application License',
    appLicenseBody:
      'The application source code is licensed under the MIT License. If you redistribute the source code, follow the LICENSE terms.',
    privacyTitle: 'Textures and Data',
    privacyBody:
      'Selected texture images and generated meshes are processed in your browser. This app does not save or upload images or mesh data to a server.',
    repositoryTitle: 'GitHub Repository',
    repositoryBody:
      'Source code, README, usage terms, and update history are available in the GitHub repository.',
    repositoryLink: 'Open GitHub Repository',
    contactTitle: 'Contact',
    contactBody:
      'For bugs, requests, or questions about usage terms, please use the contact form. If you need a reply, optionally include an email address or other contact information in the form.',
    contactLink: 'Open Contact Form',
    meshTypes: meshTypesEn,
  },
}
