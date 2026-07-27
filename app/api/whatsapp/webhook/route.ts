import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'avdmc_whatsapp_verify';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!; // 1291947837325825
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

// 1. For Meta Verification (GET)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook Verified!');
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// 2. When user sends message (POST)
export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('Incoming:', JSON.stringify(body, null, 2));

  try {
    const entry = body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    const from = message?.from; // user phone
    const text = message?.text?.body?.toLowerCase() || '';
    const buttonId =
      message?.interactive?.button_reply?.id || message?.interactive?.list_reply?.id || '';

    if (!from) return NextResponse.json({ ok: true });

    // IF USER SENDS HI / HELLO / START
    if (['hi', 'hello', 'hey', 'hii', 'start'].some((w) => text.includes(w))) {
      await sendDestinationList(from);
    }

    // IF USER SELECTS DESTINATION
    if (buttonId) {
      if (['maldives', 'singapore', 'malaysia'].some((d) => buttonId.includes(d))) {
        await sendText(
          from,
          `Great! You selected *${buttonId.toUpperCase()}*.\n\nOur team will share best packages for ${buttonId} shortly.\n\nPlease share:\n1. Travel Date\n2. No. of Guests`
        );
        // Here you can also save lead to your TravelCRM DB
      }
      if (buttonId === 'yes_btn') await sendDestinationList(from);
      if (buttonId === 'no_btn')
        await sendText(from, 'Thank you for contacting AV_DMC! Have a great day 🙏');
    }
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

// Send Destination List
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

  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function sendText(to: string, text: string) {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}
