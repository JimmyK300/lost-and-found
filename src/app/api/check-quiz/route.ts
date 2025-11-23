import { NextResponse } from "next/server";
import { getQuiz } from "../../../lib/sessionStore";

interface CheckQuizBody {
  quizId: string;
  answers: Record<string, string>;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | CheckQuizBody
    | null;

  if (!body || typeof body.quizId !== "string") {
    return NextResponse.json(
      { error: "quizId and answers are required" },
      { status: 400 },
    );
  }

  const quiz = getQuiz(body.quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  let score = 0;
  const total = quiz.questions.length;

  for (const q of quiz.questions) {
    if (body.answers[q.id] && body.answers[q.id] === q.correctChoiceId) {
      score += 1;
    }
  }

  const correct = score === total;

  return NextResponse.json({ correct, score, total });
}
