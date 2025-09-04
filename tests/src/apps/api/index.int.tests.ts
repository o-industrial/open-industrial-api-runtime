import { assert, assertEquals } from '../../../tests.deps.ts';
import handlers from '../../../../apps/api/index.ts';

Deno.test('API GET /api returns EaC state', async () => {
  const ctx: any = { State: { EaC: { Hello: 'World' } } };
  assert(typeof (handlers as any).GET === 'function');
  const res = await (handlers as any).GET(new Request('http://localhost/api'), ctx);
  assertEquals(res.headers.get('content-type')?.startsWith('application/json'), true);
  const body = await res.json();
  assertEquals(body, { Hello: 'World' });
});
