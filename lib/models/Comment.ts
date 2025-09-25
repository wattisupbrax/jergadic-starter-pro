import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  definitionId: mongoose.Types.ObjectId;
  userId: string;
  content: string;
  parentId?: mongoose.Types.ObjectId; // For threaded comments
  replies: mongoose.Types.ObjectId[]; // Array of child comment IDs
  votes: {
    up: number;
    down: number;
    score: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  definitionId: {
    type: Schema.Types.ObjectId,
    ref: 'Definition',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  votes: {
    up: {
      type: Number,
      default: 0,
      min: 0
    },
    down: {
      type: Number,
      default: 0,
      min: 0
    },
    score: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for retrieving top-level comments for a definition
CommentSchema.index({ definitionId: 1, parentId: 1, createdAt: -1 });

// Index for sorting comments by score
CommentSchema.index({ definitionId: 1, 'votes.score': -1 });

// Pre-save middleware to calculate score
CommentSchema.pre('save', function(next) {
  if (this.isModified('votes.up') || this.isModified('votes.down')) {
    this.votes.score = this.votes.up - this.votes.down;
  }
  next();
});

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);