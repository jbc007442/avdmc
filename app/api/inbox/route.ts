import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappMessage from '@/models/WhatsappMessage';

export const runtime = 'nodejs';

export async function GET() {
  await connectDB();
  const messages = await WhatsappMessage.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json(messages);
}
