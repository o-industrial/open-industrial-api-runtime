// deno-lint-ignore-file no-explicit-any
// & {
//   // /**
//   //  * NATS connection and structured impulse helpers.
//   //  */
//   // Impulses: OpenIndustrialImpulses;

import { EaCDetails, EaCVertexDetails } from '@fathym/eac';

// }
export type ActuatorAPIState = {
  Actuator: {
    DeployValidated<
      TModel extends EaCDetails<TDetails>,
      TDetails extends EaCVertexDetails,
      TOutput,
    >(args: {
      req: Request;
      kind: string;
      validateModel: (model: TModel) => boolean;
      validateDetails: (details: unknown) => details is TDetails;
      buildRuntime: (lookup: string) => {
        Build: () => { Runtime: new () => any };
      };
      extractDetails?: (model: TModel) => TDetails;
    }): Promise<{ result: TOutput; lookup: string; model: TModel } | Response>;
  };
};
