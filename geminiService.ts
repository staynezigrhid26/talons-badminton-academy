
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "./types";

// Always use the API key directly from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTrainingPlanSuggestion = async (student: Student) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a customized badminton training plan for a student with the following profile:
      Name: ${student.name}
      Age: ${student.age}
      Level: ${student.level}
      Notes: ${student.notes}
      
      Suggest 3 specific exercises and a weekly focus.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyFocus: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["weeklyFocus", "exercises"]
        }
      }
    });

    // response.text is a property, not a method; provide a fallback for JSON parsing
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating training plan:", error);
    return null;
  }
};
