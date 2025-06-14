import { IoCContainer } from '@fathym/ioc';
import { EverythingAsCode } from '@fathym/eac';
import { EaCRuntimeConfig, EaCRuntimePluginConfig } from '@fathym/eac/runtime/config';
import { EaCRuntimePlugin } from '@fathym/eac/runtime/plugins';
import { EverythingAsCodeApplications } from '@fathym/eac-applications';
import { EaCJWTValidationModifierDetails } from '@fathym/eac-applications/modifiers';
import { EaCAPIProcessor, EaCNATSProcessor } from '@fathym/eac-applications/processors';
import { EaCDenoKVDetails } from '@fathym/eac-deno-kv';
import { EaCLocalDistributedFileSystemDetails } from '@fathym/eac/dfs';

export default class RuntimePlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(config: EaCRuntimeConfig) {
    const pluginConfig: EaCRuntimePluginConfig<
      EverythingAsCode & EverythingAsCodeApplications
    > = {
      Name: RuntimePlugin.name,
      Plugins: [],
      IoC: new IoCContainer(),
      EaC: {
        Projects: {
          core: {
            Details: {
              Name: 'Sink Micro Applications',
              Description: 'The Kitchen Sink Micro Applications to use.',
              Priority: 100,
            },
            ResolverConfigs: {
              localhost: {
                Hostname: 'localhost',
                Port: config.Servers![0].port || 8000,
              },
              '127.0.0.1': {
                Hostname: '127.0.0.1',
                Port: config.Servers![0].port || 8000,
              },
              'host.docker.internal': {
                Hostname: 'host.docker.internal',
                Port: config.Servers![0].port || 8000,
              },
              'open-industrial.fathym.com': {
                Hostname: 'open-industrial.fathym.com',
              },
              'www.openindustrial.co': {
                Hostname: 'www.openindustrial.co',
              },
              'open-industrial-api-runtime.azurewebsites.net': {
                Hostname: 'open-industrial-api-runtime.azurewebsites.net',
              },
            },
            ModifierResolvers: {},
            ApplicationResolvers: {
              api: {
                PathPattern: '/api*',
                Priority: 100,
              },
            },
          },
        },
        Applications: {
          api: {
            Details: {
              Name: 'Local API',
              Description: 'Default local APIs.',
            },
            ModifierResolvers: {
              jwtValidate: {
                Priority: 10000,
              },
            },
            Processor: {
              Type: 'API',
              DFSLookup: 'local:apps/api',
            } as EaCAPIProcessor,
          },
          'nats-api': {
            Details: {
              Name: 'Local API',
              Description: 'Default local APIs.',
            },
            ModifierResolvers: {
              jwtValidate: {
                Priority: 10000,
              },
            },
            Processor: {
              Type: 'NATS',
              DFSLookup: 'local:apps/nats',
              EventRoot: 'eac',
              NATSURL: 'http://localhost:4222',
            } as EaCNATSProcessor,
          },
        },
        DenoKVs: {
          oi: {
            Details: {
              Type: 'DenoKV',
              Name: 'OI',
              Description: 'The Deno KV database to use for open industrial web',
              DenoKVPath: Deno.env.get('OPEN_INDUSTRIAL_DENO_KV_PATH') || undefined,
            } as EaCDenoKVDetails,
          },
        },
        DFSs: {
          'local:apps/api': {
            Details: {
              Type: 'Local',
              FileRoot: './apps/api/',
              DefaultFile: 'index.ts',
              Extensions: ['ts'],
            } as EaCLocalDistributedFileSystemDetails,
          },
        },
        Modifiers: {
          jwtValidate: {
            Details: {
              Type: 'JWTValidation',
              Name: 'Validate JWT',
              Description: 'Validate incoming JWTs to restrict access.',
            } as EaCJWTValidationModifierDetails,
          },
        },
        $GlobalOptions: {
          DFSs: {
            PreventWorkers: true,
          },
        },
      },
    };

    return Promise.resolve(pluginConfig);
  }
}
