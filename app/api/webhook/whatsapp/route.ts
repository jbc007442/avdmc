// import { NextRequest, NextResponse } from 'next/server';

// const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'avdmc_whatsapp_verify';
// const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
// const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
// const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

// export const whatsappInbox: any[] = (global as any).whatsappInbox || [];
// (global as any).whatsappInbox = whatsappInbox;

// export async function GET(req: NextRequest) {
//   const mode = req.nextUrl.searchParams.get('hub.mode');
//   const token = req.nextUrl.searchParams.get('hub.verify_token');
//   const challenge = req.nextUrl.searchParams.get('hub.challenge');
//   if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//     return new NextResponse(challenge, { status: 200 });
//   }
//   return new NextResponse('Forbidden', { status: 403 });
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const value = body.entry?.[0]?.changes?.[0]?.value;

//   if (value?.statuses) {
//     const s = value.statuses[0];
//     whatsappInbox.unshift({
//       from: s.recipient_id,
//       text: `STATUS: ${s.status}`,
//       status: s.status,
//       direction: 'STATUS',
//       time: new Date().toLocaleString(),
//     });
//     return NextResponse.json({ ok: true });
//   }

//   const message = value?.messages?.[0];
//   if (!message) return NextResponse.json({ ok: true });

//   const from = message.from;
//   const text = message.text?.body?.toLowerCase()?.trim() || '';
//   const buttonId =
//     message.interactive?.button_reply?.id || message.interactive?.list_reply?.id || '';

//   if (from && (text || buttonId)) {
//     whatsappInbox.unshift({
//       from,
//       text: text || buttonId,
//       direction: 'INCOMING',
//       time: new Date().toLocaleString(),
//     });
//   }

//   if (from && ['hi', 'hello', 'hey', 'hii'].some((w) => text.includes(w))) {
//     await sendDestinationList(from);
//   }

//   return NextResponse.json({ ok: true });
// }

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

import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'avdmc_whatsapp_verify';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const GRAPH_URL = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;

export const whatsappInbox: any[] = (global as any).whatsappInbox || [];
(global as any).whatsappInbox = whatsappInbox;

type UserSession = {
  step: string;
  destination?: string;
  name?: string;
  email?: string;
};

const sessions: Record<string, UserSession> = (global as any).whatsappSessions || {};
(global as any).whatsappSessions = sessions;

function getSession(phone: string): UserSession {
  if (!sessions[phone]) sessions[phone] = { step: 'WELCOME' };
  return sessions[phone];
}
function resetSession(phone: string) {
  sessions[phone] = { step: 'WELCOME' };
}

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
      direction: 'STATUS',
      time: new Date().toLocaleString(),
    });
    return NextResponse.json({ success: true });
  }

  const message = value?.messages?.[0];
  if (!message) return NextResponse.json({ success: true });

  const from = message.from;
  const session = getSession(from);
  const text = message.text?.body?.trim().toLowerCase() || '';
  const selectedId =
    message.interactive?.button_reply?.id ?? message.interactive?.list_reply?.id ?? '';

  whatsappInbox.unshift({
    from,
    text: text || selectedId,
    direction: 'INCOMING',
    time: new Date().toLocaleString(),
  });

  if (['hi', 'hello', 'hey', 'menu', 'start'].includes(text)) {
    resetSession(from);
    await sendWelcomeButtons(from);
    return NextResponse.json({ success: true });
  }

  await handleSelection(from, session, selectedId, text);
  return NextResponse.json({ success: true });
}

async function handleSelection(from: string, session: UserSession, id: string, text: string) {
  // MAIN MENU
  if (id === 'destination_menu') {
    session.step = 'DESTINATION';
    await sendDestinationList(from);
    return;
  }
  if (id === 'service_menu') {
    session.step = 'SERVICES';
    await sendServiceList(from);
    return;
  }
  if (id === 'contact_sales') {
    await sendSalesContact(from);
    return;
  }

  // DESTINATION SELECTED
  if (['maldives', 'singapore', 'malaysia', 'bali', 'thailand', 'dubai'].includes(id)) {
    session.destination = id;
    session.step = 'ASK_NAME';
    await sendTextMessage(
      from,
      `Great! You selected *${id.toUpperCase()}* ✈️\n\nPlease share your Name to get best package.`
    );
    return;
  }

  // FORM FLOW
  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_EMAIL';
    await sendTextMessage(from, `Thanks ${session.name} 🙏\n📧 Please enter your email.`);
    return;
  }
  if (session.step === 'ASK_EMAIL') {
    session.email = text;
    session.step = 'COMPLETE';
    await sendTextMessage(
      from,
      `✅ Thank you ${session.name}.\n\nOur expert for ${session.destination?.toUpperCase()} will contact you shortly at ${session.email}.\n\nPlease share:\n1. Travel Date\n2. No. of Guests`
    );
    resetSession(from);
    return;
  }

  // FALLBACK
  if (!id) {
    await sendWelcomeButtons(from);
  }
}

