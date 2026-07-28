// import { NextResponse } from 'next/server';
// import { SendEmailCommand } from '@aws-sdk/client-ses';
// import { ses } from '@/lib/ses';

// export async function POST(req: Request) {
//   try {
//     const { to, subject, html } = await req.json();

//     const recipients = Array.isArray(to) ? to : [to];

//     const messageIds: string[] = [];

//     for (const email of recipients) {
//       const result = await ses.send(
//         new SendEmailCommand({
//           Source: process.env.AWS_SES_FROM_EMAIL!,
//           Destination: {
//             ToAddresses: [email],
//           },
//           Message: {
//             Subject: {
//               Data: subject,
//             },
//             Body: {
//               Html: {
//                 Data: html,
//               },
//             },
//           },
//         })
//       );

//       if (result.MessageId) {
//         messageIds.push(result.MessageId);
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       total: recipients.length,
//       messageIds,
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { ses } from '@/lib/ses';

const BATCH_SIZE = 50;

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    const recipients: string[] = Array.isArray(to) ? to : [to];

    const messageIds: string[] = [];
    const failedEmails: string[] = [];

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (email) => {
          const result = await ses.send(
            new SendEmailCommand({
              Source: process.env.AWS_SES_FROM_EMAIL!,
              Destination: {
                ToAddresses: [email],
              },
              Message: {
                Subject: {
                  Data: subject,
                },
                Body: {
                  Html: {
                    Data: html,
                  },
                },
              },
            })
          );

          return {
            email,
            messageId: result.MessageId,
          };
        })
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.messageId) {
            messageIds.push(result.value.messageId);
          }
        } else {
          failedEmails.push(batch[index]);
          console.error(`Failed to send email to ${batch[index]}`, result.reason);
        }
      });

      console.log(
        `Batch ${Math.floor(i / BATCH_SIZE) + 1} completed (${Math.min(
          i + BATCH_SIZE,
          recipients.length
        )}/${recipients.length})`
      );

      // Optional delay between batches
      // await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      total: recipients.length,
      sent: messageIds.length,
      failed: failedEmails.length,
      failedEmails,
      messageIds,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}