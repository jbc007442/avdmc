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

// 1. WEBHOOK VERIFICATION
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// 2. RECEIVE MESSAGE - ONLY SAVE, NO AUTOMATION
export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('INCOMING WEBHOOK:', JSON.stringify(body, null, 2));

  const value = body.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  if (!message) return NextResponse.json({ success: true });

  const from = message.from;
  const text =
    message.text?.body ||
    message.interactive?.button_reply?.title ||
    message.interactive?.list_reply?.title ||
    JSON.stringify(message);

  // Don't save your own number
  if (from === SALES_NUMBER) return NextResponse.json({ success: true });

  // SAVE TO MONGODB
  await connectDB();
  await WhatsappMessage.create({
    from,
    text,
    direction: 'INCOMING',
    raw: message,
  });

  console.log(`Message saved from +${from}: ${text}`);

  // OPTIONAL: Forward to your personal WhatsApp (silent)
  // Comment this if you don't want auto-forward
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

  return NextResponse.json({ success: true });
}
