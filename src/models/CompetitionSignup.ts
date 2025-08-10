import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ICompetitionSignup extends Document {
  email: string;
  acceptedRules: boolean;
  campaign: string;
  createdAt: Date;
}

const CompetitionSignupSchema = new Schema<ICompetitionSignup>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    acceptedRules: { 
      type: Boolean, 
      required: true 
    },
    campaign: { 
      type: String, 
      default: '1k-subs' 
    },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'competitionsignups' // Explicit collection name
  }
);

// Ensure one entry per email per campaign
CompetitionSignupSchema.index({ email: 1, campaign: 1 }, { unique: true });

const CompetitionSignup: Model<ICompetitionSignup> = mongoose.model<ICompetitionSignup>(
  'CompetitionSignup', 
  CompetitionSignupSchema
);

export default CompetitionSignup;



