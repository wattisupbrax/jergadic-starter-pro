import mongoose, { Document, Schema } from 'mongoose'

export interface INotification extends Document {
  userId: string
  type: 'vote' | 'comment' | 'definition_approved' | 'badge_earned' | 'mention' | 'system'
  title: string
  message: string
  relatedId?: string
  relatedType?: 'term' | 'definition' | 'comment' | 'user'
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['vote', 'comment', 'definition_approved', 'badge_earned', 'mention', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedId: {
    type: String,
    index: true
  },
  relatedType: {
    type: String,
    enum: ['term', 'definition', 'comment', 'user']
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
})

// Compound indexes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, createdAt: -1 })

// Auto-delete notifications older than 30 days
NotificationSchema.index(
  { createdAt: 1 }, 
  { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
)

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)

export default Notification