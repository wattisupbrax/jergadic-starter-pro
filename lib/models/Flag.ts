import mongoose, { Schema, Document } from 'mongoose';

export interface IFlag extends Document {
  reporterId: string;
  targetType: 'term' | 'definition' | 'comment' | 'dicho';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  customReason?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlagSchema = new Schema<IFlag>({
  reporterId: {
    type: String,
    required: true,
    index: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['term', 'definition', 'comment', 'dicho']
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'inappropriate_content',
      'spam',
      'harassment',
      'hate_speech',
      'misinformation',
      'copyright_violation',
      'personal_information',
      'other'
    ]
  },
  customReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  moderatorId: {
    type: String,
    index: true
  },
  moderatorNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for moderator dashboard queries
FlagSchema.index({ status: 1, createdAt: -1 });

// Compound index to prevent duplicate reports
FlagSchema.index({ reporterId: 1, targetType: 1, targetId: 1 });

export default mongoose.models.Flag || mongoose.model<IFlag>('Flag', FlagSchema);