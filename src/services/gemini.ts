import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface FraudExplanation {
  fraud_probability: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  top_features: { feature: string; contribution: number; reason: string }[];
  summary: string;
}

export async function explainTransaction(transaction: any): Promise<FraudExplanation> {
  const prompt = `You are a fraud detection expert system (SHAP Explainer). 
  Analyze this transaction and explain if it looks like fraud.
  The features V1-V28 are PCA transformed components of the transaction history.
  
  Transaction Data:
  ${JSON.stringify(transaction, null, 2)}
  
  Provide a detailed explanation of the fraud risk.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fraud_probability: { type: Type.NUMBER },
          risk_level: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          top_features: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                contribution: { type: Type.NUMBER, description: "Normalized SHAP-like value between -1 and 1" },
                reason: { type: Type.STRING }
              },
              required: ["feature", "contribution", "reason"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["fraud_probability", "risk_level", "top_features", "summary"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
