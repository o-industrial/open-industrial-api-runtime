// deno-lint-ignore-file no-explicit-any
import { EaCActuatorErrorResponse } from '@fathym/eac/steward/actuators';
import {
  AzureDataExplorerOutput,
  AzureDataExplorerWarmQuery,
} from '@o-industrial/common/packs/azure-iot';
import {
  EaCWarmQueryAsCode,
  EaCWarmQueryDetails,
  isEaCWarmQueryAsCode,
  isEaCWarmQueryDetails,
} from '@fathym/eac-azure';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../../src/state/OpenIndustrialAPIState.ts';

/* ----------------------------- Helper methods ----------------------------- */

function safeParseDeep(s: string): unknown {
  try {
    const once = JSON.parse(s);
    // Some backends double-encode JSON; try a second pass if it still looks like JSON
    if (typeof once === 'string' && /^[\[{]/.test(once.trim())) {
      try {
        return JSON.parse(once);
      } catch { /* ignore */ }
    }
    return once;
  } catch {
    return s;
  }
}

function stringifyAll(v: unknown): string {
  try {
    // Include non-enumerable Error fields (message, stack, etc.)
    return JSON.stringify(v as object, Object.getOwnPropertyNames(v as object));
  } catch {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
}

/**
 * Pulls a useful message out of a Kusto/axios-style payload.
 * Prefers @errorMessage / @message (including innererror), with safe fallbacks.
 */
function extractKustoErrorMessage(payload: unknown): string {
  let data: any = payload;

  if (typeof data === 'string') data = safeParseDeep(data);

  if (data && typeof data === 'object') {
    const candidates = [
      data['@errorMessage'],
      data['@message'],
      data.innererror?.['@errorMessage'],
      data.innererror?.['@message'],
      data.message,
      data.error?.message,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c;
    }
  }

  return typeof payload === 'string' ? payload : stringifyAll(payload);
}

/* ------------------------------ Request handler ------------------------------ */

export default {
  async POST(req, { Runtime, State }) {
    const logger = Runtime.Logs.Package;

    try {
      const queryDetails: EaCWarmQueryDetails = await req.json();

      const model: EaCWarmQueryAsCode = {
        Details: queryDetails?.Query ? queryDetails : {
          Query: `Devices
| order by EnqueuedTime desc
| take 100`,
        },
      };

      const deployed = await State.SOP.RunValidated<
        EaCWarmQueryAsCode,
        EaCWarmQueryDetails,
        AzureDataExplorerOutput
      >({
        lookup: 'open-industrial-api-runtime-query',
        model,
        kind: 'AzureDataExplorer',
        validateModel: isEaCWarmQueryAsCode,
        validateDetails: isEaCWarmQueryDetails,
        buildRuntime: AzureDataExplorerWarmQuery,
      });

      if (deployed instanceof Response) return deployed;

      const { result } = deployed;

      return Response.json(result);
    } catch (err) {
      logger.error(`AzureDataExplorerWarmQuery actuator failed`);
      logger.error(err);

      // Prefer axios-style error payloads if present; otherwise fall back to the error itself
      const payload = (err as any)?.response?.data?.error ??
        (err as any)?.response?.data ??
        err;

      const errorText = extractKustoErrorMessage(payload);

      return Response.json(
        {
          HasError: true,
          Messages: { Error: errorText },
        } as EaCActuatorErrorResponse,
      );
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
