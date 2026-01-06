import { PrismaClient, QuestionType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to seed the database');
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const questionSeed = [
  {
    order: 1,
    fieldKey: 'full_name',
    displayText: 'What is your full name?',
    inputType: QuestionType.TEXT,
    helpText: 'We use this to personalize the conversation.',
  },
  {
    order: 2,
    fieldKey: 'email',
    displayText: 'What is the best email to reach you?',
    inputType: QuestionType.EMAIL,
    helpText: 'We will only use it for follow-ups related to this project.',
  },
  {
    order: 3,
    fieldKey: 'company',
    displayText: 'What company or organization do you represent?',
    inputType: QuestionType.TEXT,
  },
  {
    order: 4,
    fieldKey: 'team_size',
    displayText: 'How large is your team?',
    inputType: QuestionType.NUMBER,
    helpText: 'Approximate number of people involved is fine.',
  },
  {
    order: 5,
    fieldKey: 'project_goal',
    displayText: 'What is the primary goal for this project?',
    inputType: QuestionType.TEXT,
  },
];

async function main() {
  for (const question of questionSeed) {
    await prisma.question.upsert({
      where: { fieldKey: question.fieldKey },
      update: {
        displayText: question.displayText,
        order: question.order,
        inputType: question.inputType,
        helpText: question.helpText,
        isActive: true,
      },
      create: question,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error('Failed to seed questions', error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
