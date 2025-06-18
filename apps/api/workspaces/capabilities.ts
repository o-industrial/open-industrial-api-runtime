import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';

export default {
  async GET(_req, ctx) {
    const packs = ctx.State.EaC?.Packs ?? {};

    const urls: string[] = [];

    for (const key in packs) {
      const pack = packs[key];
      const path = pack?.Details?.Path;

      if (!path || pack?.Details?.Enabled === false) continue;

      const bundleProcess = new Deno.Command('deno', {
        args: ['bundle', path],
        stdout: 'piped',
        stderr: 'piped',
      });

      const { code, stdout, stderr } = await bundleProcess.output();

      if (code !== 0) {
        const errorText = new TextDecoder().decode(stderr);
        console.error(`❌ Failed to bundle pack [${key}]:`, errorText);
        return new Response(`Error bundling pack: ${errorText}`, { status: 500 });
      }

      const bundledJS = new TextDecoder().decode(stdout);
      const base64JS = btoa(bundledJS);
      const dataURL = `data:application/javascript;base64,${base64JS}`;

      urls.push(dataURL);
    }

    return new Response(urls[0], {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-Capability-Pack': 'data-url',
      },
    });
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
