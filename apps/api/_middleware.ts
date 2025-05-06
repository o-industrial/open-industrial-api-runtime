import type { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../src/state/OpenIndustrialAPIState.ts';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';

export default (async (_req, ctx) => {
  ctx.State.EaCKV = await ctx.Runtime.IoC.Resolve(Deno.Kv, 'oi');

  ctx.State.ParentSteward = await loadEaCStewardSvc();

  const jwt = await ctx.State.ParentSteward.EaC.JWT(
    ctx.State.WorkspaceLookup!,
    ctx.State.Username!,
  );

  ctx.State.EaCJWT = jwt.Token;

  ctx.State.Steward = await loadEaCStewardSvc(ctx.State.EaCJWT);

  ctx.State.EaC = await ctx.State.Steward.EaC.Get();

  return ctx.Next();
}) as EaCRuntimeHandler<OpenIndustrialAPIState>;
