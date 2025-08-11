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
      logger.error(`AzureDataExplorerWarmQuery actuator failed`, err);

      return Response.json({
        HasError: true,
        Messages: {
          Error: JSON.stringify(err, Object.getOwnPropertyNames(err)),
        },
      } as EaCActuatorErrorResponse);
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
