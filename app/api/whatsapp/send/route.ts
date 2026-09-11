import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export async function POST(req: NextRequest) {
  try {
    const {
      phone,
      template,
      language = 'en',
      htype,
      mediaUrl,
      parameters = [],
      cards,
    } = await req.json();

    if (!phone || !template) {
      return NextResponse.json(
        { success: false, message: 'Phone & template required' },
        { status: 400 }
      );
    }

    // FIX 1: Ensure country code
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`; // your case
    if (!cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      // you can add validation here
    }

    const body: any = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: { name: template, language: { code: language } },
    };

    const components: any[] = [];

    // FIX 2: htype must be lowercase for API
    if (htype && mediaUrl && !cards) {
      const type = htype.toLowerCase() as 'image' | 'video' | 'document';
      components.push({
        type: 'header',
        parameters: [{ type, [type]: { link: mediaUrl } }],
      });
    }

    if (parameters.length && !cards) {
      components.push({
        type: 'body',
        parameters: parameters.map((param: any) => {
          if (param.parameter_name)
            return { type: 'text', parameter_name: param.parameter_name, text: param.text };
          return { type: 'text', text: param.text || String(param) };
        }),
      });
    }

    if (cards && cards.length >= 2) {
      if (parameters.length) {
        components.push({
          type: 'body',
          parameters: parameters.map((p: any) => ({ type: 'text', text: p.text })),
        });
      }
      components.push({
        type: 'carousel',
        cards: cards.map((card: any, index: number) => ({
          card_index: index,
          components: [
            { type: 'header', parameters: [{ type: 'image', image: { link: card.imageUrl } }] },
            ...(card.bodyParams?.length
              ? [
                  {
                    type: 'body',
                    parameters: card.bodyParams.map((t: string) => ({ type: 'text', text: t })),
                  },
                ]
              : []),
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [{ type: 'text', text: card.buttonParameter }],
            },
          ],
        })),
      });
    }

    if (components.length) body.template.components = components;

    console.log('WHATSAPP REQUEST:', JSON.stringify(body, null, 2));

    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    console.log('WHATSAPP RESPONSE:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      request: body,
      response: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
