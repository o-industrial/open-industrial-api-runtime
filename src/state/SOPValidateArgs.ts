import type { FluentModuleBuilder, FluentRuntime } from '@o-industrial/common/fluent';

import type { EaCDetails, EaCVertexDetails, EverythingAsCode } from '@fathym/eac';
import type { StepInvokerMap } from '@o-industrial/common/fluent/steps';
import type { FluentContext } from '@o-industrial/common/fluent/types';

export type SOPValidateArgs<
  TAsCode extends EaCDetails<TDetails>,
  TDetails extends EaCVertexDetails,
  TOutput,
  TDeploy = unknown,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
  TContext extends FluentContext<TAsCode, TServices, TSteps> = FluentContext<
    TAsCode,
    TServices,
    TSteps
  >,
  TRuntime extends FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    TContext
  > = FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    TContext
  >,
  TBuilder extends FluentModuleBuilder<
    TAsCode,
    TContext,
    TRuntime,
    unknown,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  > = FluentModuleBuilder<
    TAsCode,
    TContext,
    TRuntime,
    unknown,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  >,
> = {
  lookup: string;
  model: TAsCode;
  eac?: EverythingAsCode;
  kind: string;
  validateModel: (model: unknown) => boolean;
  validateDetails: (details: unknown) => details is TDetails;
  buildRuntime: (lookup: string) => TBuilder;
  extractDetails?: (model: TAsCode) => TDetails;
};
