import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, ctx) {
    try {
      if (!ctx.State.EaCJWT) {
        return new Response('Missing EaC authentication.', { status: 500 });
      }

      const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT);

      const stati = await eacSvc.Status.ListStati(20);

      return Response.json(stati);
    } catch {
      return new Response('Failed to retrieve commit statuses.', { status: 500 });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
