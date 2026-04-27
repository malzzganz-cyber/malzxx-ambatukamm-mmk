# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `malzz-nokos` (web, React + Vite, mobile-first)
Indonesian OTP/virtual phone number rental app integrated with the RumahOTP API.

- **Stack**: React + Vite, wouter, @tanstack/react-query, framer-motion, lucide-react, shadcn/ui, Tailwind.
- **Layout**: mobile shell `max-w-[420px]`, deep indigo + coral palette, no emojis, Bahasa Indonesia copy.
- **Pages**: Home (hero + stats + testimonials), Order (Service → Country/Provider → Operator → confirm), OrderDetail (poll OTP), Deposit (QRIS), Withdraw (H2H), Admin (balance), Profile, Testimonials.
- **Hooks**: `src/hooks/use-nokos.ts` wraps every backend route with React Query and **normalizes RumahOTP shapes**:
  - `useServices` → `{id, name, image}` from `service_code`/`service_name`/`service_img`.
  - `useCountries(serviceId)` → flattens each country's `pricelist` into one row per provider with `{countryName, numberId, providerId, price, priceFormat, stock, available, ...}`, sorted available-first then cheapest.
  - Other hooks unwrap `{success, data}` envelope and surface `error.message` as thrown Error.
- Polling: order/deposit/withdraw status hooks refetch every 60s until terminal status.

### `api-server` (Express)
- All RumahOTP calls proxied via `src/routes/rumahotp.ts` using `RUMAHOTP_API_KEY` (server-only).
- Routes: `services`, `countries`, `operators`, `order`, `order-status`, `order-cancel`, `deposit-create/status/cancel`, `h2h-product/list-rekening/check/create/status`, `admin-balance`.
- `src/routes/testimonials.ts`: in-memory testimonials + `/api/stats` (resets on restart).

## Environment Secrets
- `RUMAHOTP_API_KEY` — required, server-side only, never exposed to client.
