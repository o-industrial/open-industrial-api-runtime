import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, ctx) {
    const { Steward, WorkspaceLookup } = ctx.State;

    if (!Steward || !WorkspaceLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }

    const teamUsers = await Steward.Users.List();

    return Response.json(teamUsers);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
