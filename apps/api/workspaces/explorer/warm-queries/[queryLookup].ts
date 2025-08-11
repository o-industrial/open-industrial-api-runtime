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
  async GET(_req, { Runtime, State, Params }) {
    const logger = Runtime.Logs.Package;

    try {
      const queryLookup = Params.queryLookup!;

      const model = State.EaC!.WarmQueries![queryLookup];

      const deployed = await State.SOP.RunValidated<
        EaCWarmQueryAsCode,
        EaCWarmQueryDetails,
        AzureDataExplorerOutput
      >({
        lookup: queryLookup,
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
