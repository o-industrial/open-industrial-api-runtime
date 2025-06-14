import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  POST(_req, _ctx) {
    // ... Logic

    return Response.json({});
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
