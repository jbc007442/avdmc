// import { NextRequest, NextResponse } from 'next/server';

// interface CarouselCard {
//   imageUrl: string;
//   body: string;
//   buttonText: string;
//   buttonUrl: string;
//   buttonParameter: string;
// }

// async function uploadImage(imageUrl: string, index: number) {
//   const token = process.env.WHATSAPP_ACCESS_TOKEN;
//   const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

//   if (!token) {
//     throw new Error('WHATSAPP_ACCESS_TOKEN is missing');
//   }

//   const imageResponse = await fetch(imageUrl);

//   if (!imageResponse.ok) {
//     throw new Error(`Failed to download image: ${imageUrl}`);
//   }

//   const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

//   const uploadSessionResponse = await fetch(`https://graph.facebook.com/${version}/app/uploads`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       file_length: imageBuffer.length,
//       file_type: 'image/jpeg',
//       file_name: `carousel-card-${index}.jpg`,
//     }),
//   });

//   const uploadSession = await uploadSessionResponse.json();

//   if (!uploadSessionResponse.ok) {
//     throw new Error(uploadSession?.error?.message || 'Failed to create Meta upload session');
//   }

//   const uploadId = uploadSession.id;

//   const uploadResponse = await fetch(`https://graph.facebook.com/${version}/${uploadId}`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'image/jpeg',
//       file_offset: '0',
//     },
//     body: imageBuffer,
//   });

//   const uploadResult = await uploadResponse.json();

//   if (!uploadResponse.ok) {
//     throw new Error(uploadResult?.error?.message || 'Failed to upload image to Meta');
//   }

//   return uploadResult.h;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const {
//       templateName,
//       language,
//       bodyText,
//       bodyParameter,
//       cards,
//     }: {
//       templateName: string;
//       language: string;
//       bodyText: string;
//       bodyParameter: string;
//       cards: CarouselCard[];
//     } = await req.json();

//     if (!templateName) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Template name is required',
//         },
//         { status: 400 }
//       );
//     }

//     if (!cards || cards.length < 2) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'At least 2 carousel cards are required',
//         },
//         { status: 400 }
//       );
//     }

//     if (cards.length > 10) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Maximum 10 carousel cards are allowed',
//         },
//         { status: 400 }
//       );
//     }

//     const token = process.env.WHATSAPP_ACCESS_TOKEN;
//     const wabaId = process.env.WHATSAPP_WABA_ID;
//     const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

//     if (!token || !wabaId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'WhatsApp environment variables are missing',
//         },
//         { status: 500 }
//       );
//     }

//     // Upload all carousel images
//     const handles: string[] = [];

//     for (let i = 0; i < cards.length; i++) {
//       const handle = await uploadImage(cards[i].imageUrl, i);
//       handles.push(handle);
//     }

//     const carouselCards = cards.map((card, index) => ({
//       components: [
//         {
//           type: 'HEADER',
//           format: 'IMAGE',
//           example: {
//             header_handle: [handles[index]],
//           },
//         },
//         {
//           type: 'BODY',
//           text: card.body,
//         },
//         {
//           type: 'BUTTONS',
//           buttons: [
//             {
//               type: 'URL',
//               text: card.buttonText,
//               url: card.buttonUrl,
//               example: [card.buttonParameter],
//             },
//           ],
//         },
//       ],
//     }));

//     const payload = {
//       name: templateName,
//       language,
//       category: 'MARKETING',
//       components: [
//         {
//           type: 'BODY',
//           text: bodyText,
//           example: {
//             body_text: [[bodyParameter]],
//           },
//         },
//         {
//           type: 'CAROUSEL',
//           cards: carouselCards,
//         },
//       ],
//     };

//     const response = await fetch(
//       `https://graph.facebook.com/${version}/${wabaId}/message_templates`,
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: data?.error?.message || 'Failed to create WhatsApp template',
//           error: data?.error,
//         },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'WhatsApp carousel template created successfully',
//       data,
//     });
//   } catch (error) {
//     console.error('CREATE CAROUSEL ERROR:', error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error instanceof Error ? error.message : 'Internal server error',
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';

interface CarouselCard {
  imageUrl: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  buttonParameter?: string;
}

