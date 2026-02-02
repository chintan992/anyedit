import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, EditConfig } from "../types";

// Default client for basic analysis (uses env key or injected key)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL_NAME = "gemini-3-flash-preview";
// Updated to Gemini 2.5 Flash Image as requested
const EDIT_MODEL_NAME = "gemini-2.5-flash-image";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);

  const prompt = `
    Analyze the provided image.
    
    CRITICAL PRIVACY INSTRUCTION:
    - Do NOT identify specific real people, celebrities, or public figures by name.
    - Instead, describe them generally (e.g., "adult female", "young male").
    - You MUST explicitly identify the gender of subjects as a feature (e.g., Male, Female, Non-binary, Androgynous).
    
    Structure the analysis into exactly these five categories:
    1. Subject: Who is in the photo? (Gender, apparel, pose).
    2. Background: What is the setting?
    3. Lighting: Sources and quality.
    4. Composition: Framing and perspective.
    5. Aesthetic: Style and mood.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      Subject: {
        type: Type.OBJECT,
        properties: {
          general_summary: { type: Type.STRING, description: "Overview of subjects without naming identities." },
          entities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                gender: { type: Type.STRING, description: "Explicit gender identification (e.g. Female, Male)." },
                description: { type: Type.STRING, description: "Physical appearance without identity." },
                apparel: { type: Type.STRING },
                pose: { type: Type.STRING },
              },
              required: ["gender", "description", "apparel", "pose"],
            },
          },
        },
        required: ["general_summary", "entities"],
      },
      Background: {
        type: Type.OBJECT,
        properties: {
          general_summary: { type: Type.STRING },
          location: { type: Type.STRING },
          elements: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["general_summary", "location", "elements"],
      },
      Lighting: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          source: { type: Type.STRING },
          quality: { type: Type.STRING },
        },
        required: ["description", "source", "quality"],
      },
      Composition: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          perspective: { type: Type.STRING },
          framing: { type: Type.STRING },
        },
        required: ["description", "perspective", "framing"],
      },
      Aesthetic: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          style: { type: Type.STRING },
          mood: { type: Type.STRING },
        },
        required: ["description", "style", "mood"],
      },
    },
    required: ["Subject", "Background", "Lighting", "Composition", "Aesthetic"],
  };

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert visual analyst. You prioritize privacy by anonymizing identities but accurately classify gender and visual features.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateEditedImage = async (
  file: File, 
  config: EditConfig
): Promise<string> => {
  const base64Data = await fileToGenerativePart(file);

  // Dynamic client creation to pick up the latest API key (handled by window.aistudio flow in App.tsx)
  const dynamicAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await dynamicAi.models.generateContent({
    model: EDIT_MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        {
          text: config.prompt,
        },
      ],
    },
    // Gemini 2.5 Flash Image uses imageConfig but note: 
    // it does NOT support responseMimeType or responseSchema
    // 2.5 Flash Image supports aspect ratio but not specifically 'imageSize' param (only Pro supports 'imageSize')
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio,
      },
    },
  });

  // Iterate to find the image part
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
       // Assuming PNG for generated images usually, or match source if possible.
       return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};
