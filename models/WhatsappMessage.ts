import mongoose from 'mongoose';

const WhatsappMessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, index: true },
    text: { type: String, required: true },
    direction: { type: String, enum: ['INCOMING', 'OUTGOING', 'STATUS'], required: true },
    session: { type: Object },
    raw: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.WhatsappMessage ||
  mongoose.model('WhatsappMessage', WhatsappMessageSchema);
