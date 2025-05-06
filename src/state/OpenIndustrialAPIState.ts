import type { EaCState } from '@fathym/eac-applications/steward/api';
import { OpenIndustrialEaC, OpenIndustrialJWTPayload } from '@o-industrial/common/types';
// import { OpenIndustrialImpulses } from './OpenIndustrialImpulses.ts';

/**
 * State passed to all OpenIndustrial API route handlers.
 * Includes identity and shared runtime interfaces for execution-aware routing.
 */
export type OpenIndustrialAPIState =
  // & {
  //   // /**
  //   //  * NATS connection and structured impulse helpers.
  //   //  */
  //   // Impulses: OpenIndustrialImpulses;
  // }
  OpenIndustrialJWTPayload & EaCState<OpenIndustrialEaC>;
