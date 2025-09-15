import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../../../src/state/OpenIndustrialAPIState.ts';
import { EverythingAsCode } from '@fathym/eac';

export default {
  /**
   * GET /api/admin/users/:username/workspaces
   *
   * Returns a list of workspaces for the specified user by calling the
   * steward's `EaC.ListForUser(username)`. Packs each EaCUserRecord into a
   * minimal EverythingAsCode shape expected by WorkspaceList, and attaches
   * `$Owner` when Owner === true.
   */
  async GET(req: Request, ctx) {
    const { username: raw } = ctx.Params as { username: string };
    const username = decodeURIComponent(raw || '');

    if (!username) {
      return new Response('Username required', { status: 400 });
    }

    const records = await ctx.State.ParentSteward!.EaC.ListForUser(username);

    // Optional name filter by `q`
    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';

    const mapped = records
      .map((r) => {
        const eac: EverythingAsCode = {
          EnterpriseLookup: r.EnterpriseLookup,
          ParentEnterpriseLookup: r.ParentEnterpriseLookup,
          Details: { Name: r.EnterpriseName },
        };
        if (r.Owner) eac.$Owner = r;
        return eac;
      })
      .filter((e) =>
        q
          ? ((e.Details?.Name ?? e.EnterpriseLookup ?? '') as string)
            .toLowerCase()
            .includes(q) ||
            String(e.$Owner?.Username ?? '').toLowerCase().includes(q)
          : true
      );

    return Response.json(mapped);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
