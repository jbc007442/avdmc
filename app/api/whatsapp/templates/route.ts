import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WABA_ID = process.env.WHATSAPP_WABA_ID!; // 1062952783327668
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export async function GET() {
  try {
    if (!WABA_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'WABA_ID or ACCESS_TOKEN missing in.env' },
        { status: 500 }
      );
    }

    // Fetch all templates
    const url = `https://graph.facebook.com/${API_VERSION}/${WABA_ID}/message_templates?fields=name,language,status,category,components&limit=100`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Meta Error:', data);
      return NextResponse.json({ success: false, error: data }, { status: res.status });
    }

    // Filter only APPROVED
    const approved = data.data.filter((t: any) => t.status === 'APPROVED');

    // Parse for frontend ease
    const parsed = approved.map((t: any) => {
      const header = t.components.find((c: any) => c.type === 'HEADER');
      const body = t.components.find((c: any) => c.type === 'BODY');

      let variables: string[] = [];
      if (body?.text) {
        const matches = [...body.text.matchAll(/{{\s*([^}]+)\s*}}/g)];
        variables = matches.map((m: any) => m[1]);
      }

      return {
        name: t.name,
        language: t.language,
        category: t.category,
        status: t.status,
        headerFormat: header?.format || null, // IMAGE, VIDEO, DOCUMENT
        bodyText: body?.text || '',
        variables, // ['name'] or ['1','2'] etc
        raw: t,
      };
    });

    return NextResponse.json({
      success: true,
      count: parsed.length,
      templates: parsed,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
