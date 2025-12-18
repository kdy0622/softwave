
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * Gemini 3 Pro Image 모델을 사용한 하이퍼 리얼리스틱 배경 생성
   */
  async generateBackground(userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      throw new Error("API Key is not configured. Please select a valid API key.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanPrompt = (userInput || "High-resolution reality").trim();

    const realisticPrompt = `
      [IMAGE_GEN_PROMPT]
      Subject: ${cleanPrompt}
      Style: Cinematic hyper-realistic 8K photography, professional architectural and nature photography.
      Technical: Shot on Phase One XF, 80mm lens, f/8, iso 100. Extremely high dynamic range, global illumination.
      Atmosphere: Ethereal and moody lighting, perfect for a high-end music channel background.
      Negative: No people, no faces, no cartoon, no 3D render, no drawing, no low resolution, no text, no logos.
    `.trim();
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: realisticPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
          },
          tools: [{ googleSearch: {} }] 
        }
      });

      const candidate = response.candidates?.[0];
      if (!candidate) {
        throw new Error("No candidates returned from API. Check safety settings or prompt.");
      }

      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      const textPart = candidate.content?.parts?.find(p => p.text);
      if (textPart?.text) {
        throw new Error(`Model Refusal: ${textPart.text}`);
      }

      throw new Error("No image data found in response. The model might have filtered the content.");
    } catch (e: any) {
      console.error("Gemini Pro Image Generation Error Details:", e);
      if (e.message?.includes("Requested entity was not found")) {
        throw new Error("API Key Project Not Found. 유료 프로젝트의 API 키인지 확인해주세요.");
      }
      const randomSig = Math.floor(Math.random() * 100000);
      return `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=90&w=1280&h=720&sig=${randomSig}`;
    }
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") return DEFAULT_BRANDING;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "음악 채널 'Softwave'를 위한 감성적이고 차분한 브랜딩 가이드를 생성해줘. 모든 텍스트와 20개의 추천 문구(copywriting)는 반드시 한국어로 작성하고, 각 문구 끝에 마침표(.)를 절대로 넣지 마. JSON 형식 응답.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              colors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { hex: { type: Type.STRING }, name: { type: Type.STRING } },
                  required: ["hex", "name"]
                }
              },
              layouts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING } },
                  required: ["id", "name", "description"]
                }
              },
              copywriting: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 20, maxItems: 20 }
            },
            required: ["keywords", "colors", "layouts", "copywriting"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Branding Guide Fetch Error:", e);
      return DEFAULT_BRANDING;
    }
  }
}
