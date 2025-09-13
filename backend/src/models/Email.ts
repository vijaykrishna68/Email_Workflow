import { Schema, model, Document, Types } from 'mongoose';

export interface IEmail extends Document {
  userId: Types.ObjectId; // ✅ Correct type for ObjectId
  messageId: string;
  threadId?: string;
  snippet?: string;
  from?: string;
  to?: string;
  subject?: string;
  internalDate?: number;
  raw?: string;
  fetchedAt: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ Fixed typing
    messageId: { type: String, required: true, index: true },
    threadId: { type: String },
    snippet: { type: String },
    from: { type: String },
    to: { type: String },
    subject: { type: String },
    internalDate: { type: Number },
    raw: { type: String },
    fetchedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default model<IEmail>('Email', EmailSchema);
