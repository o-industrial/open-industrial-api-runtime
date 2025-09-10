import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';
import { EaCRuntimeContext } from '@fathym/eac/runtime';

export default {
  async POST(_req, ctx: EaCRuntimeContext<OpenIndustrialAPIState>) {
    const { Steward, WorkspaceLookup } = ctx.State;

    if (!Steward || !WorkspaceLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    if (ctx.State.AccessRights.includes('Workspace.Deploy')) {
      const commitResp = await Steward.EaC.Commit(
        {
          ...(ctx.State.EaC ?? {}),
          EnterpriseLookup: ctx.State.EnterpriseLookup,
          ActuatorJWT: ctx.State.JWT,
        },
        30,
        false,
      );

      const status = await waitForStatus(
        Steward,
        WorkspaceLookup,
        commitResp.CommitID,
      );

      if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
        return Response.json(status);
      }
    } else {
      return Response.json(
        { Acticve: false },
        {
          status: 500,
        },
      );
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
