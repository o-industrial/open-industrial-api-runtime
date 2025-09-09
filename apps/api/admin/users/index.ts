// apps/api/admin/users/index.ts
import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  /**
   * GET /api/admin/users
   *
   * Returns a list of top‑level enterprises.  The optional `q` query
   * parameter performs a case‑insensitive search on the enterprise name.
   *
   * Example:
   *   /api/admin/users       – list all enterprises
   *   /api/admin/users?q=acme – list enterprises whose name contains "acme"
   */
  async GET(req: Request, ctx: { State: OpenIndustrialAPIState }) {
    const users = await ctx.State.ParentSteward!.Users.List();

    // Apply a name filter if 'q' is supplied.
    const url = new URL(req.url);

    const q = url.searchParams.get('q')?.toLowerCase() ?? '';

    const filtered = q
      ? users.filter((e) =>
          (e.Username ?? e.EnterpriseName ?? '')
            .toLowerCase()
            .includes(q.toLowerCase())
        )
      : users;

    return Response.json(filtered);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
