import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ICompetitionSubmission extends Document {
  email: string;
  projectUrl: string;
  projectTitle?: string;
  description?: string;
  campaign: string;
  submittedAt: Date;
  createdAt: Date;
}

const CompetitionSubmissionSchema = new Schema<ICompetitionSubmission>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    projectUrl: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Invalid URL format'
      ],
    },
    projectTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    campaign: {
      type: String,
      default: '1k-subs-competition',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'competitionsubmissions',
  }
);

// Ensure one submission per email per campaign
CompetitionSubmissionSchema.index({ email: 1, campaign: 1 }, { unique: true });

const CompetitionSubmission: Model<ICompetitionSubmission> = mongoose.model<ICompetitionSubmission>(
  'CompetitionSubmission',
  CompetitionSubmissionSchema
);

export default CompetitionSubmission;
