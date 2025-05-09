import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';
import { EaCStatusProcessingTypes, waitForStatusWithFreshJwt } from '@fathym/eac/steward/status';

export default {
  GET(_req, ctx) {
    return Promise.resolve(Response.json(ctx.State.EaC ?? {}));
  },

  async POST(req, ctx) {
    const payload = await req.json();

    const createResp = await ctx.State.ParentSteward!.EaC.Create(
      payload,
      ctx.State.Username,
      60,
    );

    const status = await waitForStatusWithFreshJwt(
      ctx.State.ParentSteward!,
      createResp.EnterpriseLookup,
      createResp.CommitID,
      ctx.State.Username,
    );

    if (status.Processing !== EaCStatusProcessingTypes.COMPLETE) {
      return new Response('Workspace creation failed.', { status: 500 });
    }

    return Response.json({
      EnterpriseLookup: createResp.EnterpriseLookup,
      CommitID: createResp.CommitID,
    });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
