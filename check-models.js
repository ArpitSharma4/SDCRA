import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("🔍 Checking Gemini API connection...");
    console.log(`📡 API Key: ${process.env.GEMINI_API_KEY ? 'Loaded' : 'NOT FOUND'}`);
    
    // Test gemini-pro first (most stable)
    console.log("\n🧪 Testing gemini-pro...");
    const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
    const resultPro = await modelPro.generateContent("Hello, respond with 'SUCCESS' if you can read this.");
    console.log("✅ gemini-pro is working:", resultPro.response.text());
    
    // Test gemini-1.5-flash if pro works
    console.log("\n🧪 Testing gemini-1.5-flash...");
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultFlash = await modelFlash.generateContent("Hello, respond with 'SUCCESS' if you can read this.");
    console.log("✅ gemini-1.5-flash is working:", resultFlash.response.text());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Suggested fixes:");
    console.log("1. Check your GEMINI_API_KEY in .env file");
    console.log("2. Ensure API key is enabled for Gemini API");
    console.log("3. Try using 'gemini-pro' instead of 'gemini-1.5-flash'");
  }
}

listModels();
