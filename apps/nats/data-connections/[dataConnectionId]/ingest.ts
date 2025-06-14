// import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
// import { Impulse } from '@o-industrial/common/sop';
// import { OpenIndustrialAPIState } from '../../../../src/state/OpenIndustrialAPIState.ts';
// // import { sendToIoTHub } from '../../../../src/utils/sendToIoTHub.ts';

// export default {
//   async POST(_req, _ctx) {
//     // const dataConnectionId = ctx.Params?.dataConnectionId;

//     // if (!dataConnectionId) {
//     //   return Response.json({ Message: 'Missing dataConnectionId' }, { status: 400 });
//     // }

//     // const connection = await getDataConnectionByID(dataConnectionId);

//     // if (!connection) {
//     //   return Response.json({ Message: 'Data connection not found' }, { status: 404 });
//     // }

//     // const payload = await req.json();

//     // switch (connection.SourceType) {
//     //   case 'http': {
//     //     const impulse: Impulse = {
//     //       Headers: {
//     //         DataConnectionID: connection.DataConnectionID,
//     //         IngestedAt: new Date().toISOString(),
//     //         RequestID: crypto.randomUUID(),
//     //       },
//     //       Payload: payload,
//     //     };

//     //     const subject = `impulse.${ctx.State.EnterpriseLookup}.data.${dataConnectionId}`;

//     //     await ctx.State.Impulses.Send(subject, impulse);

//     //     return Response.json({ Message: 'HTTP data ingested as impulse.' });
//     //   }

//     //   case 'data-hub': {
//     //     const result = await sendToIoTHub(
//     //       connection.Config.DataHubIngestConnectionString,
//     //       payload
//     //     );

//     //     return Response.json({
//     //       Message: 'Data forwarded to Azure IoT Hub.',
//     //       Result: result,
//     //     });
//     //   }

//     //   default:
//     //     return Response.json(
//     //       { Message: `Unsupported source type: ${connection.SourceType}` },
//     //       { status: 400 }
//     //     );
//     // }

//     return Response.json(
//       {
//         Message: 'Not implemented.',
//         // Result: result,
//       },
//       { status: 400 },
//     );
//   },
// } as EaCRuntimeHandlers<OpenIndustrialAPIState>;
