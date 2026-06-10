---
name: lib/object-storage-web composite setup
description: Steps to make object-storage-web a proper composite lib in this monorepo
---

`lib/object-storage-web` was copied from the skill template and needs these changes to be a proper
composite lib that artifact packages can reference:

1. Add to `lib/object-storage-web/tsconfig.json`: `composite: true, declarationMap: true, emitDeclarationOnly: true`
2. Add `{ "path": "./lib/object-storage-web" }` to root `tsconfig.json` references array
3. Add `{ "path": "../../lib/object-storage-web" }` to consuming artifact's tsconfig references
4. Add `"@workspace/object-storage-web": "workspace:*"` to consuming artifact's package.json devDependencies

The `useUpload` hook only requires a native `File` object for `uploadFile()` — Uppy is optional.
`@uppy/core` is only needed for the `getUploadParameters` method.
