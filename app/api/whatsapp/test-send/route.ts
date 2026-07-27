import { NextResponse } from 'next/server';
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const VERSION = 'v21.0';

export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get('to'); // your number 91xxxxxxxxxx
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: 'Hello! We are Destination Management Company. Please choose destination:' },
        action: {
          button: 'Choose Destination',
          sections: [
            {
              title: 'Top Destinations',
              rows: [
                { id: 'maldives', title: 'Maldives' },
                { id: 'singapore', title: 'Singapore' },
                { id: 'malaysia', title: 'Malaysia' },
              ],
            },
          ],
        },
      },
    }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
