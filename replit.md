# AETHERIA — Tienda Online

_Tienda de ropa urbana streetwear premium con panel de administración completo, carrito, checkout, favoritos, órdenes, promociones y métricas._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/aetheria run dev` — run the storefront (proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (drizzle-zod), manual array checks in server routes
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)
- Frontend: React 19 + Vite + Tailwind CSS v4 + shadcn/ui
- Storage: Replit Object Storage (presigned URLs via `lib/object-storage-web`)

## Where things live

- `lib/db/src/schema/` — DB schema (products, categories, variants, size_guides, etc.)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks (don't edit manually)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/aetheria/src/` — React storefront + admin panel
- `artifacts/aetheria/src/components/admin/` — admin components (AdminLayout, VariantManager)
- `artifacts/aetheria/src/pages/admin/` — admin pages
- `artifacts/aetheria/src/lib/storage-utils.ts` — `objectUrl()` helper for image URLs

## Architecture decisions

- Contract-first API: define in OpenAPI → run codegen → use generated hooks in frontend
- Object storage images: objectPath from upload = `/objects/xxx`; serve via `/api/storage/objects/xxx`
- Never import `zod` or `zod/v4` directly in api-server routes (esbuild can't resolve it); use drizzle-zod schemas from `@workspace/db` or manual validation
- Variants are separate from products: each product has color variants, each variant has sizes (with stock) and images
- Admin credentials: username=`admin`, password=`aetheria2024`, token=`aetheria-admin-token-secret`

## Product

- **Storefront**: Home, shop/collection, product detail (with color/size variant selector), cart, checkout, favorites, contact
- **Admin panel**: Dashboard metrics, orders management, products (with image upload + variant manager), categories (with image upload), promotions, size guides, shipping config
- **Variants**: Per-color variants with per-size stock and multiple images per color
- **Size guides**: Editable table with measurements, instructions, reference image

## User preferences

- Everything in Spanish, prices in ARS $
- Dark/light mode support
- Premium urban streetwear aesthetic: dark bg #0a0a0a, electric violet hsl(266 100% 50%)
- Fonts: Syne (headings) + Space Mono (data/labels)
- Sharp edges (border-radius: 0)

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`
- After any DB schema change, run `pnpm --filter @workspace/db run push` (dev) or apply migrations manually for prod
- Do NOT add `zod`/`zod/v4` imports to api-server routes — esbuild fails to bundle them
- `@workspace/db`'s drizzle instance is initialized with `{ schema }` so `db.query.*` relational queries work
- The variants router is mounted at `/variants` for direct CRUD; product-scoped routes (`/products/:id/variants`) are in the products router

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.agents/memory/` for session-specific lessons and decisions
