import { NextResponse } from 'next/server';

// This imports the same array where webhook saves messages
export async function GET() {
  try {
    const { whatsappInbox } = await import('../webhook/route');
    return NextResponse.json(whatsappInbox || []);
  } catch (e) {
    return NextResponse.json([]);
  }
}
