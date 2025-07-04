import type { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../state/OpenIndustrialAPIState.ts';
import { StandardSOPExecutor } from './StandardSOPExecutor.ts';

export const sopRuntimes = () =>
  ((_req, ctx) => {
    const { IoC, Logs } = ctx.Runtime;

    // ctx.State.SOP = {
    //   async DeployValidated<
    //     TModel extends { Details?: TDetails },
    //     TDetails,
    //     TOutput,
    //   >({
    //     req,
    //     kind,
    //     validateModel,
    //     validateDetails,
    //     buildRuntime,
    //     extractDetails = (m) => m.Details!,
    //   }: {
    //     req: Request;
    //     kind: string;
    //     validateModel: (model: unknown) => model is TModel;
    //     validateDetails: (details: unknown) => details is TDetails;
    //     buildRuntime: (lookup: string) => {
    //       Build: () => { Runtime: new () => any };
    //     };
    //     extractDetails?: (model: TModel) => TDetails;
    //   }): Promise<{ result: TOutput; lookup: string; model: TModel } | Response> {
    //     const logger = Logs.Package;

    //     const actuatorRequest = await req.json();

    //     const lookup = actuatorRequest.Lookup;
    //     const model = actuatorRequest.Model;

    //     logger.debug(`Running actuator for ${kind} '${lookup}'`);

    //     if (!validateModel(model)) {
    //       return Response.json({
    //         HasError: true,
    //         Messages: {
    //           Error: `Invalid model for '${lookup}'`,
    //         },
    //       });
    //     }

    //     const details = extractDetails(model);

    //     if (!validateDetails(details)) {
    //       return Response.json({
    //         HasError: true,
    //         Messages: {
    //           Error: `Model '${lookup}' does not declare correct type for '${kind}'.`,
    //         },
    //       });
    //     }

    //     const runtime = new (buildRuntime(lookup).Build().Runtime)();

    //     const context = await runtime.ConfigureContext({
    //       Lookup: lookup,
    //       AsCode: model,
    //       EaC: actuatorRequest.EaC ?? ctx.State.EaC,
    //       IoC,
    //       Secrets: {
    //         Get(key: string) {
    //           return Promise.resolve(Deno.env.get(key));
    //         },
    //         GetRequired(key: string) {
    //           const val = Deno.env.get(key);
    //           if (!val) throw new Error(`Missing required secret: ${key}`);
    //           return Promise.resolve(val);
    //         },
    //       },
    //     });

    //     return { result: await runtime.Deploy(context), lookup, model };
    //   },
    // };

    ctx.State.SOP = new StandardSOPExecutor(ctx);

    return ctx.Next();
  }) as EaCRuntimeHandler<OpenIndustrialAPIState>;
