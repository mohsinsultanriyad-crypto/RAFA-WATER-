import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  jobRole: string;
  description: string;
  email: string;
  company?: string;
  isUrgent: boolean;
  urgentUntil?: number;
  views: number;
  postedAt: number;
}

const JobSchema: Schema = new Schema<IJob>({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },
  jobRole: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String },
  isUrgent: { type: Boolean, required: true },
  urgentUntil: { type: Number },
  views: { type: Number, required: true },
  postedAt: { type: Number, required: true }
});

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
