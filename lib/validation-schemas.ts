import { z } from 'zod';

// Common validation patterns
const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

export const mongoIdSchema = z.string().regex(mongoIdPattern, 'Invalid MongoDB ObjectId');

export const regionEnum = z.enum([
  'General', 'Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela',
  'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay',
  'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua',
  'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba'
]);

export const tagEnum = z.enum([
  'informal', 'juvenil', 'positivo', 'negativo', 'común',
  'vulgar', 'insulto', 'expresión', 'comida', 'dinero',
  'trabajo', 'familia', 'amigos', 'amor', 'música'
]);

// Term validation schemas
export const createTermSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100).transform(val => val.toLowerCase()),
  region: regionEnum,
  tags: z.array(tagEnum).min(1, 'At least one tag is required'),
  synonyms: z.array(z.string().max(50)).max(10).default([]),
  definition: z.string().min(10, 'Definition must be at least 10 characters').max(2000),
  example: z.string().max(500).optional(),
});

export const updateTermSchema = createTermSchema.partial();

export const searchTermsSchema = z.object({
  q: z.string().min(1).max(100),
  region: regionEnum.optional(),
  tags: z.array(tagEnum).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// Definition validation schemas
export const createDefinitionSchema = z.object({
  termId: mongoIdSchema,
  content: z.string().min(10, 'Definition must be at least 10 characters').max(2000),
  example: z.string().max(500).optional(),
  region: regionEnum,
  audioUrl: z.string().url().optional(),
});

export const updateDefinitionSchema = createDefinitionSchema.partial().omit({ termId: true });

// Vote validation schemas
export const voteSchema = z.object({
  definitionId: mongoIdSchema,
  type: z.enum(['up', 'down']),
});

// Comment validation schemas
export const createCommentSchema = z.object({
  definitionId: mongoIdSchema,
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  parentId: mongoIdSchema.optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

// Dicho validation schemas
export const createDichoSchema = z.object({
  termId: mongoIdSchema,
  content: z.string().min(1, 'Dicho cannot be empty').max(500),
  translation: z.string().max(500).optional(),
  region: regionEnum,
});

export const updateDichoSchema = createDichoSchema.partial().omit({ termId: true });

// User validation schemas
export const updateUserPreferencesSchema = z.object({
  language: z.enum(['es', 'en']),
  region: regionEnum,
  notifications: z.object({
    email: z.boolean(),
    comments: z.boolean(),
    votes: z.boolean(),
  }),
});

// Flag validation schemas
export const createFlagSchema = z.object({
  targetType: z.enum(['term', 'definition', 'comment', 'dicho']),
  targetId: mongoIdSchema,
  reason: z.enum([
    'inappropriate_content',
    'spam',
    'harassment',
    'hate_speech',
    'misinformation',
    'copyright_violation',
    'personal_information',
    'other'
  ]),
  customReason: z.string().max(500).optional(),
});

export const updateFlagStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']),
  moderatorNotes: z.string().max(1000).optional(),
});

// Edit suggestion validation schemas
export const createEditSuggestionSchema = z.object({
  targetType: z.enum(['term', 'definition']),
  targetId: mongoIdSchema,
  changes: z.array(z.object({
    field: z.string().min(1),
    currentValue: z.string(),
    suggestedValue: z.string(),
  })).min(1, 'At least one change is required'),
  reason: z.string().min(10, 'Please provide a reason for the edit').max(500),
});

export const reviewEditSuggestionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNotes: z.string().max(1000).optional(),
});

// Search and pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Leaderboard schema
export const leaderboardSchema = z.object({
  type: z.enum(['reputation', 'termsSubmitted', 'definitionsSubmitted', 'votesGiven', 'commentsPosted', 'dichosSubmitted']).default('reputation'),
  limit: z.coerce.number().min(1).max(50).default(10),
  region: regionEnum.optional(),
});

// Autocomplete schema
export const autocompleteSchema = z.object({
  q: z.string().min(1).max(50),
  region: regionEnum.optional(),
  limit: z.coerce.number().min(1).max(10).default(5),
});