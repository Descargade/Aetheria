---
name: API Server zod imports
description: Never import zod or zod/v4 directly in api-server routes — esbuild fails to bundle it
---

The api-server esbuild bundle cannot resolve `zod` or `zod/v4` because neither is listed in
package.json dependencies, and it's not added to esbuild externals in `build.mjs`.

**Why:** The api-server bundles everything with esbuild. Packages not in deps or externals cause
"Could not resolve" build failures.

**How to apply:**
- For input validation in routes, use the drizzle-zod schemas exported from `@workspace/db`
  (e.g. `insertVariantSchema.safeParse(req.body)`)
- For array validation, do manual checks (`if (!Array.isArray(req.body))`)
- Never add bare `import { z } from "zod"` to route files
- If zod is genuinely needed, add it to api-server `package.json` dependencies AND `build.mjs` externals
