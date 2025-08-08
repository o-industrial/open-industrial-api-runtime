// deno-lint-ignore-file no-explicit-any
import type { EaCDetails, EaCVertexDetails } from '@fathym/eac';
import { EaCRuntimeContext } from '@fathym/eac/runtime';
import { type OpenIndustrialAPIState } from '../../state/OpenIndustrialAPIState.ts';
import { SOPValidateArgs } from '../../state/SOPValidateArgs.ts';
import { StepInvokerMap } from '@o-industrial/common/fluent/steps';

type t = OpenIndustrialAPIState['SOP'];

export class StandardSOPExecutor implements t {
  constructor(protected ctx: EaCRuntimeContext<OpenIndustrialAPIState>) {}

  public async DeployValidated<
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
  ): Promise<{ result: TDeploy; lookup: string; model: TAsCode } | Response> {
    return await this.#executeValidated('Deploy', args);
  }

  public async RunValidated<
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
  ): Promise<{ result: TOutput; lookup: string; model: TAsCode } | Response> {
    return await this.#executeValidated('Run', args);
  }

  public async StatsValidated<
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
  ): Promise<{ result: TStats; lookup: string; model: TAsCode } | Response> {
    return await this.#executeValidated('Stats', args);
  }

  // -------------------------------
  // 🔒 Protected core executor
  // -------------------------------
  async #executeValidated<
    TAsCode extends EaCDetails<TDetails>,
    TDetails extends EaCVertexDetails,
    TOutput,
    TDeploy = unknown,
    TStats = unknown,
    TServices extends Record<string, unknown> = Record<string, unknown>,
    TSteps extends StepInvokerMap = StepInvokerMap
  >(
    method: 'Deploy' | 'Run' | 'Stats',
    {
      lookup,
      model,
      eac,
      kind,
      validateModel,
      validateDetails,
      buildRuntime,
      extractDetails = (m) => m.Details!,
    }: SOPValidateArgs<
      TAsCode,
      TDetails,
      TOutput,
      TDeploy,
      TStats,
      TServices,
      TSteps
    >
  ): Promise<{ result: TOutput; lookup: string; model: TAsCode } | Response> {
    const logger = this.ctx.Runtime.Logs.Package;

    logger.debug(`Running SOP.${method} for ${kind} '${lookup}'`);

    if (!validateModel(model)) {
      return Response.json({
        HasError: true,
        Messages: {
          Error: `Invalid model for '${lookup}'`,
        },
      });
    }

    const details = extractDetails(model);

    if (!validateDetails(details)) {
      return Response.json({
        HasError: true,
        Messages: {
          Error: `Model '${lookup}' does not declare correct type for '${kind}'.`,
        },
      });
    }

    const builder = buildRuntime(lookup);

    const mod: any = builder.Build();

    const runtime = new mod.Runtime();

    const context = await runtime.ConfigureContext({
      Lookup: lookup,
      AsCode: model,
      EaC: eac ?? this.ctx.State.EaC,
      IoC: this.ctx.Runtime.IoC,
      Secrets: {
        Get: (key: string) => Promise.resolve(Deno.env.get(key)),
        GetRequired: (key: string) => {
          const val = Deno.env.get(key);
          if (!val) throw new Error(`Missing required secret: ${key}`);
          return Promise.resolve(val);
        },
      },
    });

    const result = await runtime[method](context);

    return { result: result as TOutput, lookup, model };
  }
}
