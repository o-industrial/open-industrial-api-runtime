import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { parseEverythingAsCodeOIWorkspace } from '@o-industrial/common/eac';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';
import { EaCRuntimeContext } from '@fathym/eac/runtime';
import { loadJwtConfig } from '@fathym/common';
import { loadEaCLicensingSvc } from '@fathym/eac-licensing/clients';

export default {
  async POST(req, ctx: EaCRuntimeContext<OpenIndustrialAPIState>) {
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
      deleteResp.CommitID,
    );

    if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
      //  TODO(AI): Cache this so we don't refresh every request?
      const parentJwt = await loadJwtConfig().Create({
        EnterpriseLookup: ctx.Runtime.EaC.EnterpriseLookup!,
        WorkspaceLookup: ctx.Runtime.EaC.EnterpriseLookup!,
        Username: ctx.State.Username,
      });

      const licSvc = await loadEaCLicensingSvc(parentJwt);

      const licRes = await licSvc.License.Get(
        ctx.Runtime.EaC.EnterpriseLookup!,
        ctx.State.Username,
        'o-industrial',
      );

      const skipActuators = !licRes.Active;

      const commitResp = await Steward.EaC.Commit(
        { ...wkspc, ActuatorJWT: ctx.State.JWT },
        30,
        skipActuators,
      );

      status = await waitForStatus(
        Steward,
        WorkspaceLookup,
        commitResp.CommitID,
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
