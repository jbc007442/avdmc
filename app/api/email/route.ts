import { NextResponse } from 'next/server';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { ses } from '@/lib/ses';

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    const recipients = Array.isArray(to) ? to : [to];

    const messageIds: string[] = [];

    for (const email of recipients) {
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

      if (result.MessageId) {
        messageIds.push(result.MessageId);
      }
    }

    return NextResponse.json({
      success: true,
      total: recipients.length,
      messageIds,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}