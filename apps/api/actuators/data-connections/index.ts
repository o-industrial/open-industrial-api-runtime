import {
  AzureIoTHubDataConnection,
  AzureIoTHubDeviceOutput,
} from '@o-industrial/common/packs/azure-iot';
import {
  EaCActuatorErrorResponse,
  EaCActuatorRequest,
  EaCActuatorResponse,
} from '@fathym/eac/steward/actuators';
import {
  EaCAzureIoTHubDataConnectionDetails,
  EaCDataConnectionAsCode,
  isEaCAzureIoTHubDataConnectionDetails,
  isEaCDataConnectionAsCode,
} from '@o-industrial/common/eac';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async POST(req, { Runtime, State }) {
    const logger = Runtime.Logs.Package;

    try {
      const actuatorRequest: EaCActuatorRequest = await req.json();

      const deployed = await State.SOP.DeployValidated<
        EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
        EaCAzureIoTHubDataConnectionDetails,
        AzureIoTHubDeviceOutput
      >({
        lookup: actuatorRequest.Lookup,
        model: actuatorRequest.Model,
        eac: actuatorRequest.EaC,
        kind: 'Azure IoT Hub',
        validateModel: isEaCDataConnectionAsCode,
        validateDetails: isEaCAzureIoTHubDataConnectionDetails,
        buildRuntime: AzureIoTHubDataConnection,
      });

      // If DeployValidated returns a Response (i.e. a validation error), return it directly
      if (deployed instanceof Response) return deployed;

      const { lookup, model, result } = deployed;

      return Response.json({
        Checks: [],
        Lookup: lookup,
        Messages: {
          Message: `Run completed for '${lookup}'`,
        },
        Model: model,
        Output: result,
      } as EaCActuatorResponse);
    } catch (err) {
      logger.error(`Actuator run failed`);
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
