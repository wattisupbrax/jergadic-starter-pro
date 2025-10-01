import dbConnect from './mongodb';
import { Term, Definition, User, Dicho } from './models';

// Sample data for JergaDic
export const sampleTerms = [
  {
    word: 'chido',
    region: 'Mexico',
    tags: ['informal', 'juvenil', 'positivo'],
    synonyms: ['padre', 'genial', 'cool'],
    authorId: 'user_sample_1'
  },
  {
    word: 'guay',
    region: 'Spain',
    tags: ['informal', 'juvenil', 'positivo'],
    synonyms: ['genial', 'cool', 'chévere'],
    authorId: 'user_sample_2'
  },
  {
    word: 'chévere',
    region: 'Venezuela',
    tags: ['informal', 'común', 'positivo'],
    synonyms: ['genial', 'buenísimo', 'bacano'],
    authorId: 'user_sample_3'
  },
  {
    word: 'bacano',
    region: 'Colombia',
    tags: ['informal', 'juvenil', 'positivo'],
    synonyms: ['chévere', 'genial', 'chimba'],
    authorId: 'user_sample_4'
  }
];

export const sampleDefinitions = [
  {
    content: 'Algo que está muy bien, genial, excelente. Se usa para expresar aprobación o admiración.',
    example: '¡Esa película está súper chida!',
    region: 'Mexico',
    authorId: 'user_sample_1',
    votes: { up: 25, down: 2, score: 23 }
  },
  {
    content: 'Expresión utilizada para indicar que algo es cool, moderno o está de moda.',
    example: 'Tu nuevo corte de pelo está muy guay.',
    region: 'Spain',
    authorId: 'user_sample_2',
    votes: { up: 18, down: 1, score: 17 }
  },
  {
    content: 'Palabra para describir algo bueno, agradable o que causa satisfacción.',
    example: 'La fiesta estuvo muy chévere anoche.',
    region: 'Venezuela',
    authorId: 'user_sample_3',
    votes: { up: 22, down: 0, score: 22 }
  },
  {
    content: 'Se usa para referirse a algo o alguien que es genial, bueno o impresionante.',
    example: 'Ese concierto estuvo muy bacano.',
    region: 'Colombia',
    authorId: 'user_sample_4',
    votes: { up: 15, down: 3, score: 12 }
  }
];

export const sampleDichos = [
  {
    content: 'Si está chido, es de México',
    translation: 'If it\'s cool, it\'s from Mexico',
    region: 'Mexico',
    authorId: 'user_sample_1',
    votes: { up: 10, down: 1, score: 9 }
  },
  {
    content: 'Más guay que un ventilador',
    translation: 'Cooler than a fan',
    region: 'Spain',
    authorId: 'user_sample_2',
    votes: { up: 8, down: 0, score: 8 }
  },
  {
    content: 'Chévere que se repita',
    translation: 'Great that it repeats/happens again',
    region: 'Venezuela',
    authorId: 'user_sample_3',
    votes: { up: 12, down: 2, score: 10 }
  }
];

export const sampleUsers = [
  {
    clerkId: 'user_sample_1',
    name: 'Carlos Méndez',
    email: 'carlos@example.com',
    username: 'carlosmexico',
    contributions: {
      termsSubmitted: 5,
      definitionsSubmitted: 12,
      votesGiven: 45,
      commentsPosted: 8,
      dichosSubmitted: 3
    },
    badges: ['Contributor', 'Regional Expert'],
    reputation: 120,
    preferences: {
      language: 'es' as const,
      region: 'Mexico',
      notifications: { email: true, comments: true, votes: true }
    }
  },
  {
    clerkId: 'user_sample_2',
    name: 'María García',
    email: 'maria@example.com',
    username: 'mariaspain',
    contributions: {
      termsSubmitted: 3,
      definitionsSubmitted: 8,
      votesGiven: 32,
      commentsPosted: 15,
      dichosSubmitted: 2
    },
    badges: ['Contributor', 'Community Helper'],
    reputation: 85,
    preferences: {
      language: 'es' as const,
      region: 'Spain',
      notifications: { email: true, comments: true, votes: false }
    }
  },
  {
    clerkId: 'user_sample_3',
    name: 'Ana Rodriguez',
    email: 'ana@example.com',
    username: 'anavenezuela',
    contributions: {
      termsSubmitted: 7,
      definitionsSubmitted: 15,
      votesGiven: 28,
      commentsPosted: 6,
      dichosSubmitted: 4
    },
    badges: ['Active Voter', 'Dictionary Builder'],
    reputation: 140,
    preferences: {
      language: 'es' as const,
      region: 'Venezuela',
      notifications: { email: false, comments: true, votes: true }
    }
  }
];

export async function seedDatabase() {
  try {
    await dbConnect();
    
    // Clear existing data
    await Promise.all([
      Term.deleteMany({}),
      Definition.deleteMany({}),
      User.deleteMany({}),
      Dicho.deleteMany({})
    ]);
    
    console.log('Cleared existing data');
    
    // Create users first
    const users = await User.create(sampleUsers);
    console.log(`Created ${users.length} users`);
    
    // Create terms and get their IDs
    const terms = await Term.create(sampleTerms);
    console.log(`Created ${terms.length} terms`);
    
    // Create definitions with term IDs
    const definitionsWithTermIds = sampleDefinitions.map((def, index) => ({
      ...def,
      termId: terms[index]._id
    }));
    
    const definitions = await Definition.create(definitionsWithTermIds);
    console.log(`Created ${definitions.length} definitions`);
    
    // Create dichos with term IDs
    const dichosWithTermIds = sampleDichos.map((dicho, index) => ({
      ...dicho,
      termId: terms[index]._id
    }));
    
    const dichos = await Dicho.create(dichosWithTermIds);
    console.log(`Created ${dichos.length} dichos`);
    
    console.log('✅ Database seeded successfully!');
    
    return {
      users: users.length,
      terms: terms.length,
      definitions: definitions.length,
      dichos: dichos.length
    };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Function to get sample data for development
export async function getSampleData() {
  await dbConnect();
  
  const terms = await Term.find().lean();
  const definitions = await Definition.find().populate('termId', 'word').lean();
  const users = await User.find().lean();
  const dichos = await Dicho.find().populate('termId', 'word').lean();
  
  return {
    terms,
    definitions,
    users,
    dichos
  };
}