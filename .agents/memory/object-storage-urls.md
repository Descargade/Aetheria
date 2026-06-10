---
name: Object storage URL pattern
description: How objectPath from presigned upload maps to the /api/storage/objects/ serving route
---

The two-step upload flow (`POST /api/storage/uploads/request-url`) returns an `objectPath` like
`/objects/abc123-filename.jpg`.

The serving route in storage.ts is:
  `GET /storage/objects/*path` → reads `const objectPath = "/objects/" + wildcardPath`

So to display an uploaded image, strip `/objects/` from the objectPath:
  `const url = "/api/storage/objects/" + objectPath.replace(/^\/objects\//, "")`

This is implemented in `artifacts/aetheria/src/lib/storage-utils.ts` → `objectUrl(objectPath)`.

**Why:** The serve route reconstructs the `/objects/` prefix internally, so passing the full
objectPath would result in `/objects//objects/xxx` double-prefix.
