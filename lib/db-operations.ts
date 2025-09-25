import dbConnect from './mongodb';
import { Term, Definition, User, Vote, Comment, Dicho, Flag, Notification } from './models';
import { ITerm, IDefinition, IUser, IVote, IComment, IDicho, IFlag, INotification } from './models';

// Term Operations
export const termOperations = {
  async create(termData: Partial<ITerm>) {
    await dbConnect();
    return await Term.create(termData);
  },

  async findById(id: string) {
    await dbConnect();
    return await Term.findById(id).lean();
  },

  async findByWord(word: string, region?: string) {
    await dbConnect();
    const query: any = { word: word.toLowerCase(), isActive: true };
    if (region && region !== 'General') {
      query.region = region;
    }
    return await Term.findOne(query).lean();
  },

  async search(query: string, region?: string, limit: number = 20) {
    await dbConnect();
    const searchQuery: any = {
      $text: { $search: query },
      isActive: true
    };
    if (region && region !== 'General') {
      searchQuery.region = region;
    }
    
    return await Term.find(searchQuery)
      .select('word region tags synonyms createdAt')
      .limit(limit)
      .lean();
  },

  async getRandomTerm(region?: string) {
    await dbConnect();
    const query: any = { isActive: true };
    if (region && region !== 'General') {
      query.region = region;
    }
    
    const count = await Term.countDocuments(query);
    const random = Math.floor(Math.random() * count);
    return await Term.findOne(query).skip(random).lean();
  }
};

// Definition Operations
export const definitionOperations = {
  async create(definitionData: Partial<IDefinition>) {
    await dbConnect();
    return await Definition.create(definitionData);
  },

  async findByTermId(termId: string, region?: string) {
    await dbConnect();
    const query: any = { termId, isActive: true };
    if (region && region !== 'General') {
      query.region = region;
    }
    
    return await Definition.find(query)
      .sort({ 'votes.score': -1, createdAt: -1 })
      .lean();
  },

  async updateVotes(definitionId: string, voteType: 'up' | 'down', increment: number) {
    await dbConnect();
    const update = increment > 0 
      ? { $inc: { [`votes.${voteType}`]: increment } }
      : { $inc: { [`votes.${voteType}`]: increment } };
    
    return await Definition.findByIdAndUpdate(
      definitionId,
      update,
      { new: true }
    );
  }
};

// User Operations
export const userOperations = {
  async create(userData: Partial<IUser>) {
    await dbConnect();
    return await User.create(userData);
  },

  async findByClerkId(clerkId: string) {
    await dbConnect();
    return await User.findOne({ clerkId }).lean();
  },

  async updateContributions(clerkId: string, contributionType: string, increment: number = 1) {
    await dbConnect();
    const update = { $inc: { [`contributions.${contributionType}`]: increment } };
    return await User.findOneAndUpdate({ clerkId }, update, { new: true });
  },

  async getLeaderboard(type: string = 'reputation', limit: number = 10) {
    await dbConnect();
    const sortField = type === 'reputation' ? 'reputation' : `contributions.${type}`;
    return await User.find({ isActive: true })
      .sort({ [sortField]: -1 })
      .select('name username avatar reputation contributions badges')
      .limit(limit)
      .lean();
  },

  async updateBadges(clerkId: string, badges: string[]) {
    await dbConnect();
    return await User.findOneAndUpdate(
      { clerkId }, 
      { badges }, 
      { new: true }
    );
  },

  async updateReputation(clerkId: string, reputation: number) {
    await dbConnect();
    return await User.findOneAndUpdate(
      { clerkId }, 
      { reputation }, 
      { new: true }
    );
  }
};

// Vote Operations
export const voteOperations = {
  async create(voteData: Partial<IVote>) {
    await dbConnect();
    return await Vote.create(voteData);
  },

  async findUserVote(userId: string, definitionId: string) {
    await dbConnect();
    return await Vote.findOne({ userId, definitionId }).lean();
  },

  async updateOrCreate(userId: string, definitionId: string, voteType: 'up' | 'down') {
    await dbConnect();
    return await Vote.findOneAndUpdate(
      { userId, definitionId },
      { type: voteType },
      { upsert: true, new: true }
    );
  }
};

