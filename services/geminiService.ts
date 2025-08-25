import { GoogleGenAI, Type } from "@google/genai";
import type { QuizData } from '../types';

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        multipleChoice: {
            type: Type.ARRAY,
            description: "A list of multiple-choice questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question text." },
                    options: { 
                        type: Type.ARRAY,
                        description: "An array of 4 possible answers.",
                        items: { type: Type.STRING } 
                    },
                    correctAnswer: { type: Type.STRING, description: "The correct answer from the options." }
                },
                 required: ["question", "options", "correctAnswer"]
            }
        },
        trueFalse: {
            type: Type.ARRAY,
            description: "A list of true/false questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question text." },
                    correctAnswer: { type: Type.BOOLEAN, description: "The correct boolean answer." }
                },
                required: ["question", "correctAnswer"]
            }
        },
        shortAnswer: {
            type: Type.ARRAY,
            description: "A list of short-answer questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question text." },
                    answer: { type: Type.STRING, description: "The correct answer." }
                },
                required: ["question", "answer"]
            }
        },
        topicSummaries: {
            type: Type.ARRAY,
            description: "A list of summaries for key topics in the document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING, description: "The name of the topic." },
                    summary: { type: Type.STRING, description: "A concise summary of the topic." }
                },
                required: ["topic", "summary"]
            }
        }
    },
    required: ["multipleChoice", "trueFalse", "shortAnswer", "topicSummaries"]
};

export const generateQuiz = async (documentText: string, apiKey: string): Promise<QuizData> => {
    if (!apiKey) {
        throw new Error("API Key is missing. Please provide a valid key.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert educator's assistant. Based on the following text from an educational document, please generate a comprehensive learning module. It is absolutely critical that your response contains all four of the following sections: 'multipleChoice', 'trueFalse', 'shortAnswer', and 'topicSummaries'.

Create exactly 5 multiple-choice questions (each with 4 options), 5 true/false questions, 3 short-answer questions, and a concise summary for each of the main topics covered in the text.

If you cannot generate content for a specific section for any reason, you MUST provide an empty array for it (e.g., "shortAnswer": []). DO NOT omit any keys from the final JSON object. Your adherence to this format is crucial.

Here is the document text:
---
${documentText.substring(0, 30000)}
---

Please generate the learning module now.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.7,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    const validatedQuizData: QuizData = {
        multipleChoice: Array.isArray(parsedJson.multipleChoice) ? parsedJson.multipleChoice : [],
        trueFalse: Array.isArray(parsedJson.trueFalse) ? parsedJson.trueFalse : [],
        shortAnswer: Array.isArray(parsedJson.shortAnswer) ? parsedJson.shortAnswer : [],
        topicSummaries: Array.isArray(parsedJson.topicSummaries) ? parsedJson.topicSummaries : [],
    };
    
    return validatedQuizData;

  } catch (error) {
    console.error("Error generating quiz from Gemini:", error);
    if (error instanceof Error && (error.message.includes('[400]') || error.message.toLowerCase().includes('api key not valid'))) {
         throw new Error("Your API Key is not valid. Please check the key and try again.");
    }
    throw new Error("The AI failed to generate a quiz. The content may be too short, complex, or the service may be temporarily unavailable.");
  }
};