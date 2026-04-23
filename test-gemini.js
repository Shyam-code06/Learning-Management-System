const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: "./server/.env" });

const testGemini = async () => {
  try {
    console.log("Testing Gemini API...");
    console.log("API Key starts with:", process.env.GEMINI_API_KEY?.substring(0, 5));

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.error("No valid API key found in server/.env");
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Say hello and confirm you are working.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Gemini Test Error:", error);
  }
};

testGemini();
