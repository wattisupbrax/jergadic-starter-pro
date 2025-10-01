import mongoose, { Schema, Document } from 'mongoose';

export interface ITerm extends Document {
  word: string;
  region: string;
  tags: string[];
  synonyms: string[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  isActive: boolean;
}

const TermSchema = new Schema<ITerm>({
  word: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    enum: ['Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela', 'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua', 'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba', 'General'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  synonyms: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  authorId: {
    type: String,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Text search index for search functionality
TermSchema.index({ 
  word: 'text',
  tags: 'text',
  synonyms: 'text'
}, {
  weights: {
    word: 10,
    synonyms: 5,
    tags: 1
  }
});

// Compound index for region-based queries
TermSchema.index({ region: 1, word: 1 });

export default mongoose.models.Term || mongoose.model<ITerm>('Term', TermSchema);