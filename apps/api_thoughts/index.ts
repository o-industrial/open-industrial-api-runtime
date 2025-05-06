import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';

export default {
  GET(_req, _ctx) {
    return Response.json({ Hello: 'World' });
  },
} as EaCRuntimeHandlers;