// Comment Operations
export const commentOperations = {
  async create(commentData: Partial<IComment>) {
    await dbConnect();
    return await Comment.create(commentData);
  },

  async findByDefinitionId(definitionId: string, parentId?: string) {
    await dbConnect();
    const query: any = { definitionId, isActive: true };
    if (parentId) {
      query.parentId = parentId;
    } else {
      query.parentId = null;
    }
    
    return await Comment.find(query)
      .sort({ 'votes.score': -1, createdAt: -1 })
      .lean();
  }
};

// Dicho Operations
export const dichoOperations = {
  async create(dichoData: Partial<IDicho>) {
    await dbConnect();
    return await Dicho.create(dichoData);
  },

  async findByTermId(termId: string, region?: string) {
    await dbConnect();
    const query: any = { termId, isActive: true };
    if (region && region !== 'General') {
      query.region = region;
    }
    
    return await Dicho.find(query)
      .sort({ 'votes.score': -1, createdAt: -1 })
      .lean();
  }
};

// Flag Operations
export const flagOperations = {
  async create(flagData: Partial<IFlag>) {
    await dbConnect();
    return await Flag.create(flagData);
  },

  async findById(flagId: string) {
    await dbConnect();
    return await Flag.findById(flagId).lean();
  },

  async findByStatus(status: string, limit: number = 50) {
    await dbConnect();
    return await Flag.find({ status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async findPending(limit: number = 50) {
    await dbConnect();
    return await Flag.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async updateStatus(flagId: string, updateData: { 
    status: string; 
    moderatorId: string; 
    moderatorNotes?: string;
    reviewedAt?: Date;
  }) {
    await dbConnect();
    return await Flag.findByIdAndUpdate(flagId, updateData, { new: true });
  },

  async checkExistingFlag(reporterId: string, targetType: string, targetId: string) {
    await dbConnect();
    return await Flag.findOne({
      reporterId,
      targetType,
      targetId,
      status: { $in: ['pending', 'reviewed'] }
    }).lean();
  }
};

// Search Operations
export const searchOperations = {
  async globalSearch(query: string, region?: string, limit: number = 20) {
    await dbConnect();
    
    // Search terms
    const termResults = await termOperations.search(query, region, Math.ceil(limit / 2));
    
    // Search definitions
    const definitionQuery: any = {
      $text: { $search: query },
      isActive: true
    };
    if (region && region !== 'General') {
      definitionQuery.region = region;
    }
    
    const definitionResults = await Definition.find(definitionQuery)
      .populate('termId', 'word region')
      .limit(Math.ceil(limit / 2))
      .lean();
    
    return {
      terms: termResults,
      definitions: definitionResults
    };
  },

  async autocomplete(query: string, region?: string, limit: number = 10) {
    await dbConnect();
    const searchQuery: any = {
      word: { $regex: query, $options: 'i' },
      isActive: true
    };
    if (region && region !== 'General') {
      searchQuery.region = region;
    }
    
    return await Term.find(searchQuery)
      .select('word region')
      .limit(limit)
      .lean();
  }
};

// Notification Operations
export const notificationOperations = {
  async create(notificationData: Partial<INotification>) {
    await dbConnect();
    return await Notification.create(notificationData);
  },

  async findByUserId(userId: string, unreadOnly: boolean = false, limit: number = 20) {
    await dbConnect();
    const query: any = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }
    
    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async markAsRead(userId: string, notificationIds?: string[]) {
    await dbConnect();
    const query: any = { userId };
    if (notificationIds && notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }
    
    return await Notification.updateMany(query, { isRead: true });
  },

  async getUnreadCount(userId: string) {
    await dbConnect();
    return await Notification.countDocuments({ userId, isRead: false });
  },

  async createNotification(userId: string, type: string, title: string, message: string, relatedId?: string, relatedType?: string) {
    await dbConnect();
    return await this.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      isRead: false
    });
  }
};