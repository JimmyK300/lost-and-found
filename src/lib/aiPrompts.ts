export const FEATURE_EXTRACTION_PROMPT = `Given the following image, extract 3–6 concise identifying features an owner would remember.
Output JSON: { "features": ["feature 1","feature 2", ...], "objectType": "watch|bag|wallet|other" }.

Example output:
{ "features": ["brown leather strap with deep scratch on clasp","engraved initials 'C.M.' on inner cover"], "objectType": "watch" }`;

export const QUIZ_GENERATION_PROMPT = `Given a features array and optional objectType, return JSON of the form
{ "questions": [{"id":"q1","text":"...","choices":[{"id":"a","text":"..."}],"correctChoiceId":"a"}, ...] }.

Create 3 multiple-choice questions focusing on details that a real owner would remember.
Provide plausible but wrong alternatives for each question.`;
