"use client";

import { useEffect, useMemo, useState } from "react";
import ImagePreview from "../components/ImagePreview";
import FeatureList from "../components/FeatureList";
import { useRouter } from "next/navigation";

type Feature = string;

type QuizChoice = { id: string; text: string };

type QuizQuestion = {
  id: string;
  text: string;
  choices: QuizChoice[];
  correctChoiceId: string;
};

type ExtractResponse = {
  features: Feature[];
  objectType?: string;
};

export default function Home() {
  const router = useRouter();

  const [file, setFile] = useState<File | undefined>();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [manualColor, setManualColor] = useState("");
  const [manualBrand, setManualBrand] = useState("");
  const [manualMarks, setManualMarks] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const manualFeatures = useMemo(() => {
    const list: Feature[] = [];
    if (manualColor.trim()) list.push(`Color: ${manualColor.trim()}`);
    if (manualBrand.trim()) list.push(`Brand: ${manualBrand.trim()}`);
    if (manualMarks.trim()) list.push(`Marks: ${manualMarks.trim()}`);
    if (manualDescription.trim())
      list.push(`Description: ${manualDescription.trim()}`);
    return list;
  }, [manualColor, manualBrand, manualMarks, manualDescription]);

  async function handleAnalyzePhoto() {
    if (!file) {
      setError("Please choose a photo first.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = (await res.json()) as ExtractResponse;
      setFeatures(data.features ?? []);
    } catch (err) {
      console.error(err);
      setError("Could not analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleCreateQuizFromManual() {
    if (manualFeatures.length === 0) {
      setError("Please enter at least one identifying feature.");
      return;
    }
    setError(null);
    setIsCreatingQuiz(true);
    try {
      const res = await fetch("/api/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: manualFeatures,
          source: "manual",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create quiz");
      }

      const data = (await res.json()) as { quizId: string };
      router.push(`/quiz/${encodeURIComponent(data.quizId)}`);
    } catch (err) {
      console.error(err);
      setError("Could not create quiz. Please try again.");
    } finally {
      setIsCreatingQuiz(false);
    }
  }

  async function handleCreateQuizFromImageFeatures() {
    if (features.length === 0) {
      setError("Analyze a photo first to extract features.");
      return;
    }
    setError(null);
    setIsCreatingQuiz(true);
    try {
      const res = await fetch("/api/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features,
          source: "image",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create quiz");
      }

      const data = (await res.json()) as { quizId: string };
      router.push(`/quiz/${encodeURIComponent(data.quizId)}`);
    } catch (err) {
      console.error(err);
      setError("Could not create quiz. Please try again.");
    } finally {
      setIsCreatingQuiz(false);
    }
  }

  function handleResetImage() {
    setFile(undefined);
    setImagePreviewUrl(undefined);
    setFeatures([]);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Check if a lost item is really yours
        </h2>
        <p className="text-sm text-slate-400">
          Upload a photo or describe your item. We&apos;ll extract
          identifying features and turn them into a short quiz that only the
          real owner is likely to pass.
        </p>
      </section>

      {error && (
        <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wide">
            Option A · Photo input
          </h3>

          <label className="block rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm cursor-pointer hover:border-slate-500 transition">
            <span className="block font-medium mb-1">Upload or take a photo</span>
            <span className="block text-xs text-slate-400 mb-2">
              Use your camera or choose from your gallery.
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setError(null);
                }
              }}
            />
            <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
              Choose photo
            </span>
          </label>

          <ImagePreview
            file={file}
            previewUrl={imagePreviewUrl}
            onRetake={handleResetImage}
          />

          <button
            type="button"
            onClick={handleAnalyzePhoto}
            disabled={!file || isAnalyzing}
            className="w-full inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing photo…" : "Analyze Photo"}
          </button>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-slate-200">Extracted features</h4>
            <p className="text-xs text-slate-500">
              This is what the system thinks makes the item unique. You can
              edit these before generating a quiz.
            </p>
            <FeatureList
              features={features}
              onChange={setFeatures}
              placeholder="No features yet. Analyze a photo to start."
            />
          </div>

          <button
            type="button"
            onClick={handleCreateQuizFromImageFeatures}
            disabled={features.length === 0 || isCreatingQuiz}
            className="w-full inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingQuiz
              ? "Creating quiz…"
              : "Create Quiz from Photo Features"}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wide">
            Option B · Manual input
          </h3>

          <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Color
              </label>
              <input
                value={manualColor}
                onChange={(e) => setManualColor(e.target.value)}
                placeholder="e.g. matte black"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Brand / logo
              </label>
              <input
                value={manualBrand}
                onChange={(e) => setManualBrand(e.target.value)}
                placeholder="e.g. Nike, Apple, Ray-Ban"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Unique marks
              </label>
              <input
                value={manualMarks}
                onChange={(e) => setManualMarks(e.target.value)}
                placeholder="e.g. scratch on right lens, initials inside strap"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Short description
              </label>
              <textarea
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="e.g. small black backpack with a broken right strap"
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-slate-200">Manual feature preview</h4>
            <p className="text-xs text-slate-500">
              These features will be used to build quiz questions. Only add
              details a real owner would remember.
            </p>
            <FeatureList
              features={manualFeatures}
              onChange={setFeatures}
              readOnly
              placeholder="No manual features yet. Fill in the form above."
            />
          </div>

          <button
            type="button"
            onClick={handleCreateQuizFromManual}
            disabled={manualFeatures.length === 0 || isCreatingQuiz}
            className="w-full inline-flex items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-indigo-950 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingQuiz
              ? "Creating quiz…"
              : "Create Quiz from Manual Input"}
          </button>
        </div>
      </section>
    </div>
  );
}