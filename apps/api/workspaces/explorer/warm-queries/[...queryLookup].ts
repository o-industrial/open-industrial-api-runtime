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
      const paramPath = Params.queryLookup!;

      const normalizePath = (p?: string): string | undefined => {
        if (!p) return undefined;

        if (typeof p === 'string') {
          try {
            if (p.includes('://')) {
              const url = new URL(p);
              return url.pathname.replace(/\/$/, '') || '/';
            }
          } catch {
            /* ignore URL parse failures; treat as plain path */
          }

          const withSlash = p.startsWith('/') ? p : `/${p}`;
          return withSlash.replace(/\/$/, '');
        }

        return undefined;
      };

      const desiredPath = normalizePath(paramPath)!;

      const warmQueries = State.EaC!.WarmQueries ?? {};

      let lookupKey: string | undefined = paramPath;
      let model = warmQueries[lookupKey];

      if (!model) {
        lookupKey = undefined;

        const getApiPath = (q: EaCWarmQueryAsCode): string => q.Details!.ApiPath!;

        for (const [l, mq] of Object.entries(warmQueries)) {
          const apiPath = normalizePath(getApiPath(mq));

          if (!apiPath) continue;

          if (apiPath === desiredPath || apiPath === normalizePath(paramPath)) {
            lookupKey = l;
            model = mq as typeof model;
            break;
          }
        }
      }

      if (!model || !lookupKey) {
        return Response.json(
          {
            HasError: true,
            Messages: {
              Error:
                `Warm query "${paramPath}" was not found by lookup or API path. Save it in your workspace before invoking the API.`,
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
                `Warm query "${lookupKey}" does not have any query text yet. Save a query body before invoking the API.`,
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
        lookup: lookupKey,
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
