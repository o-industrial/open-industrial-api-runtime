import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { sopRuntimes } from '../../src/api/middlewares/sopRuntimes.ts';
import type { OpenIndustrialAPIState } from '../../src/state/OpenIndustrialAPIState.ts';

export default [
  async (_req, ctx) => {
    ctx.State.OIKV = ctx.State.EaCKV = await ctx.Runtime.IoC.Resolve(
      Deno.Kv,
      'oi',
    );

    // Optional cache KV for faster cross-request retrieval of computed data
    try {
      ctx.State.CacheKV = await ctx.Runtime.IoC.Resolve(Deno.Kv, 'cache');
    } catch {
      // Cache KV not configured; endpoints should handle undefined
    }

    ctx.State.ParentSteward = await loadEaCStewardSvc();

    const jwt = await ctx.State.ParentSteward.EaC.JWT(
      ctx.State.WorkspaceLookup!,
      ctx.State.Username!,
    );

    ctx.State.EaCJWT = jwt.Token;

    if (ctx.State.EaCJWT) {
      ctx.State.Steward = await loadEaCStewardSvc(ctx.State.EaCJWT);

      ctx.State.EaC = await ctx.State.Steward.EaC.Get();
    }

    return ctx.Next();
  },
  sopRuntimes(),
] as EaCRuntimeHandlerSet<OpenIndustrialAPIState>;
