import type { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../../../../src/state/OpenIndustrialAPIState.ts';
import { loadEaCLicensingSvc } from '@fathym/eac-licensing/clients';

export default {
  /**
   * GET /api/admin/users/[username]/licenses
   *
   * Proxies to the licensing API to list licenses for the user.
   */
  async GET(req, ctx) {
    const url = new URL(req.url);
    const username = decodeURIComponent(url.pathname.split('/').at(-2) || '');
    const entLookup = ctx.Runtime.EaC?.EnterpriseLookup!;

    try {
      const licSvc = await loadEaCLicensingSvc(entLookup, username);
      const licenses = await licSvc.License.List(entLookup, username);
      return Response.json(licenses);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(`Failed to list licenses: ${msg}`, { status: 500 });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
