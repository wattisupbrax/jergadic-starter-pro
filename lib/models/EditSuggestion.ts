import mongoose, { Schema, Document } from 'mongoose';

export interface IEditSuggestion extends Document {
  targetType: 'term' | 'definition';
  targetId: mongoose.Types.ObjectId;
  suggestedBy: string;
  changes: {
    field: string;
    currentValue: string;
    suggestedValue: string;
  }[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  votes: {
    up: number;
    down: number;
    score: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EditSuggestionSchema = new Schema<IEditSuggestion>({
  targetType: {
    type: String,
    required: true,
    enum: ['term', 'definition']
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  suggestedBy: {
    type: String,
    required: true,
    index: true
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    currentValue: {
      type: String,
      required: true
    },
    suggestedValue: {
      type: String,
      required: true
    }
  }],
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: String,
    index: true
  },
  reviewNotes: {
    type: String,
    maxlength: 1000
  },
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
  }
}, {
  timestamps: true
});

// Index for moderator review queries
EditSuggestionSchema.index({ status: 1, createdAt: -1 });

// Index for user's suggestions
EditSuggestionSchema.index({ suggestedBy: 1, createdAt: -1 });

// Pre-save middleware to calculate score
EditSuggestionSchema.pre('save', function(next) {
  if (this.isModified('votes.up') || this.isModified('votes.down')) {
    this.votes.score = this.votes.up - this.votes.down;
  }
  next();
});

export default mongoose.models.EditSuggestion || mongoose.model<IEditSuggestion>('EditSuggestion', EditSuggestionSchema);