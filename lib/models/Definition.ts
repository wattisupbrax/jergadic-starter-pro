import mongoose, { Schema, Document } from 'mongoose';

export interface IDefinition extends Document {
  termId: mongoose.Types.ObjectId;
  content: string;
  example?: string;
  authorId: string;
  votes: {
    up: number;
    down: number;
    score: number; // up - down for ranking
  };
  region: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  audioUrl?: string; // For user-uploaded pronunciations
}

const DefinitionSchema = new Schema<IDefinition>({
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
    maxlength: 2000
  },
  example: {
    type: String,
    trim: true,
    maxlength: 500
  },
  authorId: {
    type: String,
    required: true,
    index: true
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
  region: {
    type: String,
    required: true,
    enum: ['Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela', 'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua', 'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba', 'General'],
    default: 'General'
  },
  audioUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Text search index for definition content and examples
DefinitionSchema.index({ 
  content: 'text',
  example: 'text'
}, {
  weights: {
    content: 10,
    example: 5
  }
});

// Index for sorting by score (votes)
DefinitionSchema.index({ termId: 1, 'votes.score': -1 });

// Compound index for region-based definition queries
DefinitionSchema.index({ termId: 1, region: 1, 'votes.score': -1 });

// Pre-save middleware to calculate score
DefinitionSchema.pre('save', function(next) {
  if (this.isModified('votes.up') || this.isModified('votes.down')) {
    this.votes.score = this.votes.up - this.votes.down;
  }
  next();
});

export default mongoose.models.Definition || mongoose.model<IDefinition>('Definition', DefinitionSchema);