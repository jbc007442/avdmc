// lib/whatsappStore.ts
import { connectDB } from './mongodb';
import WhatsappMessage from '../models/WhatsappMessage';

export async function saveMessage(data: {
  from: string;
  text: string;
  direction: 'INCOMING' | 'OUTGOING' | 'STATUS';
  session?: any;
  raw?: any;
}) {
  try {
    await connectDB();
    await WhatsappMessage.create({
      from: data.from,
      text: data.text,
      direction: data.direction,
      session: data.session,
      raw: data.raw,
    });
  } catch (e) {
    console.log('DB Save Error:', e);
  }
}

export async function getMessages(limit = 200) {
  await connectDB();
  return await WhatsappMessage.find({}).sort({ createdAt: -1 }).limit(limit).lean();
}
