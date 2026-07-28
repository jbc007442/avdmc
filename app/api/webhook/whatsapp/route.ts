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

// async function sendDestinationList(to: string) {
//   const url = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;
//   const payload = {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'interactive',
//     interactive: {
//       type: 'list',
//       header: { type: 'text', text: 'AV_DMC - DMC Experts' },
//       body: { text: 'Hello! We are a DMC.\nChoose your destination:' },
//       footer: { text: 'Select one to get best deals' },
//       action: {
//         button: 'Choose Destination',
//         sections: [
//           {
//             title: 'Top',
//             rows: [
//               { id: 'maldives', title: 'Maldives', description: 'Island packages' },
//               { id: 'singapore', title: 'Singapore', description: 'Family special' },
//               { id: 'malaysia', title: 'Malaysia', description: 'Budget tours' },
//             ],
//           },
//         ],
//       },
//     },
//   };
//   const res = await fetch(url, {
//     method: 'POST',
//     headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
//   console.log(await res.text());
//   whatsappInbox.unshift({
//     from: to,
//     text: 'Sent: Destination List',
//     direction: 'OUTGOING',
//     time: new Date().toLocaleString(),
//   });
// }

async function sendDestinationList(to: string) {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: {
        type: 'text',
        text: '🌍 AV DMC - Destination Management Company',
      },
      body: {
        text:
          'Welcome to AV DMC!\n\n' +
          'We provide B2B & B2C travel solutions across Asia, Europe, Indian Ocean and the Middle East.\n\n' +
          'Please select your preferred destination.',
      },
      footer: {
        text: '✈️ Hotels • Tours • Transfers • Visa • Activities',
      },
      action: {
        button: 'Choose Destination',
        sections: [
          {
            title: '🏝️ Island Destinations',
            rows: [
              {
                id: 'destination_maldives',
                title: '🇲🇻 Maldives',
                description: 'Luxury Resorts • Honeymoon • Water Villas',
              },
              {
                id: 'destination_mauritius',
                title: '🇲🇺 Mauritius',
                description: 'Family Holidays • Beaches • Adventure',
              },
              {
                id: 'destination_bali',
                title: '🇮🇩 Bali',
                description: 'Honeymoon • Villas • Adventure',
              },
            ],
          },
          {
            title: '🌏 South East Asia',
            rows: [
              {
                id: 'destination_singapore',
                title: '🇸🇬 Singapore',
                description: 'Universal • Sentosa • City Tours',
              },
              {
                id: 'destination_malaysia',
                title: '🇲🇾 Malaysia',
                description: 'Kuala Lumpur • Genting • Langkawi',
              },
              {
                id: 'destination_thailand',
                title: '🇹🇭 Thailand',
                description: 'Bangkok • Phuket • Krabi • Pattaya',
              },
            ],
          },
          {
            title: '🏜️ Middle East',
            rows: [
              {
                id: 'destination_dubai',
                title: '🇦🇪 Dubai',
                description: 'Luxury • Desert Safari • Burj Khalifa',
              },
              {
                id: 'destination_abu_dhabi',
                title: '🇦🇪 Abu Dhabi',
                description: 'Ferrari World • Yas Island',
              },
            ],
          },
          {
            title: '🏔️ Other Popular Tours',
            rows: [
              {
                id: 'destination_vietnam',
                title: '🇻🇳 Vietnam',
                description: 'Hanoi • Da Nang • Ho Chi Minh',
              },
              {
                id: 'destination_srilanka',
                title: '🇱🇰 Sri Lanka',
                description: 'Nature • Wildlife • Beaches',
              },
              {
                id: 'destination_nepal',
                title: '🇳🇵 Nepal',
                description: 'Kathmandu • Pokhara • Adventure',
              },
            ],
          },
        ],
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
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