## Lost Item Identifier

This app helps verify whether a lost item really belongs to a claimant.

Users can either:

- Upload a **photo** of the item (Option A), or
- Provide **manual identifying features** like color, brand, and unique marks (Option B).

The system extracts or uses those features to build a short multiple‑choice quiz that only the real owner is likely to answer correctly.

---

## Getting Started

From the project root:

```bash
npm install
cp .env.example .env.local   # on Windows: copy .env.example .env.local
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- Home page (`src/app/page.tsx`): upload photo, fill manual details, and create a quiz.
- Quiz page (`src/app/quiz/[quizId]/page.tsx`): answer the generated questions and see a result like:
  - `✔ The item is yours.` when all answers are correct.
  - `Maybe not yours...` if some answers are wrong.

---

## Environment Variables

Configuration is managed via `.env.local` (never commit this file).

The template `/.env.example` defines:

- `OPENAI_API_KEY` – your OpenAI API key (optional for local mock mode).
- `USE_MOCK_AI` – when `true`, the app uses deterministic mock logic for feature extraction and quiz generation.

Typical local setup (mock‑only, no external calls):

```env
OPENAI_API_KEY=
USE_MOCK_AI=true
```

When you are ready to experiment with real AI calls:

```env
OPENAI_API_KEY=sk-...your-key...
USE_MOCK_AI=false
```

The API routes will then be ready to use `OPENAI_API_KEY` where the commented OpenAI client examples are placed.

---

## AI & Mock Behavior

All AI behavior is funneled through server‑side routes:

- `src/app/api/extract/route.ts`

  - Accepts an uploaded image (`multipart/form-data` field `image`).
  - In mock mode, runs a deterministic heuristic to produce features like file‑name hints and size‑based guesses.
  - Contains a commented `extractWithOpenAI` placeholder showing how to call a vision‑capable model with `FEATURE_EXTRACTION_PROMPT` from `src/lib/aiPrompts.ts`.

- `src/app/api/create-quiz/route.ts`
  - Accepts `{ features, objectType?, source: "image" | "manual" }`.
  - In mock mode, builds 3 multiple‑choice questions per item from the features.
  - Contains a commented `generateQuizWithAI` placeholder that would use `QUIZ_GENERATION_PROMPT` from `src/lib/aiPrompts.ts`.

Mock vs real:

- When `USE_MOCK_AI=true` **or** `OPENAI_API_KEY` is unset, the app always uses mock logic.
- When `USE_MOCK_AI=false` **and** `OPENAI_API_KEY` is set, you can plug in the OpenAI SDK in the commented sections to enable real AI.

---

## In‑Memory Quiz Store

For the MVP there is **no database**. Quizzes are stored in memory:

- `src/lib/sessionStore.ts` keeps a `Map<quizId, { features, questions, objectType? }>`.
- `create-quiz` saves quizzes into this map.
- `get-quiz` and `check-quiz` read from it to render and score quizzes.

Implications:

- Data is **lost on server restart**.
- In multi‑instance deployments you would need a shared store (Redis, Supabase, or a database) to replace this module.

To migrate later, replace the functions in `sessionStore.ts` with calls to your chosen backing store.

---

## Security Notes

- Never commit `.env.local` or any file containing real API keys.
- If you enable real AI calls:
  - Keep `OPENAI_API_KEY` **server‑side only** – never expose it in client or browser code.
  - Rotate keys periodically and on any suspicion of leakage.
- This app is intended as a demo/MVP. Do not use it as a legally binding identity or ownership verification system without additional safeguards.

---

## Scripts

Useful scripts in `package.json`:

- `npm run dev` – start the development server.
- `npm run build` – create a production build.
- `npm start` – run the production build.
- `npm run lint` – run ESLint.

You can edit the main UI in `src/app/page.tsx` and the quiz flow in `src/app/quiz/[quizId]/page.tsx`.

## Testing & CI

### install deps (once)
npm install
npx playwright install chromium

### run unit tests
npm test
#### or
npm run test:unit

### in one terminal, run dev server
npm run dev

### in another terminal, run e2e tests
npm run test:e2e
