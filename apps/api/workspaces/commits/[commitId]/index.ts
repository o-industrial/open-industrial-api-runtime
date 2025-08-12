import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { OpenIndustrialAPIState } from '../../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, ctx) {
    try {
      const commitId = ctx.Params.commitId;

      if (!commitId || !ctx.State.EaCJWT) {
        return new Response('Commit not found.', { status: 404 });
      }

      const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT);

      const status = await eacSvc.Status.Get(commitId);

      if (!status) {
        return new Response('Commit not found.', { status: 404 });
      }

      return Response.json(status);
    } catch {
      return new Response('Failed to retrieve commit status.', { status: 500 });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
