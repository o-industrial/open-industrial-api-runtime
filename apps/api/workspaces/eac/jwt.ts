import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  GET(_req, ctx) {
    return Promise.resolve(Response.json({ Token: ctx.State.EaCJWT }));
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
