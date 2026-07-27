import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export async function POST(req: NextRequest) {
  try {
    const { phone, template, language = 'en', htype, mediaUrl, parameters = [] } = await req.json();

    if (!phone || !template) {
      return NextResponse.json(
        { success: false, message: 'Phone & template required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // FIX 1: Use language as-is, don't force to en_US
    const body: any = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: template,
        language: { code: language },
      },
    };

    const components: any[] = [];

    if (htype && mediaUrl) {
      components.push({
        type: 'header',
        parameters: [{ type: htype, [htype]: { link: mediaUrl } }],
      });
    }

    // FIX 2: Correctly handle {{name}} named parameter
    if (parameters.length) {
      components.push({
        type: 'body',
        parameters: parameters.map((param: any) => {
          if (typeof param === 'object' && param !== null && param.parameter_name) {
            return {
              type: 'text',
              parameter_name: param.parameter_name,
              text: param.text,
            };
          }
          if (typeof param === 'object' && param !== null && param.text) {
            return { type: 'text', text: param.text };
          }
          return { type: 'text', text: String(param) };
        }),
      });
    }

    if (components.length) body.template.components = components;

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
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

