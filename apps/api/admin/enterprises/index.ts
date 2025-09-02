// apps/api/admin/enterprises/index.ts
import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  /**
   * GET /api/admin/enterprises
   *
   * Returns a list of top‑level enterprises.  The optional `q` query
   * parameter performs a case‑insensitive search on the enterprise name.
   *
   * Example:
   *   /api/admin/enterprises       – list all enterprises
   *   /api/admin/enterprises?q=acme – list enterprises whose name contains "acme"
   */
  async GET(req: Request, ctx: { State: OpenIndustrialAPIState }) {
    // Pull all EaCs from the steward.  The steward API should return an array
    // of EverythingAsCode records.  If no List() method exists, adapt as needed.
    const allEacs = await ctx.State.ParentSteward!.EaC.List();

    // Only return top‑level enterprises (no ParentEnterpriseLookup).
    const enterprises = (allEacs ?? []).filter(
      (eac) => !eac.ParentEnterpriseLookup,
    );

    // Apply a name filter if 'q' is supplied.
    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const filtered = q
      ? enterprises.filter((e) =>
        (e.Details?.Name ?? e.EnterpriseLookup ?? '')
          .toLowerCase()
          .includes(q)
      )
      : enterprises;

    return Response.json(filtered);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
