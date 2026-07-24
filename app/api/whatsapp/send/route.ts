import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v25.0';

export async function POST(req: NextRequest) {
  try {
    const { phone, template, language = 'en', htype, mediaUrl, parameters = [] } = await req.json();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number is required',
        },
        { status: 400 }
      );
    }

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template name is required',
        },
        { status: 400 }
      );
    }

    const body: any = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: template,
        language: {
          code: language,
        },
      },
    };

    if (htype && mediaUrl) {
      body.template.components = [
        {
          type: 'header',
          parameters: [
            {
              type: htype,
              [htype]: {
                link: mediaUrl,
              },
            },
          ],
        },
      ];
    }

    if (parameters.length) {
      body.template.components = body.template.components || [];

      body.template.components.push({
        type: 'body',
        parameters: parameters.map((value: string) => ({
          type: 'text',
          text: value,
        })),
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      request: body,
      response: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
