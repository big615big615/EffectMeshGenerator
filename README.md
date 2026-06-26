# Effect Mesh Generator

Unity などのリアルタイム VFX 制作用に、スラッシュ、リボン、リング、球面、ビームなどのエフェクト用メッシュをブラウザ上で生成する React + Vite + Three.js ツールです。OBJ / FBX 形式でエクスポートできます。
<img width="640" height="344" alt="レコーディング 2026-05-30 143031" src="https://github.com/user-attachments/assets/38a1f2cf-8889-428a-9ccd-f190a3dfa169" />

## Web App

ブラウザで開いてすぐ使えます。

https://big615big615.github.io/EffectMeshGenerator/

GitHub repository:

https://github.com/big615big615/EffectMeshGenerator

## Features

- リアルタイム 3D プレビュー
- UV プレビュー、UV 回転、UV スクロール確認
- テクスチャ画像のローカルプレビュー
- ワイヤーフレーム、ポリゴン数、ピボット表示
- ピボット、スケール、回転の調整
- メッシュタイプごとの頂点アルファ調整
- 日本語 / English UI
- OBJ / FBX エクスポート

- 対応メッシュタイプのクロスメッシュ切り替え
- テンプレートを見た目で選べるサムネイル選択グリッド

## Camera Controls

- 左ドラッグ: モデル中心を基準にカメラを回転
- マウスホイール: ズームイン / ズームアウト
- 中ボタンドラッグ: 回転中心を維持したまま表示位置を上下左右に移動
- メッシュタイプを変更すると、中ボタンドラッグで移動した表示位置はリセットされます

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
- Honeycomb / Plane
- Honeycomb / Radial Plane
- Honeycomb / Sphere

## Export Status

現在の公開 UI では OBJ と FBX エクスポートを主な出力形式にしています。

FBX はエフェクトメッシュ専用の最小 Binary FBX として書き出します。

FBX には Position、Triangle Index、Normal、UV0、頂点カラーRGBAを出力します。UnityでOBJと同じ見た目のサイズになるよう、FBXの単位はメートル相当で出力しています。

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

## Usage Terms

このツールで生成・エクスポートしたメッシュは、個人制作、商用作品、ゲーム、映像、アセット制作などで自由に利用できます。

生成メッシュの利用にあたってクレジット表記は不要です。もし可能であれば Effect Mesh Generator の名前やリンクを添えてもらえると嬉しいです。

アプリ本体のソースコードは MIT License です。ソースコードを再配布する場合は [LICENSE](LICENSE) の条件に従ってください。

詳しくは [TERMS.md](TERMS.md) と [PRIVACY.md](PRIVACY.md) を参照してください。

## Development Notes

- メッシュ生成の基準実装は `src/generators/slashMeshGenerator.ts` と `src/generators/effectMeshGenerator.ts` です。
- UV プレビュー、OBJ / FBX 書き出しは同じ見た目になるように注意してください。
- Unity でのカリング、法線、UV の向きに影響する変更は、ツール上のプレビューと Unity import の両方で確認してください。

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run validate:fbx
```

Windows PowerShell:

```bash
npm.cmd run validate:fbx
```

`validate:fbx` は最小Plane、スラッシュ、頂点アルファ付きスラッシュのFBXを生成し、Binary FBX構造と three.js `FBXLoader` での読み戻しを確認します。外部FBX importerを使った追加検証が必要な場合は、`FBX_IMPORT_VALIDATOR_EXE` で実行ファイルの場所を指定できます。

## Deployment

`main` または `master` に push すると GitHub Actions が `dist/` をビルドし、GitHub Pages に自動デプロイします。

初回だけ GitHub repository settings の Pages で Source が GitHub Actions になっていることを確認してください。

## Security

脆弱性の報告方法は [SECURITY.md](SECURITY.md) を参照してください。

## Contributing

コントリビューションの流れは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## Contact

不具合、要望、利用条件についての相談はお問い合わせフォームから連絡してください。

- Japanese: https://forms.gle/PBUeyRmNTppJL2EQ8
- English: https://forms.gle/gXjDBKPhWy9H1Wft6

フォームでは、名前またはニックネーム、カテゴリ、内容の入力をお願いしています。本名である必要はありません。返信が必要な場合のみ、メールアドレスなどの連絡先を任意で記載してください。

## License

MIT License. See [LICENSE](LICENSE).
