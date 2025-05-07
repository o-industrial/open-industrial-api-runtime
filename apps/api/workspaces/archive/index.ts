import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async DELETE(_req, ctx) {
    const { Steward, WorkspaceLookup } = ctx.State;

    if (!Steward || !WorkspaceLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    const deleteResp = await Steward.EaC.Delete(
      {
        EnterpriseLookup: WorkspaceLookup,
      },
      true,
      30,
    );

    const status = await waitForStatus(
      Steward,
      WorkspaceLookup,
      deleteResp.CommitID,
    );

    if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
      return Response.json(status);
    }

    return Response.json(status, {
      status: 500,
    });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
