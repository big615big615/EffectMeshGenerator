# Effect Mesh Generator

Unity などのリアルタイム VFX 制作用に、スラッシュ、リボン、リング、球面、ビームなどのエフェクト用メッシュをブラウザ上で生成する React + Vite + Three.js ツールです。

## Web App

ブラウザで開いてすぐ使えます。

https://big615big615.github.io/EffetMeshGenerator/

## Features

- リアルタイム 3D プレビュー
- UV プレビュー、UV 回転、UV スクロール確認
- テクスチャ画像のローカルプレビュー
- ワイヤーフレーム、ポリゴン数、ピボット表示
- ピボット、スケール、回転の調整
- 日本語 / English UI
- OBJ エクスポート

## Mesh Types

- Slash / Straight
- Ribbon / Wave
- Ribbon / Lightning
- Slash / Arc
- Ribbon / Curve
- Tornado / Ribbon
- Tornado / Cylinder
- Plane
- Ring
- Sphere
- Hemisphere Y / Z
- Shockwave / Cylinder
- Beam

## Export Status

現在の公開 UI では OBJ エクスポートを主な出力形式にしています。

FBX、GLB、GLTF のエクスポート実装はコード上に残していますが、Unity / Blender での確認や UV 表示との整合が安定するまでボタンは非表示です。

OBJ は Three.js の標準 `OBJExporter` ではなく、ツール上の UV 表示と一致するように調整した独自の書き出し処理を使っています。

## Quick Start

```bash
npm install
npm run dev
```

開発サーバーは通常 `http://localhost:3000` で起動します。

Windows PowerShell で実行ポリシーに引っかかる場合は、以下のように `npm.cmd` を使ってください。

```bash
npm.cmd run dev
```

## Build

```bash
npm run build
```

Windows PowerShell:

```bash
npm.cmd run build
```

ビルド結果は `dist/` に出力されます。`dist/` は生成物なので、通常はリポジトリには含めません。

## Requirements

- Node.js 18 以上
- npm 9 以上
- WebGL が使えるモダンブラウザ

デスクトップブラウザでの利用を想定しています。モバイルブラウザでは操作パネルや 3D ビューが狭くなる場合があります。

## Privacy

画像テクスチャを選択した場合でも、ファイルはブラウザ内でプレビューに使われるだけで、このアプリから外部サーバーへ送信されません。

## Development Notes

- メッシュ生成の基準実装は `src/generators/slashMeshGenerator.ts` と `src/generators/effectMeshGenerator.ts` です。
- UV プレビュー、OBJ 書き出し、将来の GLB/GLTF/FBX 書き出しは同じ見た目になるように注意してください。
- Unity でのカリング、法線、UV の向きに影響する変更は、ツール上のプレビューと Unity import の両方で確認してください。

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Deployment

`main` または `master` に push すると GitHub Actions が `dist/` をビルドし、GitHub Pages に自動デプロイします。

初回だけ GitHub repository settings の Pages で Source が GitHub Actions になっていることを確認してください。

## Security

脆弱性の報告方法は [SECURITY.md](SECURITY.md) を参照してください。

## Contributing

コントリビューションの流れは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## License

MIT License. See [LICENSE](LICENSE).
