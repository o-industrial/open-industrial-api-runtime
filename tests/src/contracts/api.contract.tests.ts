import { assertEquals } from '../../tests.deps.ts';
import { z } from 'npm:zod@3.23.8';
import handlers from '../../../apps/api/index.ts';

const AnyObject = z.record(z.any());

Deno.test('GET /api contract: returns object (EaC projection)', async () => {
  const ctx: any = { State: { EaC: { Hello: 'World', Version: 1 } } };
  const res = await (handlers as any).GET(new Request('http://localhost/api'), ctx);
  assertEquals(res.headers.get('content-type')?.startsWith('application/json'), true);
  const body = await res.json();
  AnyObject.parse(body);
});

