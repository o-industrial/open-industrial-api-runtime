// deno-lint-ignore-file no-explicit-any
// apps/api/admin/workspaces/index.ts
import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  /**
   * GET /api/admin/workspaces
   *
   * Returns a list of workspaces (EaCs). Optional `q` filters by name.
   *
   * Examples:
   *   /api/admin/workspaces            – list all workspaces
   *   /api/admin/workspaces?q=acme     – filter by name containing "acme"
   */
  async GET(req: Request, ctx) {
    const allEacs = await ctx.State.ParentSteward!.EaC.List();

    // Enrich each workspace with $Owner when determinable
    const enriched = await Promise.all(
      allEacs.map(async (eac) => {
        try {
          const jwt = await ctx.State.ParentSteward!.EaC.JWT(
            eac.EnterpriseLookup!,
            ctx.State.Username!,
          );

          const steward = await loadEaCStewardSvc(jwt.Token);
          const users = await steward.Users.List();
          const owner = users.find((u: any) => u?.Owner === true);
          if (owner) {
            eac.$Owner = owner;
          }
        } catch {
          // Best-effort enrichment; ignore failures
        }
        return eac;
      }),
    );

    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const filtered = q
      ? enriched.filter((e) => {
        const name = (
          e.Details?.Name ??
            e.EnterpriseLookup ??
            ''
        ).toLowerCase();
        const owner = String(e.$Owner?.Username ?? '').toLowerCase();
        return name.includes(q) || owner.includes(q);
      })
      : enriched;

    return Response.json(filtered);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
