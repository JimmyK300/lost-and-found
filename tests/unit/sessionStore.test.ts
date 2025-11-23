import { saveQuiz, getQuiz } from "../../src/lib/sessionStore";

describe("sessionStore", () => {
  it("saves and retrieves a quiz by id", () => {
    const quiz = {
      quizId: "test-123",
      objectType: "bag",
      features: ["black", "logo on front"],
      questions: [],
    };

    saveQuiz(quiz);
    const stored = getQuiz("test-123");

    expect(stored).toBeDefined();
    expect(stored?.quizId).toBe("test-123");
    expect(stored?.features).toContain("black");
  });
});
