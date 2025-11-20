import { GoogleGenAI, Type } from "@google/genai";
import { CleaningAnalysis } from "../types";

const apiKey = process.env.API_KEY;
// Initialize the client with the API Key from the environment
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Converts a File object to a base64 string usable by the Gemini API.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeCleanliness = async (imageFile: File): Promise<CleaningAnalysis> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `
      Eres un experto inspector de limpieza profesional para apartamentos de lujo. 
      Analiza la imagen subida.
      
      Tu tarea es:
      1. Identificar qué habitación es (ej: Cocina, Baño, Dormitorio, Sala, Balcón, etc.).
      2. Asignar un puntaje de limpieza de 0 a 100. 
         - 100 significa absolutamente impecable, listo para un huésped VIP.
         - < 50 significa suciedad visible significativa o desorden.
         - 90-99 significa muy limpio pero con detalles menores omitidos.
      3. Proporcionar un breve resumen de la condición.
      4. Listar problemas específicos encontrados (ej: "Polvo en el zócalo", "Mancha en el espejo").
      5. Proporcionar consejos accionables y específicos para lograr un puntaje de 100.
      
      IMPORTANTE: Responde en Español.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomName: { type: Type.STRING, description: "The type of room identified (e.g., Cocina, Baño)." },
            score: { type: Type.INTEGER, description: "The cleanliness score between 0 and 100." },
            summary: { type: Type.STRING, description: "A brief summary of the cleanliness state." },
            issues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of specific cleanliness issues identified in the image."
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable steps to fix the issues and reach a score of 100."
            }
          },
          required: ["roomName", "score", "summary", "issues", "tips"]
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from Gemini.");
    }

    const result = JSON.parse(text) as CleaningAnalysis;
    return result;

  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};