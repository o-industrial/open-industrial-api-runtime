import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeContext } from '@fathym/eac/runtime';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

function parseEaCFragment(eac: unknown) {
  if (!eac || typeof eac !== 'object') {
    throw new Error('Invalid EaC fragment.');
  }

  return eac;
}

export default {
  async POST(req, ctx: EaCRuntimeContext<OpenIndustrialAPIState>) {
    const { ParentSteward, JWT, EnterpriseLookup } = ctx.State;

    if (!ParentSteward || !JWT || !EnterpriseLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return new Response('Invalid JSON body.', { status: 400 });
    }

    const { eac } = (body as { eac?: unknown }) ?? {};

    try {
      parseEaCFragment(eac);
    } catch {
      return new Response('Invalid EaC fragment.', { status: 400 });
    }

    try {
      const commitResp = await ParentSteward.EaC.Commit(
        { ...eac, ActuatorJWT: JWT },
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
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
