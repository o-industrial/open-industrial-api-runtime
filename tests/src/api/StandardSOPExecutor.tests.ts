import { assert, assertEquals } from '../../tests.deps.ts';
import { StandardSOPExecutor } from '../../../src/api/middlewares/StandardSOPExecutor.ts';
import { IoCContainer } from '@fathym/ioc';

Deno.test('StandardSOPExecutor - DeployValidated success path', async () => {
  const ctx: any = {
    Runtime: {
      Logs: { Package: { debug: (_: string) => {} } },
      IoC: new IoCContainer(),
    },
    State: { EaC: { some: 'eac' } },
  };

  const exec = new StandardSOPExecutor(ctx);

  const model = { Details: { name: 'demo' } } as any;

  const res = await exec.DeployValidated({
    lookup: 'demo-lookup',
    kind: 'TestKind',
    model,
    validateModel: (m: any): m is typeof model => Boolean(m?.Details),
    validateDetails: (d: any): d is { name: string } => Boolean(d?.name),
    buildRuntime: () => ({
      Build: () => ({
        Runtime: class {
          async ConfigureContext(args: any) {
            return args;
          }
          async Deploy() {
            return { deployed: true };
          }
          async Run() {
            return { ran: true };
          }
          async Stats() {
            return { ok: 1 };
          }
        },
      }),
    }),
  } as any);

  assert(!(res instanceof Response));
  assertEquals((res as any).lookup, 'demo-lookup');
  assertEquals((res as any).model, model);
  assertEquals((res as any).result, { deployed: true });
});

Deno.test('StandardSOPExecutor - invalid model returns error response', async () => {
  const ctx: any = {
    Runtime: {
      Logs: { Package: { debug: (_: string) => {} } },
      IoC: new IoCContainer(),
    },
    State: { EaC: {} },
  };

  const exec = new StandardSOPExecutor(ctx);

  const res = await exec.RunValidated({
    lookup: 'bad',
    kind: 'TestKind',
    model: {},
    validateModel: () => false,
    validateDetails: () => true,
    buildRuntime: () => ({ Build: () => ({ Runtime: class {} }) }),
  } as any);

  assert(res instanceof Response);
  const body = await (res as Response).json();
  assertEquals(body.HasError, true);
});
