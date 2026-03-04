import mongoose, { Schema, Document } from 'mongoose';

export interface IPushToken extends Document {
  token: string;
  platform: string;
  roles: string[];
  city?: string;
  updatedAt: Date;
  createdAt: Date;
}

const PushTokenSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true, index: true },
  platform: { type: String, required: true },
  roles: { type: [String], default: [] },
  city: { type: String },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IPushToken>('PushToken', PushTokenSchema);
