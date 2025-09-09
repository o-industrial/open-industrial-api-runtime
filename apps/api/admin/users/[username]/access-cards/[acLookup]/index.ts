import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../../../../src/state/OpenIndustrialAPIState.ts';

type EaCUserAccessCard = {
  AccessConfigurationLookup: string;
  Username: string;
};

const kvKey = (entLookup: string, username: string) =>
  [
    'OAuth',
    'AccessCards',
    entLookup,
    username.toLowerCase(),
  ] as const;

export default {
  /**
   * DELETE /api/admin/users/[username]/access-cards/[acLookup]
   *
   * Removes the given access card assignment from the user.
   */
  async DELETE(req: Request, ctx) {
    const { State, Runtime } = ctx;
    const entLookup = Runtime.EaC?.EnterpriseLookup!;
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const acLookup = decodeURIComponent(parts.at(-1) || '');
    const username = decodeURIComponent(parts.at(-3) || '');

    if (!acLookup) return new Response('Not Found', { status: 404 });

    const key = kvKey(entLookup, username);
    const current = (await State.OIKV.get<Record<string, EaCUserAccessCard>>(
      key,
    )).value || {};

    if (current[acLookup]) {
      delete current[acLookup];
      await State.OIKV.set(key, current);
    }

    return new Response(null, { status: 204 });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;

