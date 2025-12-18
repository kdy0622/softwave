
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * 고화질 감성 이미지 엔진
   * API 키가 있으면 Gemini AI로 생성하고, 없으면 Unsplash 라이브러리에서 동적으로 이미지를 가져옵니다.
   */
  async generateBackground(userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;

    // 1. API 키가 있는 경우 AI 생성 시도 (Gemini 2.5 Flash Image)
    if (apiKey && apiKey !== "undefined" && apiKey !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const styleInstruction = "Cinematic 16:9 lofi background, soft dreamy lighting, cozy atmosphere, no text, plenty of negative space for typography. Aesthetic: ";
        const finalPrompt = styleInstruction + (userInput || "deep night sky with stars");

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: finalPrompt }] },
          config: {
            imageConfig: { aspectRatio: "16:9" }
          }
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart?.inlineData?.data) {
          return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
      } catch (error) {
        console.warn("AI 생성 제한으로 인해 무드 엔진으로 자동 전환합니다.");
      }
    }

    // 2. API 키가 없거나 실패한 경우: 스마트 무드 엔진 (Dynamic Unsplash Search)
    const randomSeed = Math.floor(Math.random() * 1000000);
    const keywords = userInput ? userInput.split(' ').join(',') : 'lofi,night,cozy';
    
    // 특정 이미지 ID(photo-...)에 갇히지 않도록 source.unsplash.com의 featured 형식을 활용하거나 
    // 이미지 프로세싱 파라미터를 통해 검색어 기반의 새로운 이미지를 유도합니다.
    // Unsplash의 비공식 검색 API 형식을 사용하여 검색어에 맞는 무작위 이미지를 반환받습니다.
    return `https://source.unsplash.com/featured/1280x720/?${keywords}&sig=${randomSeed}`;
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") return DEFAULT_BRANDING;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "음악 채널 'Softwave'를 위한 감성 브랜딩 가이드. 한국어로 JSON 응답.",
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
              copywriting: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["keywords", "colors", "layouts", "copywriting"]
          }
        }
      });

      const text = response.text?.trim() || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      return DEFAULT_BRANDING;
    }
  }
}
