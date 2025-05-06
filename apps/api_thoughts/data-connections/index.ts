import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialAPIState } from '../../../src/state/OpenIndustrialAPIState.ts';
import type {
  CreateDataConnectionCreatedImpulse,
  CreateDataConnectionImpulse,
} from '@o-industrial/common/api';

/**
 * API route handler for declaring a new data connection.
 *
 * This endpoint accepts a POST request containing a `CreateDataConnectionImpulse`
 * payload and publishes it as an impulse into the OpenIndustrial execution lattice
 * under the subject: `impulse.{ParentEnterprise}.data-connections.create.{Enterprise}.{CorrelationID}`.
 *
 * No side effects or persistence occur at this layer—agents will process the impulse
 * downstream as needed.
 */
export default {
  /**
   * Accepts a CreateDataConnectionImpulse request and emits it as a structured impulse.
   *
   * @param req - The HTTP request (must contain valid JSON).
   * @param ctx - The runtime execution context, including NATS and identity.
   * @returns A JSON response confirming impulse submission or validation failure.
   */
  async POST(req, ctx) {
    const request = (await req.json()) as CreateDataConnectionImpulse;

    if (!request?.Name || !request?.SourceType) {
      return Response.json(
        { Message: 'Missing required fields.' },
        { status: 400 },
      );
    }

    const parentEnterprise = ctx.Runtime.EaC.EnterpriseLookup!;

    const enterprise = ctx.State.EnterpriseLookup!;

    const correlationId = crypto.randomUUID();

    const subject = `impulse.${parentEnterprise}.data-connections.create.${enterprise}`;

    return await ctx.State.Impulses.SendReply<
      CreateDataConnectionImpulse,
      CreateDataConnectionCreatedImpulse
    >(
      subject,
      `${subject}.created.${correlationId}`,
      {
        Headers: {
          CorrelationID: correlationId,
        },
        Payload: request,
      },
      (reply) => {
        if (reply.Payload.SourceType == 'data-hub') {
          ctx.Runtime.Logs.Package.debug(`Received creation of Data Hub data connection.`);
        } else {
          ctx.Runtime.Logs.Package.debug(`Received creation of HTTP data connection.`);
        }

        return Response.json({
          Message: 'Data connection impulse submitted.',
          Connection: reply.Payload,
        });
      },
      30,
    );
  },
} as EaCRuntimeHandlers<OpenIndustrialAPIState>;
