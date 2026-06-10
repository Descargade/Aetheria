---
name: pnpm overrides syntax
description: Use explicit version strings in pnpm.overrides, not $-variable references
---

The `pnpm.overrides` field in package.json does NOT support `$react` or `$react-dom` variable
syntax for referring to catalog versions.

**Why:** `$variableName` syntax is not supported by pnpm overrides — it causes pnpm install to fail.

**How to apply:**
- Use explicit version strings: `"react": "19.1.0"` not `"react": "$react"`
- React 19.1.0 is already pinned in the workspace catalog and satisfies Uppy v5 peer deps,
  so no overrides are needed for Uppy at all
