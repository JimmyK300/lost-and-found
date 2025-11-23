import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveQuiz, type Feature, type QuizQuestion } from "../../../lib/sessionStore";
import { QUIZ_GENERATION_PROMPT } from "../../../lib/aiPrompts";

import OpenAI from "openai";

interface CreateQuizBody {
  features: Feature[];
  objectType?: string;
  source: "image" | "manual";
}

function buildMockQuestions(features: Feature[]): QuizQuestion[] {
  const base = features.slice(0, 3);

  return base.map((feature, index) => {
    const id = `q${index + 1}`;
    const lower = feature.toLowerCase();

    let text = `Which detail best matches this item? (${feature})`;
    const choices = [feature];

    if (lower.includes("left") || lower.includes("right")) {
      text = "Which side is described as different?";
      choices.splice(0, choices.length, "Left", "Right", "Both", "Neither");
    } else if (lower.includes("black") || lower.includes("blue") || lower.includes("red")) {
      text = "What is the main color of the item?";
      choices.splice(0, choices.length, "Black", "Blue", "Red", "Other");
    } else if (lower.includes("scratch") || lower.includes("crack")) {
      text = "What kind of damage does the item have?";
      choices.splice(0, choices.length, "Scratch", "Crack", "Dent", "No visible damage");
    } else {
      while (choices.length < 4) {
        choices.push(`${feature} (slightly different)`);
      }
    }

    const correctChoiceText = choices[0];

    return {
      id,
      text,
      choices: choices.map((c, i) => ({ id: String.fromCharCode(97 + i), text: c })),
      correctChoiceId: "a",
    } satisfies QuizQuestion;
  });
}

// Placeholder for an AI-powered quiz generator.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateQuizWithAI(features: Feature[], objectType?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const payload = { features, objectType };

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: QUIZ_GENERATION_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
  });

  const text = response.output[0].content[0].text;
  const parsed = JSON.parse(text) as { questions: QuizQuestion[] };

  return parsed.questions;
}
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | CreateQuizBody
    | null;

  if (!body || !Array.isArray(body.features) || body.features.length === 0) {
    return NextResponse.json(
      { error: "features array is required" },
      { status: 400 },
    );
  }

  const quizId = randomUUID();

  const useMock =
    process.env.USE_MOCK_AI === "true" || !process.env.OPENAI_API_KEY;

  const questions = useMock
    ? buildMockQuestions(body.features)
    : await generateQuizWithAI(body.features, body.objectType);

  saveQuiz({
    quizId,
    objectType: body.objectType,
    features: body.features,
    questions,
  });

  return NextResponse.json({ quizId, questions });
}
