import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../../src/state/OpenIndustrialAPIState.ts';

/**
 * DELETE /api/workspaces/teams/[username]
 *
 * Uses the workspace-scoped steward to remove a user from the current workspace.
 */
export default {
  async DELETE(req, ctx) {
    const { Steward } = ctx.State;

    if (!Steward) {
      return new Response('Missing steward context.', { status: 500 });
    }

    const url = new URL(req.url);
    const username = decodeURIComponent(url.pathname.split('/').at(-1) || '').trim();
    if (!username) return new Response('Username required', { status: 400 });

    try {
      await Steward.Users.Delete(username);
      return new Response(null, { status: 204 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(`Failed to remove user: ${msg}`, { status: 500 });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;

