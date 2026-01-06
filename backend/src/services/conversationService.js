import prisma from '../db/index.js';
import {
  ConversationEventType,
  QuestionType,
  SessionStatus,
} from '@prisma/client';

const conversationService = {
  async startSession(payload = {}) {
    const userInput = payload.user;
    const userId = await resolveUserId(userInput);

    const session = await prisma.session.create({
      data: {
        userId,
        status: SessionStatus.ACTIVE,
      },
    });

    await createEvent(session.id, ConversationEventType.SESSION_STARTED, {
      userId,
    });

    const nextQuestion = await fetchNextQuestion(session.id);

    return {
      session,
      nextQuestion,
    };
  },

  async getNextQuestion(sessionId) {
    const session = await requireSession(sessionId);
    const nextQuestion = await fetchNextQuestion(session.id);

    return {
      session,
      nextQuestion,
    };
  },

  async recordAnswer(sessionId, questionId, response) {
    if (!questionId) {
      throw new Error('questionId is required');
    }
    if (typeof response === 'undefined' || response === null) {
      throw new Error('response is required');
    }

    const session = await requireSession(sessionId);
    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error('Session is no longer active');
    }

    const expectedQuestion = await findNextQuestionCandidate(sessionId);
    if (!expectedQuestion) {
      throw new Error('All questions are already answered');
    }

    if (expectedQuestion.id !== questionId) {
      throw new Error('Provided question is not the next pending question');
    }

    const normalizedResponse = serializeResponse(response, expectedQuestion.inputType);

    const answer = await prisma.answer.create({
      data: {
        sessionId,
        questionId,
        response: normalizedResponse,
      },
    });

    await createEvent(sessionId, ConversationEventType.ANSWER_RECORDED, {
      answerId: answer.id,
      questionId,
    });

    let updatedSession = session;
    let nextQuestion = await findNextQuestionCandidate(sessionId);
    if (nextQuestion) {
      await createEvent(sessionId, ConversationEventType.QUESTION_ASKED, {
        questionId: nextQuestion.id,
      });
    } else {
      updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await createEvent(sessionId, ConversationEventType.SESSION_COMPLETED, {
        answerCount: await prisma.answer.count({ where: { sessionId } }),
      });
    }

    return {
      answer,
      session: updatedSession,
      nextQuestion,
    };
  },
};

export default conversationService;

async function resolveUserId(userInput) {
  if (!userInput) {
    return null;
  }

  if (userInput.userId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userInput.userId },
    });
    if (!existingUser) {
      throw new Error('User not found for provided userId');
    }
    return existingUser.id;
  }

  if (userInput.email) {
    const existing = await prisma.user.findUnique({
      where: { email: userInput.email },
    });
    if (existing) {
      if (userInput.displayName && !existing.displayName) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { displayName: userInput.displayName },
        });
      }
      return existing.id;
    }

    const created = await prisma.user.create({
      data: {
        email: userInput.email,
        displayName: userInput.displayName,
      },
    });
    return created.id;
  }

  if (userInput.displayName) {
    const created = await prisma.user.create({
      data: {
        displayName: userInput.displayName,
      },
    });
    return created.id;
  }

  return null;
}

async function requireSession(sessionId) {
  if (!sessionId) {
    throw new Error('sessionId is required');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
}

async function fetchNextQuestion(sessionId) {
  const question = await findNextQuestionCandidate(sessionId);
  if (question) {
    await createEvent(sessionId, ConversationEventType.QUESTION_ASKED, {
      questionId: question.id,
    });
  }
  return question;
}

async function findNextQuestionCandidate(sessionId) {
  return prisma.question.findFirst({
    where: {
      isActive: true,
      answers: {
        none: {
          sessionId,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });
}

function serializeResponse(response, inputType) {
  if (typeof response === 'string') {
    return response;
  }

  if (
    inputType === QuestionType.NUMBER ||
    typeof response === 'number' ||
    typeof response === 'boolean'
  ) {
    return String(response);
  }

  return JSON.stringify(response);
}

async function createEvent(sessionId, eventType, metadata) {
  await prisma.conversationEvent.create({
    data: {
      sessionId,
      eventType,
      metadata,
    },
  });
}
