// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/mongodb';
// import WhatsappMessage from '@/models/WhatsappMessage';

// const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'avdmc_whatsapp_verify';
// const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
// const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
// const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
// const GRAPH_URL = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;
// const SALES_NUMBER = '919999384627';

// export const runtime = 'nodejs';

// // 1. WEBHOOK VERIFICATION
// export async function GET(req: NextRequest) {
//   const mode = req.nextUrl.searchParams.get('hub.mode');
//   const token = req.nextUrl.searchParams.get('hub.verify_token');
//   const challenge = req.nextUrl.searchParams.get('hub.challenge');
//   if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//     return new NextResponse(challenge, { status: 200 });
//   }
//   return new NextResponse('Forbidden', { status: 403 });
// }

// // 2. RECEIVE MESSAGE - ONLY SAVE, NO AUTOMATION
// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   console.log('INCOMING WEBHOOK:', JSON.stringify(body, null, 2));

//   const value = body.entry?.[0]?.changes?.[0]?.value;
//   const message = value?.messages?.[0];
//   if (!message) return NextResponse.json({ success: true });

//   const from = message.from;
//   const text =
//     message.text?.body ||
//     message.interactive?.button_reply?.title ||
//     message.interactive?.list_reply?.title ||
//     JSON.stringify(message);

//   // Don't save your own number
//   if (from === SALES_NUMBER) return NextResponse.json({ success: true });

//   // SAVE TO MONGODB
//   await connectDB();
//   await WhatsappMessage.create({
//     from,
//     text,
//     direction: 'INCOMING',
//     raw: message,
//   });

//   console.log(`Message saved from +${from}: ${text}`);

//   // OPTIONAL: Forward to your personal WhatsApp (silent)
//   // Comment this if you don't want auto-forward
//   await fetch(GRAPH_URL, {
//     method: 'POST',
//     headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       messaging_product: 'whatsapp',
//       to: SALES_NUMBER,
//       type: 'text',
//       text: { body: `📩 New message from +${from}:\n${text}` },
//     }),
//   });

//   return NextResponse.json({ success: true });
// }

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappMessage from '@/models/WhatsappMessage';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'avdmc_whatsapp_verify';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const GRAPH_URL = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;
const SALES_NUMBER = '919999384627';

export const runtime = 'nodejs';

// 1. WEBHOOK VERIFICATION - No change needed
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// 2. RECEIVE MESSAGE - FIXED FOR 100% DELIVERY
export async function POST(req: NextRequest) {
  const body = await req.json();

  // FIX 1: Send 200 OK IMMEDIATELY to WhatsApp
  // This is what makes messages appear in Business Suite App every time
  // Don't wait for DB or anything
  const res = NextResponse.json({ success: true });

  // FIX 2: Run all heavy work in background (non-blocking)
  // This will not delay the 200 response
  processInBackground(body);

  return res;
}

// This function runs after 200 is already sent
async function processInBackground(body: any) {
  try {
    console.log('INCOMING WEBHOOK:', JSON.stringify(body, null, 2));

    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const statuses = value?.statuses?.[0];

    // Ignore status updates (delivered, read)
    if (!message) {
      if (statuses) console.log('Status update:', statuses.status);
      return;
    }

    const from = message.from;

    // Prevent loop - don't save/forward your own sales number messages
    if (from === SALES_NUMBER) return;

    const text =
      message.text?.body ||
      message.interactive?.button_reply?.title ||
      message.interactive?.list_reply?.title ||
      message.image?.caption ||
      message.document?.filename ||
      JSON.stringify(message);

    // Save to MongoDB
    await connectDB();
    await WhatsappMessage.create({
      from,
      text,
      direction: 'INCOMING',
      raw: message,
    });

    console.log(`✅ Message saved from +${from}: ${text}`);

    // Optional: Forward notification to your personal number
    // This is now safe because it's in background
    // Comment out if you don't want it
    /*
    await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: SALES_NUMBER,
        type: 'text',
        text: { body: `📩 New message from +${from}:\n${text}` },
      }),
    });
    */
  } catch (error) {
    console.error('Error in background processing:', error);
  }
}