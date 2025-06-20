import { IoCContainer } from '@fathym/ioc';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import {
  EaCAzureIoTHubDataConnectionDetails,
  EaCDataConnectionAsCode,
  EverythingAsCodeOIWorkspace,
  isEaCAzureIoTHubDataConnectionDetails,
} from '@o-industrial/common/eac';
import { RuntimeStats } from '@o-industrial/common/types';
import { AzureIoTHubDataConnection } from '@o-industrial/common/packs/azure-iot';
import { DataConnectionStats } from '@o-industrial/common/packs/oi-core';
import type { OpenIndustrialAPIState } from '../../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, { State, Params, Runtime }) {
    const { EaC } = State;
    const statType = Params.statType!;
    const lookup = Params.lookup!;

    const stats = await resolveStatRuntime(statType, lookup, EaC!, Runtime.IoC);

    return Response.json(stats);
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;

/**
 * Returns an empty fallback stats object with zeroed metrics.
 */
function defaultStats(): RuntimeStats {
  return {
    ImpulseRates: [0, 0, 0],
    Metadata: { status: 'unavailable' },
  };
}

/**
 * Resolve and execute stats collection for a supported runtime type.
 */
export async function resolveStatRuntime(
  statType: string,
  lookup: string,
  eac: EverythingAsCodeOIWorkspace,
  ioc: IoCContainer
): Promise<RuntimeStats> {
  try {
    switch (statType) {
      case 'connection': {
        const conn = eac?.DataConnections?.[lookup] as EaCDataConnectionAsCode;

        if (!conn || !isEaCAzureIoTHubDataConnectionDetails(conn.Details)) {
          return defaultStats();
        }

        const runtime = new (AzureIoTHubDataConnection(lookup).Build().Runtime)();

        const ctx = await runtime.ConfigureContext({
          Lookup: lookup,
          AsCode:
            conn as EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
          EaC: eac,
          IoC: ioc,
        });

        const stats = await runtime.Stats(ctx);

        return stats as DataConnectionStats;
      }

      default:
        return defaultStats();
    }
  } catch {
    return defaultStats();
  }
}
