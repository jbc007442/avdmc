// import { NextRequest, NextResponse } from 'next/server';

// const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

// /**
//  * Meta Verification
//  */
// export async function GET(req: NextRequest) {
//   const searchParams = req.nextUrl.searchParams;

//   const mode = searchParams.get('hub.mode');
//   const token = searchParams.get('hub.verify_token');
//   const challenge = searchParams.get('hub.challenge');

//   if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//     console.log('Webhook Verified');

//     return new NextResponse(challenge, {
//       status: 200,
//     });
//   }

//   return NextResponse.json(
//     {
//       success: false,
//       message: 'Verification failed',
//     },
//     { status: 403 }
//   );
// }

// /**
//  * Incoming Messages / Status Updates
//  */
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     console.log('Webhook Event', JSON.stringify(body, null, 2));

//     /**
//      * Save to MongoDB
//      * Update message status
//      * Handle incoming messages
//      */

//     return NextResponse.json(
//       {
//         success: true,
//       },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error(err);

//     return NextResponse.json(
//       {
//         success: false,
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'avdmc_whatsapp_verify';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export const whatsappInbox: any[] = (global as any).whatsappInbox || [];
(global as any).whatsappInbox = whatsappInbox;

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const value = body.entry?.[0]?.changes?.[0]?.value;

  if (value?.statuses) {
    const s = value.statuses[0];
    whatsappInbox.unshift({
      from: s.recipient_id,
      text: `STATUS: ${s.status}`,
      status: s.status,
      direction: 'STATUS',
      time: new Date().toLocaleString(),
    });
    return NextResponse.json({ ok: true });
  }

  const message = value?.messages?.[0];
  if (!message) return NextResponse.json({ ok: true });

  const from = message.from;
  const text = message.text?.body?.toLowerCase()?.trim() || '';
  const buttonId =
    message.interactive?.button_reply?.id || message.interactive?.list_reply?.id || '';

  if (from && (text || buttonId)) {
    whatsappInbox.unshift({
      from,
      text: text || buttonId,
      direction: 'INCOMING',
      time: new Date().toLocaleString(),
    });
  }

  if (from && ['hi', 'hello', 'hey', 'hii'].some((w) => text.includes(w))) {
    await sendDestinationList(from);
  }

  return NextResponse.json({ ok: true });
}

async function sendDestinationList(to: string) {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: 'AV_DMC - DMC Experts' },
      body: { text: 'Hello! We are a DMC.\nChoose your destination:' },
      footer: { text: 'Select one to get best deals' },
      action: {
        button: 'Choose Destination',
        sections: [
          {
            title: 'Top',
            rows: [
              { id: 'maldives', title: 'Maldives', description: 'Island packages' },
              { id: 'singapore', title: 'Singapore', description: 'Family special' },
              { id: 'malaysia', title: 'Malaysia', description: 'Budget tours' },
            ],
          },
        ],
      },
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.log(await res.text());
  whatsappInbox.unshift({
    from: to,
    text: 'Sent: Destination List',
    direction: 'OUTGOING',
    time: new Date().toLocaleString(),
  });
}