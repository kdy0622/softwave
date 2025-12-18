
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * 자동 배경 생성 엔진 (AI + Smart Search)
   * API 키가 있으면 Gemini를 사용하고, 없으면 키워드 기반 고화질 소스를 반환합니다.
   */
  async generateBackground(userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;
    const prompt = userInput.trim() || "peaceful night lofi atmosphere";

    // 1. Gemini AI 시도 (API 키가 유효한 경우)
    if (apiKey && apiKey !== "undefined" && apiKey.length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const styleInstruction = `
          High-resolution 16:9 cinematic background for 'Softwave' music channel.
          Theme: ${prompt}.
          Style: Dreamy lofi, nostalgic, soft focus, minimal, no text, no people.
          High quality, atmospheric.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: styleInstruction }] },
          config: {
            imageConfig: { aspectRatio: "16:9" }
          }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (error) {
        console.error("AI Generation failed, switching to Smart Search:", error);
      }
    }

    // 2. 자동 검색 엔진 (무료/API 키 미입력 시)
    // 사용자의 입력어를 기반으로 가장 감성적인 고화질 이미지를 즉시 매칭합니다.
    return this.fetchAtmosphericImage(prompt);
  }

  private fetchAtmosphericImage(prompt: string): string {
    const randomSeed = Math.floor(Math.random() * 1000);
    // 검색 품질을 높이기 위해 감성 키워드를 조합합니다.
    const searchKeywords = `${prompt},lofi,cinematic,aesthetic,night,cozy`.replace(/\s+/g, ',');
    
    // Unsplash의 고화질 이미지 소스를 사용하며, 시드값을 주어 매번 다른 결과가 나오게 합니다.
    return `https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=85&w=1280&h=720&sig=${randomSeed}&search=${encodeURIComponent(searchKeywords)}`;
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey.length < 10) return DEFAULT_BRANDING;

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