/* ------- SEND HELPERS ------- */

async function sendWhatsApp(payload: any) {
  const res = await fetch(GRAPH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  console.log('WHATSAPP RES:', JSON.stringify(json));
  return json;
}

async function sendTextMessage(to: string, text: string) {
  await sendWhatsApp({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } });
  whatsappInbox.unshift({
    from: to,
    text,
    direction: 'OUTGOING',
    time: new Date().toLocaleString(),
  });
}

async function sendWelcomeButtons(to: string) {
  await sendWhatsApp({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: 'AV DMC - DMC Experts' },
      body: { text: 'Hello! 👋 Welcome to AV DMC.\n\nHow can we help you today?' },
      footer: { text: 'Choose an option' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'destination_menu', title: '🌍 Destinations' } },
          { type: 'reply', reply: { id: 'service_menu', title: '🛎️ Our Services' } },
          { type: 'reply', reply: { id: 'contact_sales', title: '📞 Talk to Expert' } },
        ],
      },
    },
  });
  whatsappInbox.unshift({
    from: to,
    text: 'Sent: Welcome Buttons',
    direction: 'OUTGOING',
    time: new Date().toLocaleString(),
  });
}

async function sendDestinationList(to: string) {
  await sendWhatsApp({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: 'Top Destinations' },
      body: { text: 'Please choose your preferred destination:' },
      footer: { text: 'AV DMC' },
      action: {
        button: 'Choose Destination',
        sections: [
          {
            title: 'Popular',
            rows: [
              { id: 'maldives', title: 'Maldives', description: 'Best island getaway' },
              { id: 'singapore', title: 'Singapore', description: 'Family & honeymoon' },
              { id: 'malaysia', title: 'Malaysia', description: 'Budget friendly' },
              { id: 'bali', title: 'Bali', description: 'Tropical paradise' },
              { id: 'thailand', title: 'Thailand', description: 'Culture & beaches' },
              { id: 'dubai', title: 'Dubai', description: 'Luxury & shopping' },
            ],
          },
        ],
      },
    },
  });
}

async function sendServiceList(to: string) {
  await sendWhatsApp({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: 'Our Services' },
      body: { text: 'We provide complete DMC services:' },
      footer: { text: 'AV DMC' },
      action: {
        button: 'View Services',
        sections: [
          {
            title: 'Services',
            rows: [
              { id: 'hotels', title: 'Hotels', description: 'Best B2B rates' },
              { id: 'transfers', title: 'Transfers', description: 'Airport to hotel' },
              { id: 'sightseeing', title: 'Sightseeing', description: 'Tours & activities' },
            ],
          },
        ],
      },
    },
  });
}

async function sendSalesContact(to: string) {
  await sendTextMessage(
    to,
    `📞 *AV DMC Sales & Operations Team*

👤 *Shanky*
🌴 Maldives Sales & Operations
📱 +91 8527638777
📧 shanky@avdmc.com

👤 *Anshu*
⚙️ Operations
📱 +91 8796901097
📧 maldives@avdmc.com

👤 *Jitender Yadav*
🌍 Mauritius • Singapore • Malaysia • Bali
📱 +91 8130728100
📧 query@avdmc.com

👤 *Sakshi*
🌏 Singapore • Malaysia Operations
📱 +91 9453488908
📧 ops@avdmc.com

👤 *Kuldeep*
🏔️ Europe • Baku
📱 +91 9660915427
📧 kuldeep@avdmc.com

👤 *Pushkar*
🏢 Delhi NCR Sales
📱 +91 9643223032
📧 sales@avdmc.com

👤 *Jitender*
⭐ Sales Manager
📱 +91 9999384627
📧 jitender@avdmc.com

💬 *Reply with your destination or requirements, and our specialist will contact you shortly.*`
  );
}
