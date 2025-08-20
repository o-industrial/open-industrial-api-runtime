import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { AccountProfile } from '@o-industrial/common/types';
import { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, ctx) {
    const username = ctx.State.Username;
    if (!username) {
      return new Response('Unauthorized', { status: 401 });
    }

    const kv: Deno.Kv = ctx.State.OIKV;

    const key = ['CurrentUser', username, 'AccountProfile'];

    const current = await kv.get<AccountProfile>(key);

    if (!current.value) {
      return Response.json({
        Username: username,
        Name: '',
        Bio: '',
        Additional: '',
      });
    }

    return Response.json(current.value);
  },

  async PUT(req, ctx) {
    const username = ctx.State.Username;
    if (!username) {
      return new Response('Unauthorized', { status: 401 });
    }

    const kv: Deno.Kv = ctx.State.OIKV;

    const key = ['CurrentUser', username, 'AccountProfile'];

    const incoming = await req.json();

    incoming.Username = username;

    await kv.set(key, incoming);

    return Response.json(incoming);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
