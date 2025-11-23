import { NextResponse } from "next/server";
import { FEATURE_EXTRACTION_PROMPT } from "../../../lib/aiPrompts";

import OpenAI from "openai";

// Deterministic mock feature extractor for local dev.
// In later phases, this can call a real vision model.

async function mockExtractFeaturesFromFile(file: File) {
  const sizeKb = Math.round(file.size / 1024);
  const baseName = file.name.replace(/\.[^.]+$/, "");

  const features = [
    `File name hints: ${baseName}`,
    sizeKb > 1024
      ? "Appears to be a large, detailed image"
      : "Compact image size (likely a simple scene)",
    "Unique mark estimate: check for scratches, stickers, or engravings",
  ];

  return {
    features,
    objectType: "unknown",
  };
}

// Placeholder for a real OpenAI Vision call.
// This is intentionally mocked out unless OPENAI_API_KEY is set.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractWithOpenAI(imageBase64: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: FEATURE_EXTRACTION_PROMPT,
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: "Here is the image" },
          {
            type: "input_image",
            image_url: {
              // you can assume JPEG here for MVP; adjust if needed
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  });

  const text = response.output[0].content[0].text;
  const parsed = JSON.parse(text) as {
    features: string[];
    objectType?: string;
  };

  return parsed;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file field 'image'" },
        { status: 400 },
      );
    }

    const useMock =
      process.env.USE_MOCK_AI === "true" || !process.env.OPENAI_API_KEY;

    if (useMock) {
      const result = await mockExtractFeaturesFromFile(file);
      return NextResponse.json(result);
    }

    // If you want to send raw bytes instead, convert to base64 here.
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
    const result = await extractWithOpenAI(imageBase64);
    return NextResponse.json(result);
  }

  // Fallback: JSON body with data URL base64 (not used by current UI).
  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (!body?.imageDataUrl || typeof body.imageDataUrl !== "string") {
      return NextResponse.json(
        { error: "Expected imageDataUrl string in JSON body" },
        { status: 400 },
      );
    }

    const result = {
      features: [
        "Image provided as data URL (mock analysis)",
        "Consider plugging in a real vision model here.",
      ],
      objectType: "unknown",
    };
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "Unsupported content type" },
    { status: 400 },
  );
}
