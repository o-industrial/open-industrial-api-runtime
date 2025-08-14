import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { EaCStatusProcessingTypes, waitForStatusWithFreshJwt } from '@fathym/eac/steward/status';
import { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';

export default {
  GET(_req, ctx) {
    return Promise.resolve(Response.json(ctx.State.EaC ?? {}));
  },

  async POST(req, ctx) {
    const eac = await req.json();

    const createResp = await ctx.State.ParentSteward!.EaC.Create(
      { ...eac, ActuatorJWT: ctx.State.JWT },
      ctx.State.Username,
      60,
      true,
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
