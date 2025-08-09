import type { StringCodec } from '@nats';
import type { NatsConnection } from '@nats';
import type { Impulse } from '@o-industrial/common/sop';

/**
 * Grouped NATS capabilities made available through State.NATS.
 * Includes the raw connection, encoding utility, and impulse helpers.
 */

export type OpenIndustrialImpulses = {
  /**
   * The raw NATS connection, if full access is needed.
   */
  NATS: NatsConnection;

  /**
   * StringCodec used for encoding/decoding payloads.
   */
  SC: ReturnType<typeof StringCodec>;

  /**
   * Publish a fire-and-forget impulse to the given NATS subject.
   *
   * @param subject - The NATS subject to publish to
   * @param impulse - A structured impulse message
   */
  Send: <T = unknown>(subject: string, impulse: Impulse<T>) => Promise<void>;

  /**
   * Perform a traditional NATS request-reply using `msg.respond()`.
   *
   * This method sends an impulse via `nc.request(...)` and waits
   * for a direct NATS reply from the target (not a new impulse).
   *
   * @param subject - The NATS subject to send the request to
   * @param impulse - The impulse to send
   * @param timeout - Optional timeout (default: 2000 ms)
   * @returns The JSON-parsed response from the replier
   */
  Request: <TResponse = unknown, TRequest = unknown>(
    subject: string,
    impulse: Impulse<TRequest>,
    timeout?: number,
  ) => Promise<TResponse>;

  /**
   * Emit an impulse and await a reply in the form of a **new impulse**
   * on one or more reply subjects.
   *
   * The first valid impulse received from any subject wins.
   *
   * @param publishSubject - Subject to send the original impulse
   * @param replySubjects - One or more subjects to listen on for a reply
   * @param impulse - The original impulse to publish
   * @param timeout - How long to wait for a reply (default: 2000 ms)
   * @param handler - Optional transformer to handle/shape the response
   * @returns A parsed or transformed reply
   */
  SendReply: <
    TRequest = unknown,
    TReply = unknown,
    TResponse = unknown,
  >(
    publishSubject: string,
    replySubjects: string | string[],
    impulse: Impulse<TRequest, { CorrelationID: string }>,
    handler?: (reply: Impulse<TReply>) => TResponse | Promise<TResponse>,
    timeout?: number,
  ) => Promise<TResponse>;
};
