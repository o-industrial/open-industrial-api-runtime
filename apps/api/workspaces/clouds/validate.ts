import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { loadAzureCloudCredentials } from '@fathym/eac-azure/utils';
import type { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

const ARM_SCOPE = 'https://management.azure.com/.default';

export default {
  async GET(req, ctx) {
    const logger = ctx.Runtime.Logs?.Package ?? ctx.Runtime.Logs;

    const url = new URL(req.url);
    const cloudLookup = url.searchParams.get('cloud') ?? 'Workspace';

    const cloud = ctx.State.EaC?.Clouds?.[cloudLookup];

    if (!cloud?.Details) {
      const message = `Cloud '${cloudLookup}' is not configured.`;
      logger?.debug?.(message);
      return Response.json({ valid: false, message });
    }

    try {
      const credential = await loadAzureCloudCredentials(cloud);
      const token = await credential.getToken([ARM_SCOPE]);
      const valid = Boolean(token?.token && token.token.length > 0);

      if (!valid) {
        const message = 'Failed to retrieve Azure access token.';
        logger?.warn?.(`Cloud validation failed: ${message}`);
        return Response.json({ valid: false, message });
      }

      return Response.json({ valid });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger?.error?.(`Cloud validation for '${cloudLookup}' failed: ${message}`);
      return Response.json({ valid: false, message });
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
