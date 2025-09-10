import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../../src/state/OpenIndustrialAPIState.ts';

/**
 * DELETE /api/admin/users/[username]
 *
 * Proxies to the EaC Steward client to delete the user from the enterprise.
 */
export default {
  async DELETE(req, ctx) {
    const url = new URL(req.url);
    const username = decodeURIComponent(url.pathname.split('/').at(-1) || '').trim();
    if (!username) return new Response('Username required', { status: 400 });

    try {
      await ctx.State.ParentSteward!.Users.Delete(username);
      return new Response(null, { status: 204 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(`Failed to delete user: ${msg}`, { status: 500 });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
