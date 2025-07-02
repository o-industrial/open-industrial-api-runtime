import { EaCActuatorErrorResponse, EaCActuatorResponse } from '@fathym/eac/steward/actuators';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import {
  EaCAzureDockerSimulatorDetails,
  EaCSimulatorAsCode,
  isEaCAzureDockerSimulatorDetails,
  isEaCSimulatorAsCode,
} from '@o-industrial/common/eac';
import {
  AzureContainerAppJobDeployOutput,
  AzureDockerSimulator,
} from '@o-industrial/common/packs/azure-iot';
import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async POST(req, { Runtime, State }) {
    const logger = Runtime.Logs.Package;

    try {
      const deployed = await State.Actuator.DeployValidated<
        EaCSimulatorAsCode<EaCAzureDockerSimulatorDetails>,
        EaCAzureDockerSimulatorDetails,
        AzureContainerAppJobDeployOutput
      >({
        req,
        kind: 'AzureDocker',
        validateModel: isEaCSimulatorAsCode,
        validateDetails: isEaCAzureDockerSimulatorDetails,
        buildRuntime: AzureDockerSimulator,
      });

      if (deployed instanceof Response) return deployed;

      const { lookup, model, result } = deployed;

      return Response.json({
        Lookup: lookup,
        Model: model,
        Output: result,
        Checks: [],
        Messages: {
          Message: `Azure Docker simulator '${lookup}' deployed.`,
        },
      } as EaCActuatorResponse);
    } catch (err) {
      logger.error(`AzureDockerSimulator actuator failed`, err);

      return Response.json({
        HasError: true,
        Messages: {
          Error: JSON.stringify(err, Object.getOwnPropertyNames(err)),
        },
      } as EaCActuatorErrorResponse);
    }
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
