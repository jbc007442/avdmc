import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WABA_ID = process.env.WHATSAPP_WABA_ID!;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export async function GET() {
  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${WABA_ID}/message_templates?fields=name,language,status,category,components&limit=100`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ success: false, error: data }, { status: res.status });

    const approved = data.data.filter((t: any) => t.status === 'APPROVED');

    const parsed = approved.map((t: any) => {
      const header = t.components.find((c: any) => c.type === 'HEADER');
      const body = t.components.find((c: any) => c.type === 'BODY');
      const carousel = t.components.find((c: any) => c.type === 'CAROUSEL');
      const buttons = t.components.find((c: any) => c.type === 'BUTTONS');

      let variables: string[] = [];
      if (body?.text) {
        const matches = [...body.text.matchAll(/{{\s*([^}]+)\s*}}/g)];
        variables = matches.map((m: any) => m[1]);
      }

      // Parse carousel cards for preview
      let carouselCards: any[] = [];
      if (carousel?.cards) {
        carouselCards = carousel.cards.map((card: any) => {
          const cardHeader = card.components.find((c: any) => c.type === 'HEADER');
          const cardBody = card.components.find((c: any) => c.type === 'BODY');
          const cardButtons = card.components.find((c: any) => c.type === 'BUTTONS');
          return {
            headerFormat: cardHeader?.format || 'IMAGE',
            bodyText: cardBody?.text || '',
            buttons: cardButtons?.buttons || [],
          };
        });
      }

      return {
        name: t.name,
        language: t.language,
        category: t.category,
        status: t.status,
        headerFormat: header?.format || null,
        bodyText: body?.text || '',
        variables,
        isCarousel: !!carousel,
        carouselCards, // for UI preview
        cardCount: carousel?.cards?.length || 0,
        buttons: buttons?.buttons || [],
        raw: t,
      };
    });

    return NextResponse.json({ success: true, count: parsed.length, templates: parsed });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}