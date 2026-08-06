import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappMessage from '@/models/WhatsappMessage';

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const GRAPH_URL = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { to, message } = await req.json();

  if (!to || !message) {
    return NextResponse.json({ error: 'to and message required' }, { status: 400 });
  }

  // 1. Send via Official WhatsApp API
  const res = await fetch(GRAPH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  });

  const result = await res.json();
  console.log('REPLY RES:', result);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // 2. Save to MongoDB as OUTGOING
  await connectDB();
  await WhatsappMessage.create({
    from: to,
    text: message,
    direction: 'OUTGOING',
    raw: result,
  });

  return NextResponse.json({ success: true, result });
}
