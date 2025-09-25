import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  userId: string;
  definitionId: mongoose.Types.ObjectId;
  type: 'up' | 'down';
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  definitionId: {
    type: Schema.Types.ObjectId,
    ref: 'Definition',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['up', 'down'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per definition
VoteSchema.index({ userId: 1, definitionId: 1 }, { unique: true });

// Index for efficient vote counting
VoteSchema.index({ definitionId: 1, type: 1 });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);