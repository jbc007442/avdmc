import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'avdmc_whatsapp_verify';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const GRAPH_URL = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;

const SALES_NUMBER = '919999384627';
const LOGO_IMAGE_LINK =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhn9uewgi-MHiPy8MQxpO4GmfuWCa9s6rd7bKf5TFY6w&s=10';

export const runtime = 'nodejs';

export const whatsappInbox: any[] = (global as any).whatsappInbox || [];
(global as any).whatsappInbox = whatsappInbox;

type UserSession = { step: string; destination?: string; name?: string; email?: string };
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
  const field = body.entry?.[0]?.changes?.[0]?.field;

  if (field === 'user_preferences' && value?.user_preferences) {
    for (let pref of value.user_preferences) {
      whatsappInbox.unshift({
        from: pref.from,
        text: `PREFERENCE: ${pref.preference}`,
        direction: 'STATUS',
        time: new Date().toLocaleString(),
      });
    }
    return NextResponse.json({ success: true });
  }

  if (value?.statuses) {
    const s = value.statuses[0];
    const error = s.errors?.[0];
    whatsappInbox.unshift({
      from: s.recipient_id,
      text: `STATUS: ${s.status} ${error ? `| ERROR ${error.code}: ${error.title}` : ''}`,
      direction: 'STATUS',
      time: new Date().toLocaleString(),
    });
    return NextResponse.json({ success: true });
  }

  const message = value?.messages?.[0];
  if (!message) return NextResponse.json({ success: true });

  const from = message.from;

  // Don't track if message is FROM sales number itself
  if (from === SALES_NUMBER) {
    return NextResponse.json({ success: true });
  }

  const session = getSession(from);
  const text = message.text?.body?.trim() || '';
  const textLower = text.toLowerCase();
  const selectedId =
    message.interactive?.button_reply?.id ?? message.interactive?.list_reply?.id ?? '';
  const selectedTitle =
    message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title ?? '';

  whatsappInbox.unshift({
    from,
    text: text || selectedId,
    direction: 'INCOMING',
    time: new Date().toLocaleString(),
  });

  // === REDIRECT EVERY MESSAGE TO YOUR NUMBER ===
  if (text || selectedId) {
    const activity = selectedId ? `Button: ${selectedId} (${selectedTitle})` : `Message: ${text}`;
    await notifySales(
      `👤 User: +${from}\n${activity}\nStep: ${session.step}\nDest: ${session.destination || 'N/A'}`
    );
  }

  if (['hi', 'hello', 'hey', 'menu', 'start'].includes(textLower)) {
    resetSession(from);
    await sendWelcomeButtons(from);
    return NextResponse.json({ success: true });
  }

  await handleSelection(from, session, selectedId, text);
  return NextResponse.json({ success: true });
}

async function handleSelection(from: string, session: UserSession, id: string, text: string) {
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
    await notifySales(`🔥 User +${from} wants to TALK TO SALES - Redirecting to you!`);
    return;
  }
  if (['maldives', 'singapore', 'malaysia', 'bali', 'thailand', 'dubai'].includes(id)) {
    session.destination = id;
    session.step = 'ASK_NAME';
    await sendTextMessage(
      from,
      `Great! You selected *${id.toUpperCase()}* ✈\n\nPlease share your Name to get best package.`
    );
    await notifySales(`✈ User +${from} selected DESTINATION: ${id.toUpperCase()}`);
    return;
  }
  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_EMAIL';
    await sendTextMessage(from, `Thanks ${session.name} 🙏\n📧 Please enter your email.`);
    await notifySales(`📝 User +${from} Name: ${text} | Dest: ${session.destination}`);
    return;
  }
  if (session.step === 'ASK_EMAIL') {
    session.email = text;
    session.step = 'COMPLETE';
    await sendTextMessage(
      from,
      `✅ Thank you ${session.name}.\n\nOur expert for ${session.destination?.toUpperCase()} will contact you shortly at ${session.email}.\n\nWe will also notify our Sales Manager Jitender (+91 9999384627).`
    );
    // FINAL LEAD TO YOU
    await notifySales(
      `🔥🔥🔥 NEW LEAD FROM BOT 🔥🔥🔥\nName: ${session.name}\nEmail: ${text}\nDest: ${session.destination}\nFrom: +${from}\n\nCall him now!`
    );
    resetSession(from);
    return;
  }
  if (!id) await sendWelcomeButtons(from);
}

// === SEND TO YOUR PERSONAL NUMBER ===
async function notifySales(body: string) {
  try {
    await sendWhatsApp({
      messaging_product: 'whatsapp',
      to: SALES_NUMBER,
      type: 'text',
      text: { body },
    });
  } catch (e) {
    console.log('Failed to notify sales', e);
  }
}

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
      header: { type: 'image', image: { link: LOGO_IMAGE_LINK } },
      body: { text: 'Hello! 👋 Welcome to *AV DMC - DMC Experts*.\n\nHow can we help you today?' },
      footer: { text: 'Trusted by 500+ Travel Partners' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'destination_menu', title: '🌍 Destinations' } },
          { type: 'reply', reply: { id: 'service_menu', title: '🛎 Services' } },
          { type: 'reply', reply: { id: 'contact_sales', title: '📞 Talk to Expert' } },
        ],
      },
    },
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
  await sendWhatsApp({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: 'Connect with Sales Manager' },
      body: {
        text: `📞 *AV DMC Sales Team*\n\n👤 *Jitender Yadav - Sales Manager*\n📱 +91 9999384627\n\nTap below to chat directly on his personal WhatsApp.`,
      },
      footer: { text: 'AV DMC' },
      action: {
        buttons: [{ type: 'reply', reply: { id: 'destination_menu', title: '🌍 View Packages' } }],
      },
    },
  });

  await sendWhatsApp({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      body: { text: 'Click below to start chat with Jitender on his personal number.' },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: '💬 Chat on +91 9999384627',
          url: `https://wa.me/${SALES_NUMBER}?text=Hi%20Jitender,%20I%20got%20your%20number%20from%20AV%20DMC%20Bot`,
        },
      },
    },
  });
}

