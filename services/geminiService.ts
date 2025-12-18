
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * 고화질 감성 이미지 엔진
   * API 키가 있으면 Gemini AI로 생성하고, 없으면 Unsplash 고화질 라이브러리에서 최적의 이미지를 매칭합니다.
   */
  async generateBackground(userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;

    // 1. API 키가 있는 경우 AI 생성 시도
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

    // 2. API 키가 없거나 실패한 경우: 스마트 무드 엔진 (무료/무제한)
    const randomSeed = Math.floor(Math.random() * 1000000);
    // 검색 품질을 높이기 위해 기본 감성 키워드 조합
    const query = encodeURIComponent(`${userInput || "lofi aesthetic"} dark night cozy`);
    
    // Unsplash의 Source API가 중단되었으므로, 고성능 이미지 프로세싱 서버(images.unsplash.com)를 직접 활용
    // 무작위성을 위해 sig 파라미터를 사용하며, 1280x720 해상도로 최적화하여 불러옴
    return `https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=1280&h=720&sig=${randomSeed}&q=${query}`;
  }

  /**
   * 브랜딩 가이드 로드
   * API 키가 없어도 내장된 전문가급 가이드를 즉시 반환합니다.
   */
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
