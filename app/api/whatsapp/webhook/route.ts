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
  console.log('Incoming:', JSON.stringify(body, null, 2));

  try {
    const entry = body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    if (!message) return NextResponse.json({ ok: true });

    const from = message?.from;
    const text = message?.text?.body?.toLowerCase()?.trim() || '';
    const buttonId =
      message?.interactive?.button_reply?.id || message?.interactive?.list_reply?.id || '';

    // SAVE TO INBOX FOR YOUR REACT SCREEN
    if (from && (text || buttonId)) {
      whatsappInbox.unshift({
        from,
        text: text || buttonId,
        direction: 'INCOMING',
        time: new Date().toLocaleString(),
      });
    }

    if (from && text && ['hi', 'hello', 'hey', 'hii', 'start'].some((w) => text.includes(w))) {
      await sendDestinationList(from);
    }

    if (from && buttonId && ['maldives', 'singapore', 'malaysia'].includes(buttonId)) {
      await sendText(
        from,
        `Great! You selected *${buttonId.toUpperCase()}*.\n\nOur team will share best packages for ${buttonId} shortly.\n\nPlease share:\n1. Travel Date\n2. No. of Guests`
      );
    }
  } catch (e) {
    console.error('WEBHOOK ERROR:', e);
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 });
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
      body: {
        text: 'Hello! We are a Destination Management Company.\n\nPlease choose your preferred destination:',
      },
      footer: { text: 'Select one to get best deals' },
      action: {
        button: 'Choose Destination',
        sections: [
          {
            title: 'Top Destinations',
            rows: [
              { id: 'maldives', title: 'Maldives', description: 'Best island getaway packages' },
              { id: 'singapore', title: 'Singapore', description: 'Family & honeymoon special' },
              { id: 'malaysia', title: 'Malaysia', description: 'Budget friendly tours' },
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
  console.log('Send List Response:', await res.text());

  whatsappInbox.unshift({
    from: to,
    text: 'Sent: Destination List (Maldives, Singapore, Malaysia)',
    direction: 'OUTGOING',
    time: new Date().toLocaleString(),
  });
}

async function sendText(to: string, text: string) {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  });
}
