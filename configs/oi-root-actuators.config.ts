import { EaCModuleActuators } from '@fathym/eac';

export const loadOpenIndustrialRootActuators: () => EaCModuleActuators = () => {
  const base = Deno.env.get('OPEN_INDUSTRIAL_ACTUATORS_ROOT');

  return {
    $Force: true,
    Licenses: {
      APIPath: new URL('./steward/licenses', base),
      Order: 200,
    },
  } as unknown as EaCModuleActuators;
};
