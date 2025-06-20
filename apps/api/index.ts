import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../src/state/OpenIndustrialAPIState.ts';

export default {
  GET(_req, ctx) {
    return Response.json(ctx.State.EaC);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
