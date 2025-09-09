import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';
import type { EaCUserRecord } from '@fathym/eac';

/**
 * POST /api/admin/users/invite
 *
 * Invites a user at the parent (admin) level using ParentSteward.
 * Body: EaCUserRecord-like payload with at least { Username }
 */
export default {
  async POST(req, ctx) {
    const { ParentSteward } = ctx.State;

    if (!ParentSteward) {
      return new Response('Missing ParentSteward in state.', { status: 500 });
    }

    // Accept JSON or form data
    const ct = req.headers.get('content-type') || '';
    let payload: Record<string, unknown> = {};
    if (ct.includes('application/json')) {
      payload = (await req.json()) as Record<string, unknown>;
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => (payload[k] = String(v)));
    }

    const username = String(payload['Username'] ?? payload['Email'] ?? '').trim();
    if (!username) {
      return new Response('Username (email) is required.', { status: 400 });
    }

    // Build a complete parent-level EaCUserRecord
    const entLookup = ctx.Runtime.EaC?.EnterpriseLookup;
    const entName = ctx.Runtime.EaC?.Details?.Name;
    const parentLookup = ctx.Runtime.EaC?.ParentEnterpriseLookup ?? '';

    if (!entLookup) {
      return new Response('Missing enterprise context for admin invite.', {
        status: 500,
      });
    }

    const record: EaCUserRecord = {
      EnterpriseLookup: entLookup,
      EnterpriseName: entName ?? entLookup,
      Owner: false,
      ParentEnterpriseLookup: parentLookup,
      Username: username,
    };

    try {
      const result = await ParentSteward.Users.Invite(record as any);
      return Response.json(result ?? { ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(msg, { status: 500 });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
