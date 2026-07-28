import { NextResponse } from 'next/server';
import { whatsappInbox } from '../webhook/whatsapp/route';

export async function GET() {
  return NextResponse.json(whatsappInbox);
}
