import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, ctx) {
    const proposals = await ctx.State.ParentSteward!.EaC.ListForUser();

    return Response.json(proposals);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
