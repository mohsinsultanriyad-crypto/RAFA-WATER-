import mongoose, { Schema, Document } from "mongoose";

export interface IPushToken extends Document {
  token: string;
  platform: "android";
  roles: string[];
  city?: string;
  updatedAt: Date;
}

const PushTokenSchema = new Schema<IPushToken>({
  token: { type: String, required: true, unique: true },
  platform: { type: String, enum: ["android"], required: true },
  roles: { type: [String], default: [] },
  city: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

PushTokenSchema.index({ token: 1 }, { unique: true });

const PushToken = mongoose.models.PushToken || mongoose.model<IPushToken>("PushToken", PushTokenSchema);
export default PushToken;