import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../../../../src/state/OpenIndustrialAPIState.ts';
import { loadEaCLicensingSvc } from '@fathym/eac-licensing/clients';

export default {
  /**
   * DELETE /api/admin/users/[username]/licenses/[licLookup]
   *
   * Cancels a user's license using the licensing client.
   */
  async DELETE(req, ctx) {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const licLookup = decodeURIComponent(parts.at(-1) || '');
    const username = decodeURIComponent(parts.at(-3) || '');
    const entLookup = ctx.Runtime.EaC?.EnterpriseLookup!;

    try {
      const licSvc = await loadEaCLicensingSvc(entLookup, username);
      const result = await licSvc.License.Cancel(entLookup, username, licLookup);
      return Response.json(result ?? { ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(`Failed to cancel license: ${msg}`, { status: 500 });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
