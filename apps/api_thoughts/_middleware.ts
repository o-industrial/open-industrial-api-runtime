// import { connect, headers as createHeaders, StringCodec } from '@nats';
// import type { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';
// import type { OpenIndustrialAPIState } from '../../src/state/OpenIndustrialAPIState.ts';
// import { loadJwtConfig } from '@fathym/common';

// /**
//  * Middleware to inject NATS connectivity and helper methods into the runtime state.
//  * Loads connection config from the `NATS_URL` environment variable or defaults to localhost.
//  */
// export default (async (_req, ctx) => {
//   const servers = Deno.env.get('NATS_URL') ?? 'nats://localhost:4222';

//   const nc = await connect({
//     servers,
//     name: 'openindustrial-api',
//   });

//   const sc = StringCodec();

//   const headers = createHeaders();

//   const [parentJWT] = await Promise.all([
//     loadJwtConfig().Create({
//       EnterpriseLookup: ctx.Runtime.EaC.EnterpriseLookup!,
//       Username: ctx.State.Username,
//     }),
//     loadJwtConfig().Create({
//       EnterpriseLookup: ctx.State.EnterpriseLookup!,
//       Username: ctx.State.Username,
//     }),
//   ]);

//   headers.set('ParentEnterpriseJWT', parentJWT);

//   headers.set('EnterpriseJWT', parentJWT);

//   ctx.State.Impulses = {
//     NATS: nc,
//     SC: sc,

//     /**
//      * Publish a one-way impulse to the given subject.
//      */
//     Send: async (subject, impulse) => {
//       nc.publish(subject, sc.encode(JSON.stringify(impulse)), { headers });
//       await nc.flush();
//     },

//     /**
//      * Classic request-reply using NATS `msg.respond()` and `nc.request(...)`.
//      * Used when the responder sends a direct reply to the inbox.
//      */
//     Request: async (subject, impulse, timeout = 2000) => {
//       const msg = await nc.request(
//         subject,
//         sc.encode(JSON.stringify(impulse)),
//         {
//           timeout,
//           headers,
//         },
//       );

//       return JSON.parse(sc.decode(msg.data));
//     },

//     /**
//      * Publish an impulse and subscribe to a different subject to receive a follow-up impulse.
//      * This is used in systems where execution emits result impulses, not direct replies.
//      */
//     SendReply: async (
//       publishSubject,
//       replySubjects,
//       impulse,
//       handler,
//       timeout = 2000,
//     ) => {
//       const subjects = Array.isArray(replySubjects) ? replySubjects : [replySubjects];

//       const subs = subjects.map((subject) => nc.subscribe(subject, { max: 1 }));

//       // Publish the impulse after subscriptions are ready
//       nc.publish(publishSubject, sc.encode(JSON.stringify(impulse)));

//       // Listen for the first response from any subscription
//       const timers: number[] = [];

//       const races = subs.map((sub) => {
//         return (async () => {
//           const timer = setTimeout(() => sub.unsubscribe(), timeout);

//           timers.push(timer);

//           for await (const msg of sub) {
//             clearTimeout(timer);

//             const decoded = JSON.parse(sc.decode(msg.data));

//             return handler ? await handler(decoded) : decoded;
//           }

//           throw new Error(
//             `No response received on subject: ${sub.getSubject()}`,
//           );
//         })();
//       });

//       // Race across all reply subjects
//       try {
//         const result = await Promise.race(races);

//         return result;
//       } catch {
//         throw new Error(
//           `Timeout waiting for reply on subjects: ${subjects.join(', ')}`,
//         );
//       } finally {
//         subs.forEach((sub) => sub.unsubscribe());
//         timers.forEach((timer) => clearTimeout(timer));
//       }
//     },
//   };

//   return ctx.Next();
// }) as EaCRuntimeHandler<OpenIndustrialAPIState>;
