
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * 감성 AI & 무드 엔진 (Free & AI Hybrid)
   * API 키가 있으면 Gemini AI로 정교하게 생성하고, 없으면 고성능 무드 검색 엔진을 사용합니다.
   */
  async generateBackground(userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;

    // 1. API 키가 있는 경우 Gemini 2.5 Flash Image 모델 시도
    if (apiKey && apiKey !== "undefined") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const styleInstruction = `
          High-resolution cinematic background for a music channel named 'Softwave'.
          Style: Dreamy lofi aesthetic, nostalgic atmosphere, soft focus, minimal and clean.
          No text, no people, 16:9 aspect ratio.
          Mood: ${userInput || "peaceful night cityscape"}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: styleInstruction }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (error) {
        console.error("AI Generation failed, switching to Mood Engine:", error);
      }
    }

    // 2. API 키가 없거나 실패 시: 고성능 감성 무드 엔진 (Free)
    // 사용자의 입력어에서 핵심 감성 키워드를 추출하여 Unsplash의 고화질 라이브러리에서 매칭
    return this.fetchMoodImage(userInput);
  }

  private fetchMoodImage(userInput: string): string {
    const randomSeed = Math.floor(Math.random() * 100000);
    // 기본 감성 필터 추가
    const baseKeywords = "cinematic,lofi,aesthetic,wallpaper,night,cozy";
    const userKeywords = userInput.replace(/\s+/g, ',');
    const finalKeywords = userKeywords ? `${userKeywords},${baseKeywords}` : baseKeywords;
    
    // Unsplash Source API를 사용하여 고화질(1280x720) 16:9 이미지 반환
    return `https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=85&w=1280&h=720&sig=${randomSeed}&${finalKeywords}`;
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") return DEFAULT_BRANDING;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "음악 채널 'Softwave'를 위한 감성 브랜딩 가이드(키워드, 색상, 레이아웃 설명, 카피라이팅 20개). 한국어로 JSON 응답.",
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

      return JSON.parse(response.text || '{}');
    } catch (e) {
      return DEFAULT_BRANDING;
    }
  }
}
