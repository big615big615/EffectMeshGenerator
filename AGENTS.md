# Project Notes for Coding Agents

This project is a React + Vite + Three.js tool for generating slash/effect meshes for Unity.

## Commands

- Use `npm.cmd run build` on Windows PowerShell. `npm run build` may be blocked by PowerShell execution policy because it resolves to `npm.ps1`.
- Do not edit `dist/` unless the user explicitly asks for generated build output.

## Mesh and Unity Compatibility

- `src/generators/slashMeshGenerator.ts` is the source of truth for slash mesh topology.
- Triangle winding is intentionally reversed so Unity culls the opposite side from the original implementation.
- UV width is intentionally flipped with `uvs.push(u, 1 - v)`. Do not "simplify" this back to `uvs.push(u, v)` without checking Unity and the in-tool UV preview.
- `geometry.computeVertexNormals()` depends on the current winding order. If winding changes, verify normals and Unity culling again.

## UV Behavior

- In `src/components/Viewport.tsx`, `SLASH_UV_ROTATION_OFFSET = 270` makes the UI's `0 deg` state behave like the old `270 deg` UV rotation.
- Keep UV preview, mesh preview, OBJ export, and FBX export aligned. A change to one usually needs checks in all of these:
  - `src/components/Viewport.tsx`
  - `src/generators/slashMeshGenerator.ts`
  - `src/exporters/meshExporter.ts`
  - `src/exporters/FBXExporter.ts`
- The UV preview maps V downward visually. OBJ/FBX export flips V with `1 - uv.y` so imported UVs match what the tool shows.

## Exporters

- FBX export is currently on hold because Unity/Blender import is unreliable. Keep the implementation for reference, but keep the FBX button hidden and do not re-enable it unless the user asks.
- OBJ export intentionally uses `exportOBJWithDisplayedUVs()` instead of Three.js `OBJExporter`, because the default exporter did not match the tool's displayed UV orientation.
- GLB and GLTF buttons are currently hidden in CSS. The export functions may remain in code, but do not re-expose the buttons unless the user asks.

## UI Conventions

- Prefer minimal controls and preserve the existing dark tool-panel layout.
- If a feature is temporarily unnecessary, hide it rather than deleting the implementation unless the user explicitly asks for removal.

## Verification

- After mesh, UV, exporter, or UI changes, run:

```bash
npm.cmd run build
```

- Treat the Vite chunk-size warning as unrelated unless the task is specifically about bundle size.
