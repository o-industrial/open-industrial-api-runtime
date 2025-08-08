// deno-lint-ignore-file no-explicit-any

import type { EaCDetails, EaCVertexDetails } from '@fathym/eac';
import type { StepInvokerMap } from '@o-industrial/common/fluent/steps';
import type { SOPValidateArgs } from './SOPValidateArgs.ts';

export type SOPAPIState = {
  SOP: {
    DeployValidated<
      TAsCode extends EaCDetails<TDetails>,
      TDetails extends EaCVertexDetails,
      TDeploy,
      TServices extends Record<string, unknown> = Record<string, unknown>,
      TSteps extends StepInvokerMap = StepInvokerMap
    >(
      args: SOPValidateArgs<
        TAsCode,
        TDetails,
        any,
        TDeploy,
        any,
        TServices,
        TSteps
      >
    ): Promise<{ result: TDeploy; lookup: string; model: TAsCode } | Response>;

    RunValidated<
      TAsCode extends EaCDetails<TDetails>,
      TDetails extends EaCVertexDetails,
      TOutput,
      TServices extends Record<string, unknown> = Record<string, unknown>,
      TSteps extends StepInvokerMap = StepInvokerMap
    >(
      args: SOPValidateArgs<
        TAsCode,
        TDetails,
        TOutput,
        any,
        any,
        TServices,
        TSteps
      >
    ): Promise<{ result: TOutput; lookup: string; model: TAsCode } | Response>;

    StatsValidated<
      TAsCode extends EaCDetails<TDetails>,
      TDetails extends EaCVertexDetails,
      TStats,
      TServices extends Record<string, unknown> = Record<string, unknown>,
      TSteps extends StepInvokerMap = StepInvokerMap
    >(
      args: SOPValidateArgs<
        TAsCode,
        TDetails,
        any,
        any,
        TStats,
        TServices,
        TSteps
      >
    ): Promise<{ result: TStats; lookup: string; model: TAsCode } | Response>;
  };
};