async function uploadImage(imageUrl: string, index: number) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (!token) {
    throw new Error('WHATSAPP_ACCESS_TOKEN is missing');
  }

  console.log(`[CARD ${index + 1}] Downloading image: ${imageUrl}`);

  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageUrl} (${imageResponse.status})`);
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  console.log(`[CARD ${index + 1}] Image downloaded: ${imageBuffer.length} bytes`);

  // Create Meta upload session
  console.log(`[CARD ${index + 1}] Creating Meta upload session`);

  const uploadSessionResponse = await fetch(`https://graph.facebook.com/${version}/app/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_length: imageBuffer.length,
      file_type: 'image/jpeg',
      file_name: `carousel-card-${index}.jpg`,
    }),
  });

  const uploadSession = await uploadSessionResponse.json();

  console.log(`[CARD ${index + 1}] Upload session response:`, uploadSession);

  if (!uploadSessionResponse.ok) {
    throw new Error(uploadSession?.error?.message || 'Failed to create Meta upload session');
  }

  const uploadId = uploadSession.id;

  if (!uploadId) {
    throw new Error('Meta upload session ID is missing');
  }

  // Upload image
  console.log(`[CARD ${index + 1}] Uploading image to Meta`);

  const uploadResponse = await fetch(`https://graph.facebook.com/${version}/${uploadId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
      file_offset: '0',
    },
    body: imageBuffer,
  });

  const uploadResult = await uploadResponse.json();

  console.log(`[CARD ${index + 1}] Image upload response:`, uploadResult);

  if (!uploadResponse.ok) {
    throw new Error(uploadResult?.error?.message || 'Failed to upload image to Meta');
  }

  if (!uploadResult.h) {
    throw new Error('Meta did not return an image handle');
  }

  return uploadResult.h;
}

export async function POST(req: NextRequest) {
  try {
    const {
      templateName,
      language,
      bodyText,
      bodyParameter,
      cards,
    }: {
      templateName: string;
      language: string;
      bodyText: string;
      bodyParameter?: string;
      cards: CarouselCard[];
    } = await req.json();

    console.log('CREATE CAROUSEL REQUEST:', {
      templateName,
      language,
      bodyText,
      bodyParameter,
      cards,
    });

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!templateName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template name is required',
        },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(templateName)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template name can only contain lowercase letters, numbers and underscores',
        },
        { status: 400 }
      );
    }

    if (!bodyText) {
      return NextResponse.json(
        {
          success: false,
          message: 'Carousel body text is required',
        },
        { status: 400 }
      );
    }

    if (!cards || cards.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least 2 carousel cards are required',
        },
        { status: 400 }
      );
    }

    if (cards.length > 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maximum 10 carousel cards are allowed',
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Environment
    // --------------------------------------------------

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_WABA_ID;
    const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

    if (!token || !wabaId) {
      return NextResponse.json(
        {
          success: false,
          message: 'WhatsApp environment variables are missing',
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Upload images
    // --------------------------------------------------

    const handles: string[] = [];

    for (let i = 0; i < cards.length; i++) {
      const handle = await uploadImage(cards[i].imageUrl, i);

      handles.push(handle);
    }

    console.log('ALL IMAGE HANDLES:', handles);

    // --------------------------------------------------
    // Build carousel cards
    // --------------------------------------------------

    const carouselCards = cards.map((card, index) => {
      const button: {
        type: 'URL';
        text: string;
        url: string;
        example?: string[];
      } = {
        type: 'URL',
        text: card.buttonText,
        url: card.buttonUrl,
      };

      /*
       * Only send example when the URL
       * actually contains {{1}}
       */
      if (card.buttonUrl.includes('{{1}}') && card.buttonParameter?.trim()) {
        button.example = [card.buttonParameter.trim()];
      }

      return {
        components: [
          {
            type: 'HEADER',
            format: 'IMAGE',
            example: {
              header_handle: [handles[index]],
            },
          },
          {
            type: 'BODY',
            text: card.body,
          },
          {
            type: 'BUTTONS',
            buttons: [button],
          },
        ],
      };
    });

    // --------------------------------------------------
    // Main body
    // --------------------------------------------------

    const bodyComponent: {
      type: 'BODY';
      text: string;
      example?: {
        body_text: string[][];
      };
    } = {
      type: 'BODY',
      text: bodyText,
    };

    /*
     * Only send body example if
     * {{1}} exists in body text.
     */
    if (bodyText.includes('{{1}}') && bodyParameter?.trim()) {
      bodyComponent.example = {
        body_text: [[bodyParameter.trim()]],
      };
    }

    // --------------------------------------------------
    // Meta payload
    // --------------------------------------------------

    const payload = {
      name: templateName,
      language,
      category: 'MARKETING',
      components: [
        bodyComponent,
        {
          type: 'CAROUSEL',
          cards: carouselCards,
        },
      ],
    };

    console.log('WHATSAPP TEMPLATE PAYLOAD:', JSON.stringify(payload, null, 2));

    // --------------------------------------------------
    // Create template
    // --------------------------------------------------

    const response = await fetch(
      `https://graph.facebook.com/${version}/${wabaId}/message_templates`,
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

    console.log('META RESPONSE STATUS:', response.status);

    console.log('META RESPONSE:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.error?.message || 'Failed to create WhatsApp template',
          error: data?.error,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp carousel template created successfully',
      data,
    });
  } catch (error) {
    console.error('CREATE CAROUSEL ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}