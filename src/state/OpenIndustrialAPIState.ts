import type { EaCState } from '@fathym/eac-applications/steward/api';
import { EverythingAsCodeOIWorkspace } from '@o-industrial/common/eac';
import { OpenIndustrialJWTPayload } from '@o-industrial/common/types';
import { SOPAPIState } from './SOPAPIState.ts';
// import { OpenIndustrialImpulses } from './OpenIndustrialImpulses.ts';

/**
 * State passed to all OpenIndustrial API route handlers.
 * Includes identity and shared runtime interfaces for execution-aware routing.
 */
export type OpenIndustrialAPIState =
  & {
    OIKV: Deno.Kv;
  }
  & OpenIndustrialJWTPayload
  & EaCState<EverythingAsCodeOIWorkspace>
  & SOPAPIState;
