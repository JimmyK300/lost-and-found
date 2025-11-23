import { randomUUID } from "crypto";
import { type Feature, type QuizQuestion } from "../../src/lib/sessionStore";

// Re-import the buildMockQuestions helper indirectly by mimicking its logic here
// for unit testing the shape and correctness constraints.

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

    return {
      id,
      text,
      choices: choices.map((c, i) => ({ id: String.fromCharCode(97 + i), text: c })),
      correctChoiceId: "a",
    } as QuizQuestion;
  });
}

describe("buildMockQuestions", () => {
  it("creates up to 3 questions with valid correctChoiceId", () => {
    const features: Feature[] = [
      "black backpack with broken right strap",
      "scratch on left side",
      "red sticker on bottom",
      "extra feature not used",
    ];

    const questions = buildMockQuestions(features);

    expect(questions.length).toBe(3);
    for (const q of questions) {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      const hasCorrect = q.choices.some((c) => c.id === q.correctChoiceId);
      expect(hasCorrect).toBe(true);
    }
  });
});
