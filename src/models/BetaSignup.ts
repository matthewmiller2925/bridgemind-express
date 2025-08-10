import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IBetaSignup extends Document {
  email: string;
  experience?: string;
  goal?: string;
  referrer?: string;
  referrerOther?: string;
  createdAt: Date;
}

const BetaSignupSchema = new Schema<IBetaSignup>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    experience: { type: String },
    goal: { type: String },
    referrer: { type: String },
    referrerOther: { type: String },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'betasignups' // Explicit collection name
  }
);

const BetaSignup: Model<IBetaSignup> = mongoose.model<IBetaSignup>('BetaSignup', BetaSignupSchema);

export default BetaSignup;



