import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';
import { EaCUserRecord } from '@fathym/eac';

export default {
  async POST(req, ctx) {
    const { Steward, WorkspaceLookup } = ctx.State;

    if (!Steward || !WorkspaceLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    const userRecord: EaCUserRecord = await req.json();

    await Steward.Users.Invite(userRecord);

    return Response.json(status, {
      status: 500,
    });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
