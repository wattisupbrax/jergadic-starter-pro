import mongoose, { Schema, Document } from 'mongoose';

export interface IDicho extends Document {
  termId: mongoose.Types.ObjectId;
  content: string;
  translation?: string; // Optional English translation
  authorId: string;
  region: string;
  votes: {
    up: number;
    down: number;
    score: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DichoSchema = new Schema<IDicho>({
  termId: {
    type: Schema.Types.ObjectId,
    ref: 'Term',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  translation: {
    type: String,
    trim: true,
    maxlength: 500
  },
  authorId: {
    type: String,
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    enum: ['Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela', 'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua', 'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba', 'General'],
    default: 'General'
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
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Text search index for dicho content
DichoSchema.index({ 
  content: 'text',
  translation: 'text'
}, {
  weights: {
    content: 10,
    translation: 5
  }
});

// Index for sorting dichos by score within a term
DichoSchema.index({ termId: 1, 'votes.score': -1 });

// Compound index for region-based dicho queries
DichoSchema.index({ termId: 1, region: 1, 'votes.score': -1 });

// Pre-save middleware to calculate score
DichoSchema.pre('save', function(next) {
  if (this.isModified('votes.up') || this.isModified('votes.down')) {
    this.votes.score = this.votes.up - this.votes.down;
  }
  next();
});

export default mongoose.models.Dicho || mongoose.model<IDicho>('Dicho', DichoSchema);