export type Feature = string;

export type QuizChoice = { id: string; text: string };

export type QuizQuestion = {
  id: string;
  text: string;
  choices: QuizChoice[];
  correctChoiceId: string;
};

export interface StoredQuiz {
  quizId: string;
  objectType?: string;
  features: Feature[];
  questions: QuizQuestion[];
}

const store = new Map<string, StoredQuiz>();

export function saveQuiz(quiz: StoredQuiz) {
  store.set(quiz.quizId, quiz);
}

export function getQuiz(quizId: string): StoredQuiz | undefined {
  return store.get(quizId);
}
