# Contributing

Thank you for your interest in Effect Mesh Generator.

## Development Setup

```bash
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if the execution policy blocks `npm`:

```bash
npm.cmd run dev
```

## Before Submitting Changes

Run the production build:

```bash
npm run build
```

On Windows PowerShell:

```bash
npm.cmd run build
```

## Mesh and UV Changes

Mesh topology, triangle winding, normals, UV preview, and export orientation are tightly related.

When changing mesh generation or export behavior, check:

- The 3D preview
- The UV preview
- OBJ export
- Unity import behavior when possible

FBX export is available as a minimal binary exporter for effect meshes. Keep export UI changes aligned with the currently supported public formats.

## Pull Request Guidelines

- Keep changes focused.
- Avoid editing generated `dist/` files.
- Explain any Unity, UV, winding, or normal-direction impact in the PR description.
- Include screenshots or short videos for visible UI changes when practical.
