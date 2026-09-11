import { NextRequest, NextResponse } from 'next/server';

interface CarouselCard {
  imageUrl: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  buttonParameter: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      recipient,
      templateName,
      language,
      bodyParameter,
      cards,
    }: {
      recipient: string;
      templateName: string;
      language: string;
      bodyParameter: string;
      cards: CarouselCard[];
    } = await req.json();

    if (!recipient) {
      return NextResponse.json(
        {
          success: false,
          message: 'Recipient number is required',
        },
        { status: 400 }
      );
    }

    if (!templateName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template name is required',
        },
        { status: 400 }
      );
    }

    if (!cards || cards.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'Carousel cards are required',
        },
        { status: 400 }
      );
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

    if (!token || !phoneNumberId) {
      return NextResponse.json(
        {
          success: false,
          message: 'WhatsApp environment variables are missing',
        },
        { status: 500 }
      );
    }

    const carouselCards = cards.map((card, index) => ({
      card_index: index,

      components: [
        {
          type: 'HEADER',

          parameters: [
            {
              type: 'image',

              image: {
                link: card.imageUrl,
              },
            },
          ],
        },

        {
          type: 'BUTTON',

          sub_type: 'URL',

          index: '0',

          parameters: [
            {
              type: 'text',
              text: card.buttonParameter,
            },
          ],
        },
      ],
    }));

    const payload = {
      messaging_product: 'whatsapp',

      to: recipient,

      type: 'template',

      template: {
        name: templateName,

        language: {
          code: language,
        },

        components: [
          {
            type: 'BODY',

            parameters: [
              {
                type: 'text',
                text: bodyParameter,
              },
            ],
          },

          {
            type: 'CAROUSEL',

            cards: carouselCards,
          },
        ],
      },
    };

    console.log('WhatsApp carousel payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WHATSAPP SEND ERROR:', JSON.stringify(data, null, 2));

      return NextResponse.json(
        {
          success: false,
          message: data?.error?.message || 'Failed to send WhatsApp message',

          error: data?.error,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Carousel message sent successfully',
      data,
    });
  } catch (error) {
    console.error('SEND CAROUSEL ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}
