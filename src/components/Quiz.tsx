"use client";

import type { FC, FormEvent } from "react";
import { useState } from "react";

export type QuizChoice = { id: string; text: string };

export type QuizQuestion = {
  id: string;
  text: string;
  choices: QuizChoice[];
  correctChoiceId: string;
};

export interface QuizResult {
  score: number;
  total: number;
  correctAnswers: Record<string, string>;
}

interface QuizProps {
  questions: QuizQuestion[];
  onResult: (result: QuizResult) => void;
}

const Quiz: FC<QuizProps> = ({ questions, onResult }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    let score = 0;
    const correctAnswers: Record<string, string> = {};

    for (const q of questions) {
      if (answers[q.id] && answers[q.id] === q.correctChoiceId) {
        score += 1;
      }
      correctAnswers[q.id] = q.correctChoiceId;
    }

    onResult({ score, total: questions.length, correctAnswers });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q) => (
        <fieldset
          key={q.id}
          className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/70 p-4"
        >
          <legend className="text-sm font-medium text-slate-100">
            {q.text}
          </legend>
          <div className="space-y-1 text-sm text-slate-200">
            {q.choices.map((choice) => (
              <label key={choice.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={q.id}
                  value={choice.id}
                  checked={answers[q.id] === choice.id}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  className="h-3 w-3 rounded border-slate-500 text-sky-500 focus:ring-sky-500"
                  required
                />
                <span>{choice.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
      >
        Submit answers
      </button>
    </form>
  );
};

export default Quiz;
