import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  /**
   * GET /api/admin/eac
   *
   * Returns the current Everything-as-Code for the active workspace by
   * asking the steward, ensuring the latest committed state is returned.
   */
  async GET(_req: Request, ctx: { State: OpenIndustrialAPIState }) {
    // Middleware already tries to populate ctx.State.EaC via the steward.
    // Fall back to an explicit steward call if needed.
    if (!ctx.State.EaC && ctx.State.ParentSteward) {
      ctx.State.EaC = await ctx.State.ParentSteward.EaC.Get();
    }

    if (!ctx.State.EaC) {
      return new Response('EaC not available for current user/workspace.', {
        status: 404,
      });
    }

    return Response.json(ctx.State.EaC);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
