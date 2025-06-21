import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import {
  EaCStatusProcessingTypes,
  waitForStatus,
} from '@fathym/eac/steward/status';
import { parseEverythingAsCodeOIWorkspace } from '@o-industrial/common/eac';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async POST(req, ctx) {
    const { Steward, WorkspaceLookup } = ctx.State;

    if (!Steward || !WorkspaceLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    const snapshot = await req.json();

    const { deletes, eac: wkspc } = snapshot;

    parseEverythingAsCodeOIWorkspace(wkspc);

    // Step 1: Apply deletions
    const deleteResp = await Steward.EaC.Delete(deletes, false, 30);

    let status = await waitForStatus(
      Steward,
      WorkspaceLookup,
      deleteResp.CommitID
    );

    if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
      const commitResp = await Steward.EaC.Commit(
        { ...wkspc, ActuatorJWT: ctx.State.JWT },
        30
      );

      status = await waitForStatus(
        Steward,
        WorkspaceLookup,
        commitResp.CommitID
      );

      if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
        return Response.json(status);
      }
    }

    return Response.json(status, {
      status: 500,
    });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
