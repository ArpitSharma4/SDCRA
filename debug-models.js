// debug-models.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  console.log("🔍 Scanning for available models...");
  try {
    // This fetches the actual list from Google's servers
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}` 
    );
    const data = await response.json();

    if (data.models) {
      console.log("✅ ACCESS GRANTED. AVAILABLE MODELS:");
      data.models.forEach(m => {
        // Only show "generateContent" models (the ones for chat)
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`   - ${m.name.replace("models/", "")}`);
        }
      });
    } else {
      console.error("❌ ERROR:", data);
    }
  } catch (error) {
    console.error("❌ CONNECTION FAILED:", error.message);
  }
}

listModels();
