"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Quiz, { type QuizQuestion, type QuizResult } from "../../../components/Quiz";

interface StoredQuiz {
  quizId: string;
  objectType?: string;
  features: string[];
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();
  const quizId = params?.quizId;

  const [quiz, setQuiz] = useState<StoredQuiz | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;

    async function fetchQuiz() {
      try {
        const res = await fetch(
          `/api/get-quiz?quizId=${encodeURIComponent(quizId as string)}`,
        );
        if (!res.ok) {
          throw new Error("Failed to fetch quiz");
        }
        const data = (await res.json()) as StoredQuiz;
        setQuiz(data);
        setStatus("loaded");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    fetchQuiz();
  }, [quizId]);

  async function handleResult({ score, total, correctAnswers }: QuizResult) {
    try {
      const res = await fetch("/api/check-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers: correctAnswers }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify quiz");
      }

      const data = (await res.json()) as { correct: boolean };
      const correct = data.correct ?? score === total;

      if (correct) {
        setResultMessage("✔ The item is yours.");
      } else {
        setResultMessage(
          `Maybe not yours. You scored ${score} out of ${total} questions.`,
        );
      }
    } catch (err) {
      console.error(err);
      setResultMessage("Could not verify quiz results. Please try again.");
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-slate-400">Loading quiz…</p>;
  }

  if (status === "error" || !quiz) {
    return (
      <div className="space-y-3 text-sm text-slate-400">
        <p>We couldn&apos;t load this quiz. It may have expired.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-sky-400"
        >
          Back to start
        </button>
      </div>
    );
  }

  if (resultMessage) {
    const success = resultMessage.startsWith("✔");
    return (
      <div className="space-y-4">
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${success ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-100" : "border-amber-500/60 bg-amber-950/40 text-amber-100"}`}
        >
          {resultMessage}
        </div>
        <div className="flex gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center rounded-md bg-slate-800 px-3 py-1.5 font-medium text-slate-100 hover:bg-slate-700"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100">
        Answer a few questions about your item
      </h2>
      <p className="text-xs text-slate-400">
        If you really own this item, these questions should feel obvious.
      </p>
      <Quiz questions={quiz.questions} onResult={handleResult} />
    </div>
  );
}
