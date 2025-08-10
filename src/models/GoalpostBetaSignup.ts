import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IGoalpostBetaSignup extends Document {
  email: string;
  platform: 'ios' | 'android';
  createdAt: Date;
}

const GoalpostBetaSignupSchema = new Schema<IGoalpostBetaSignup>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    platform: { type: String, enum: ['ios', 'android'], required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'goalpostbetasignups',
  }
);

// Ensure one entry per email per platform
GoalpostBetaSignupSchema.index({ email: 1, platform: 1 }, { unique: true });

const GoalpostBetaSignup: Model<IGoalpostBetaSignup> = mongoose.model<IGoalpostBetaSignup>(
  'GoalpostBetaSignup',
  GoalpostBetaSignupSchema
);

export default GoalpostBetaSignup;


