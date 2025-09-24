# Agents Guide — open-industrial-api-runtime

API runtime for Open Industrial. Provides service endpoints, integrations, and admin operations backing the web runtime.

## Scope

- Implement API routes under `apps/api/*` and transports (e.g., NATS) under `apps/nats/*`.
- Persist to Deno KV when appropriate (see `denokv/*`).
- Integrate with EaC (Identity, Licensing, Azure) per `deno.jsonc` imports.

## Project Map

- `apps/api/*`: HTTP endpoints
- `apps/nats/*`: NATS processors (if used)
- `configs/eac-runtime.config.ts`: Runtime configuration
- `src/*`: Plugins, logging providers, helpers
- `tests/`: Test suites

## Commands

- Dev: `deno task dev`
- Check: `deno task check`
- Test: `deno task test`
- Build: `deno task build`
- Start: `deno task start`
- Docker: `deno task build:docker` → `deno task refresh:docker`
  - Default port: 5412

## Patterns

- Keep handlers pure and small; extract helpers to `src/`.
- Favor `ctx.State.OIClient` for EaC commit and admin actions.
- Validate inputs; respond with 303 redirects after POST mutations (web-facing flows).

## PR Checklist

- All type checks and tests pass locally.
- No unrelated refactors or formatting-only diffs.
- Update docs/comments for new APIs (path, method, expected payload).

## Safety

- Do not change license headers.
- Avoid destructive commands; keep migrations and KV operations idempotent.
