import { NextResponse } from 'next/server';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { ses } from '@/lib/ses';

export async function POST(req: Request) {
  console.log('========== AWS SES API ==========');

  try {
    console.log('Reading request body...');

    const body = await req.json();

    console.log('Request Body:', body);

    const { to, subject, html } = body;

    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Region:', process.env.AWS_REGION);
    console.log('From:', process.env.AWS_SES_FROM_EMAIL);

    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
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
    });

    console.log('Sending email to AWS SES...');

    const response = await ses.send(command);

    console.log('AWS SES Response:');
    console.log(response);

    console.log('Message ID:', response.MessageId);

    console.log('Email sent successfully.');

    return NextResponse.json({
      success: true,
      message: 'Email Sent',
      messageId: response.MessageId,
    });
  } catch (error: any) {
    console.log('========== ERROR ==========');

    console.error('Full Error:', error);

    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.Code || error.code);

    if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
      console.error('Request ID:', error.$metadata.requestId);
    }

    console.log('===========================');

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed',
        error: error.name,
      },
      {
        status: 500,
      }
    );
  }
}
