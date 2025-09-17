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

      const model = State.EaC!.WarmQueries?.[queryLookup];

      if (!model) {
        return Response.json(
          {
            HasError: true,
            Messages: {
              Error:
                `Warm query "${queryLookup}" was not found. Save it in your workspace before invoking the API.`,
            },
          } as EaCActuatorErrorResponse,
          { status: 404 },
        );
      }

      const queryText = model.Details?.Query;

      if (typeof queryText !== 'string' || !queryText.trim()) {
        return Response.json(
          {
            HasError: true,
            Messages: {
              Error:
                `Warm query "${queryLookup}" does not have any query text yet. Save a query body before invoking the API.`,
            },
          } as EaCActuatorErrorResponse,
          { status: 400 },
        );
      }

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
      logger.error(`AzureDataExplorerWarmQuery actuator failed`);
      logger.error(err);

      return Response.json({
        HasError: true,
        Messages: {
          Error: JSON.stringify(err, Object.getOwnPropertyNames(err)),
        },
      } as EaCActuatorErrorResponse);
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
