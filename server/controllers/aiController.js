const { GoogleGenerativeAI } = require("@google/generative-ai");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

exports.askAI = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(200).json(new ApiResponse(200, { 
      text: "I'm ready to help! However, the Gemini API key is missing in the server's .env file. Please add a valid key and restart the server to enable AI responses." 
    }, "API Key missing"));
  }

  // 1. Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

  // 2. Fetch user's enrolled courses for context
  const enrollments = await Enrollment.find({ userId: req.user._id }).populate("courseId");
  
  let courseContext = "";
  if (enrollments.length > 0) {
    courseContext = "The student is currently enrolled in the following courses:\n";
    enrollments.forEach((e, index) => {
      if (e.courseId) {
        courseContext += `${index + 1}. ${e.courseId.title}: ${e.courseId.description}\n`;
      }
    });
  }

  // 3. Build the prompt
  const prompt = `
    You are an expert academic assistant for "Ecera Learning Management System".
    Your goal is to help students with their course-related questions.
    
    ${courseContext}
    
    Student Question: "${message}"
    
    Instructions:
    - Provide a professional, helpful, and encouraging response.
    - If the question is about a specific course the student is enrolled in, use the provided context.
    - If the question is general, provide expert advice related to the field (Development, Design, etc.).
    - Keep the response concise but informative.
    - Use Markdown for formatting if necessary.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();


    res.status(200).json(new ApiResponse(200, { text }, "AI response generated"));
  } catch (error) {
    console.error("Gemini AI Error:", error);
    if (error.status === 429) {
        return res.status(200).json(new ApiResponse(200, { 
          text: "I'm receiving too many requests right now. Please wait about 30-60 seconds and try again! (Google's Free Tier limit reached)" 
        }, "Rate limit reached"));
    }
    throw new ApiError(500, "Failed to get response from AI. Please check if the GEMINI_API_KEY is valid.");
  }
});

exports.askAdminAI = asyncHandler(async (req, res) => {
  const { message, stats } = req.body;

  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(200).json(new ApiResponse(200, { 
      text: "Admin AI is ready! Please add your GEMINI_API_KEY to the server .env to enable live insights." 
    }, "API Key missing"));
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

  const platformStats = stats ? `
    Current Platform Statistics:
    - Total Revenue: $${stats.totalRevenue || 0}
    - Total Students: ${stats.totalStudents || 0}
    - Total Courses: ${stats.totalCourses || 0}
  ` : "";

  const prompt = `
    You are the "Ecera Platform Intelligence Bot", a high-level assistant for the Academy Administrator.
    Your goal is to provide strategic advice, management tips, and data insights.
    
    ${platformStats}
    
    Admin Question: "${message}"
    
    Instructions:
    - Be professional, data-driven, and strategic.
    - Provide advice on how to increase revenue, improve student engagement, or manage courses better.
    - If stats are provided, use them to give specific insights.
    - Use Markdown for clear formatting (bullet points, bold text).
    - Keep responses concise but high-value.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();


    res.status(200).json(new ApiResponse(200, { text }, "Admin AI response generated"));
  } catch (error) {
    console.error("Gemini Admin AI Error:", error);
    if (error.status === 429) {
        return res.status(200).json(new ApiResponse(200, { 
          text: "The AI is currently busy with high traffic. Please try again in a minute." 
        }, "Rate limit reached"));
    }
    throw new ApiError(500, `Gemini AI Error: ${error.message || "Failed to get response"}`);
  }
});
