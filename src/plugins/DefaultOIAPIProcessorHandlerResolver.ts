import {
  DefaultProcessorHandlerResolver,
  ProcessorHandlerResolver,
} from '@fathym/eac-applications/runtime/processors';
import { IoCContainer } from '@fathym/ioc';
import { EaCApplicationProcessorConfig } from '@fathym/eac-applications/processors';
import { EverythingAsCode } from '@fathym/eac';
import { DefaultOpenIndustrialProcessorHandlerResolver } from '@o-industrial/common/runtimes';
import { EverythingAsCodeApplications } from '@fathym/eac-applications';

export class DefaultOIAPIProcessorHandlerResolver implements ProcessorHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac: EverythingAsCode & EverythingAsCodeApplications,
  ) {
    const oiResolver = new DefaultOpenIndustrialProcessorHandlerResolver();

    let resolver = await oiResolver.Resolve(ioc, appProcCfg, eac);

    if (!resolver) {
      const defaultResolver = new DefaultProcessorHandlerResolver();

      resolver = await defaultResolver.Resolve(ioc, appProcCfg, eac);
    }

    return resolver;
  }
}
