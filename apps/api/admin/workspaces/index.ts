// apps/api/admin/workspaces/index.ts
import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
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

    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const filtered = q
      ? allEacs.filter((e) => {
          const name = (e.Details?.Name ?? e.EnterpriseLookup ?? '').toLowerCase();
          const owner = String((e as any).$Owner?.Username ?? '').toLowerCase();
          return name.includes(q) || owner.includes(q);
        })
      : allEacs;

    return Response.json(filtered);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
