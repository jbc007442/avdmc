import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug; // villa-nautica, instagram, website
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const ua = req.headers.get('user-agent');

  // 1. SAVE IN DB - Replace with your DB
  // await db.collection("clicks").insertOne({ slug, ip, ua, time: new Date() })
  console.log(`CLICK: ${slug} from ${ip}`);

  // 2. REDIRECT TO YOUR NUMBER - 9999384627
  const myNumber = '919999384627';
  const msg = encodeURIComponent(`Hi, I came from ${slug}. I want to know about your packages.`);

  return NextResponse.redirect(`https://wa.me/${myNumber}?text=${msg}`, 302);
}
