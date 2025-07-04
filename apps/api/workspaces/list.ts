import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, ctx) {
    const userEaCs = await ctx.State.ParentSteward!.EaC.ListForUser(ctx.State.Username);

    return Response.json(userEaCs);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
