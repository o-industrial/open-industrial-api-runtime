import { EverythingAsCode } from '@fathym/eac';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeContext } from '@fathym/eac/runtime';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';
import { NullableArrayOrObject } from '@fathym/common';

export default {
  async POST(req, ctx: EaCRuntimeContext<OpenIndustrialAPIState>) {
    const { ParentSteward, JWT, EnterpriseLookup } = ctx.State;

    if (!ParentSteward || !JWT || !EnterpriseLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    let eac: EverythingAsCode;

    try {
      eac = await req.json();
    } catch {
      return new Response('Invalid JSON body.', { status: 400 });
    }

    try {
      const commitResp = await ParentSteward.EaC.Commit(
        {
          EnterpriseLookup: ctx.Runtime.EaC.EnterpriseLookup,
          ...eac,
          ActuatorJWT: JWT,
        },
        30,
        true,
      );

      const status = await waitForStatus(
        ParentSteward,
        EnterpriseLookup,
        commitResp.CommitID,
      );

      const resp = { status, commitId: commitResp.CommitID };

      if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
        return Response.json(resp);
      }

      return Response.json(resp, { status: 500 });
    } catch (err) {
      return new Response(
        err instanceof Error ? err.message : 'Commit failed.',
        { status: 500 },
      );
    }
  },

  async DELETE(req, ctx: EaCRuntimeContext<OpenIndustrialAPIState>) {
    const { ParentSteward, EnterpriseLookup } = ctx.State;

    if (!ParentSteward || !EnterpriseLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    let deleteEaC: NullableArrayOrObject<EverythingAsCode>;

    try {
      deleteEaC = {
        EnterpriseLookup: ctx.Runtime.EaC.EnterpriseLookup,
        ...(await req.json()),
      };
    } catch {
      return new Response('Invalid JSON body.', { status: 400 });
    }

    try {
      const deleteResp = await ParentSteward.EaC.Delete(deleteEaC, false, 60);

      const status = await waitForStatus(
        ParentSteward,
        EnterpriseLookup,
        deleteResp.CommitID,
      );

      if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
        return Response.json({ status });
      }

      return Response.json({ status }, { status: 500 });
    } catch (err) {
      return new Response(
        err instanceof Error ? err.message : 'Delete failed.',
        { status: 500 },
      );
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
