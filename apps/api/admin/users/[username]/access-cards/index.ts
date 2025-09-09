import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../../../src/state/OpenIndustrialAPIState.ts';

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
   * GET /api/admin/users/[username]/access-cards
   *
   * Returns the ad hoc access cards assigned to the user.
   */
  async GET(req: Request, ctx) {
    const { State, Runtime } = ctx;
    const entLookup = Runtime.EaC?.EnterpriseLookup!;
    const url = new URL(req.url);
    const username = decodeURIComponent(url.pathname.split('/').at(-2) || '');

    const current = (await State.OIKV.get<Record<string, EaCUserAccessCard>>(
      kvKey(entLookup, username),
    )).value || {};

    return Response.json(Object.values(current));
  },

  /**
   * POST /api/admin/users/[username]/access-cards
   *
   * Adds an ad hoc access card for the user.
   * Body: { AccessConfigurationLookup: string }
   */
  async POST(req: Request, ctx) {
    const { State, Runtime } = ctx;
    const entLookup = Runtime.EaC?.EnterpriseLookup!;
    const url = new URL(req.url);
    const username = decodeURIComponent(url.pathname.split('/').at(-2) || '');

    const incoming = (await req.json()) as Partial<EaCUserAccessCard>;
    const acLookup = incoming.AccessConfigurationLookup?.trim();
    if (!acLookup) {
      return new Response('AccessConfigurationLookup required', { status: 400 });
    }

    const key = kvKey(entLookup, username);
    const current = (await State.OIKV.get<Record<string, EaCUserAccessCard>>(
      key,
    )).value || {};

    current[acLookup] = {
      AccessConfigurationLookup: acLookup,
      Username: username,
    };

    await State.OIKV.set(key, current);

    return Response.json(Object.values(current));
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
