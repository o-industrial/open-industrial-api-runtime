import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCSchemaDetailsSchema, parseEverythingAsCodeOIWorkspace } from '@o-industrial/common/eac';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';
import { EaCUserRecord } from '../../../../../open-industrial-reference-architecture/src/api/.client.deps.ts';

export default {
  async POST(req, ctx) {
    const { Steward, WorkspaceLookup } = ctx.State;

    if (!Steward || !WorkspaceLookup) {
      return new Response('Missing steward context or enterprise info.', {
        status: 500,
      });
    }
    
    const userRecord = await req.json();

    await Steward.Users.Invite(userRecord);
    
    return Response.json(status, {
      status: 500,
    });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
