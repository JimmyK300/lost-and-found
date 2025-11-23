import { NextResponse } from "next/server";
import { getQuiz } from "../../../lib/sessionStore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId");

  if (!quizId) {
    return NextResponse.json(
      { error: "quizId query parameter is required" },
      { status: 400 },
    );
  }

  const quiz = getQuiz(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json(quiz);
}
