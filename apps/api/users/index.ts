import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async DELETE(_req, ctx) {
    const username = ctx.State.Username;
    if (!username) {
      return new Response('Unauthorized', { status: 401 });
    }

    const kv: Deno.Kv = ctx.State.OIKV;

    const key = ['CurrentUser', username, 'AccountProfile'];

    await kv.delete(key);

    // TODO(someone): remove other user-owned resources, if any,
    // or delegate to your steward service.

    return new Response(null, { status: 204 });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
