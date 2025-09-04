import { assertEquals } from '../../tests.deps.ts';
import { connect, StringCodec } from '@nats';

Deno.test('NATS pub/sub roundtrip (skips if server unavailable)', async () => {
  let nc;
  try {
    nc = await connect({ servers: 'nats://localhost:4222', timeout: 1000 });
  } catch (_err) {
    // Skip test if NATS is not running locally
    console.log('Skipping NATS test: unable to connect to localhost:4222');
    return;
  }

  try {
    const sc = StringCodec();
    const subject = `test.oi.${crypto.randomUUID()}`;
    const sub = nc.subscribe(subject, { max: 1 });

    // Publish after subscription is active
    const payload = 'hello-oi';
    const pub = nc.publish(subject, sc.encode(payload));

    // Await first message
    const msg = await (async () => {
      for await (const m of sub) return m;
    })();

    assertEquals(sc.decode(msg!.data), payload);
    await pub;
  } finally {
    await nc!.drain();
  }
});

