import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

console.log("API key exists:", !!apiKey);

const ai = new GoogleGenAI({
  apiKey: apiKey!,
});

async function test() {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: "Say hello in one sentence.",
  });

  console.log("Gemini:", response.text);
}

test().catch(console.error);
