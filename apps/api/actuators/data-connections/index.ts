import { AzureIoTHubDataConnection } from '@o-industrial/common/packs/azure-iot';
import {
  EaCActuatorErrorResponse,
  EaCActuatorRequest,
  EaCActuatorResponse,
} from '@fathym/eac/steward/actuators';
import {
  EaCAzureIoTHubDataConnectionDetails,
  EaCDataConnectionAsCode,
  EverythingAsCodeOIWorkspace,
  isEaCAzureIoTHubDataConnectionDetails,
} from '@o-industrial/common/eac';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';

export default {
  async POST(req, { Runtime }) {
    const logger = Runtime.Logs;

    try {
      const handlerRequest: EaCActuatorRequest = await req.json();

      const eac = handlerRequest.EaC as EverythingAsCodeOIWorkspace;
      const lookup = handlerRequest.Lookup;
      const model = handlerRequest.Model as EaCDataConnectionAsCode;

      logger.Package.debug(
        `Running actuator for IoT data connection '${lookup}'`
      );

      // Safety check: ensure it's a valid Azure IoT Hub connection
      if (!isEaCAzureIoTHubDataConnectionDetails(model.Details)) {
        return Response.json({
          HasError: true,
          Messages: {
            Error: `Unsupported data connection type for '${lookup}'`,
          },
        } as EaCActuatorErrorResponse);
      }

      const runtime = new (AzureIoTHubDataConnection(lookup).Build().Runtime)();

      const ctx = await runtime.ConfigureContext({
        Lookup: lookup,
        AsCode:
          model as EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
        EaC: eac,
        IoC: Runtime.IoC,
        Secrets: {
          Get(key: string) {
            return Promise.resolve(Deno.env.get(key));
          },
          GetRequired(key: string) {
            return Promise.resolve(Deno.env.get(key)!);
          },
        },
      });

      const output = await runtime.Run(ctx);

      return Response.json({
        Checks: [],
        Lookup: lookup,
        Messages: {
          Message: `Run completed for '${lookup}'`,
        },
        Model: model,
        Output: output,
      } as EaCActuatorResponse);
    } catch (err) {
      logger.Package.error(`Actuator run failed`, err);

      return Response.json({
        HasError: true,
        Messages: {
          Error: JSON.stringify(err),
        },
      } as EaCActuatorErrorResponse);
    }
  },
} as EaCRuntimeHandlers;
