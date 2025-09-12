import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import type { OpenIndustrialAPIState } from '../../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  /**
   * GET /api/admin/workspaces/:entLookup
   *
   * Returns the Everything-as-Code for the specified workspace. Uses a JWT
   * minted by the parent steward to scope access for the current admin user.
   * Also enriches the payload with $Owner (if available).
   */
  async GET(_req: Request, ctx) {
    const { entLookup: raw } = ctx.Params as { entLookup: string };
    const entLookup = decodeURIComponent(raw || '');

    if (!entLookup) {
      return new Response('Workspace lookup required.', { status: 400 });
    }

    // Create a JWT for the requested workspace and use it to query the steward
    const jwt = await ctx.State.ParentSteward!.EaC.JWT(
      entLookup,
      ctx.State.Username!,
    );

    const steward = await loadEaCStewardSvc(jwt.Token);

    const eac = await steward.EaC.Get();

    // Enrich with $Owner when we can determine it from the users list
    try {
      const users = await steward.Users.List();
      const owner = users.find((u: any) => u?.Owner === true);
      if (owner) {
        (eac as any).$Owner = owner;
      }
    } catch {
      // Ignore user listing errors; still return EAC
    }

    return Response.json(eac);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;

