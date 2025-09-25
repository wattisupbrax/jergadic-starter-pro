import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  contributions: {
    termsSubmitted: number;
    definitionsSubmitted: number;
    votesGiven: number;
    commentsPosted: number;
    dichosSubmitted: number;
  };
  badges: string[];
  reputation: number;
  role: 'user' | 'moderator' | 'admin';
  preferences: {
    language: 'es' | 'en';
    region: string;
    notifications: {
      email: boolean;
      comments: boolean;
      votes: boolean;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  avatar: {
    type: String,
    trim: true
  },
  contributions: {
    termsSubmitted: {
      type: Number,
      default: 0,
      min: 0
    },
    definitionsSubmitted: {
      type: Number,
      default: 0,
      min: 0
    },
    votesGiven: {
      type: Number,
      default: 0,
      min: 0
    },
    commentsPosted: {
      type: Number,
      default: 0,
      min: 0
    },
    dichosSubmitted: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  badges: [{
    type: String,
    enum: ['Newbie', 'Contributor', 'Active Voter', 'Dictionary Builder', 'Regional Expert', 'Community Helper', 'Top Contributor', 'Moderator', 'Legend']
  }],
  reputation: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  preferences: {
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    region: {
      type: String,
      enum: ['Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela', 'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua', 'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba', 'General'],
      default: 'General'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      comments: {
        type: Boolean,
        default: true
      },
      votes: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
UserSchema.index({ reputation: -1 });
UserSchema.index({ 'contributions.termsSubmitted': -1 });
UserSchema.index({ 'contributions.definitionsSubmitted': -1 });

// Virtual for total contributions
UserSchema.virtual('totalContributions').get(function() {
  return this.contributions.termsSubmitted + 
         this.contributions.definitionsSubmitted + 
         this.contributions.commentsPosted + 
         this.contributions.dichosSubmitted;
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);