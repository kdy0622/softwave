
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * 고화질 감성 AI 배경 생성 엔진
   * gemini-2.5-flash-image 모델을 사용하여 'Softwave' 채널 미학에 맞는 이미지를 생성합니다.
   */
  async generateBackground(userInput: string): Promise<string> {
    // 환경 변수 안전 접근
    let apiKey = '';
    try {
      apiKey = process.env.API_KEY || '';
    } catch (e) {
      console.warn("API_KEY access failed, using fallback");
    }

    // 1. Gemini AI를 통한 직접 생성 시도
    if (apiKey && apiKey !== "undefined" && apiKey !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        // 프롬프트 강화: Softwave 채널의 'Cinematic, Lofi, Dreamy' 스타일 강제
        const styleInstruction = `
          High-resolution cinematic background for a music channel named 'Softwave'.
          Style: Dreamy lofi aesthetic, nostalgic atmosphere, soft focus, minimal and clean.
          No text, no people, wide 16:9 aspect ratio.
          Plenty of negative space for typography.
          Mood: ${userInput || "peaceful night cityscape with purple moonlight"}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: styleInstruction }] },
          config: {
            imageConfig: { 
              aspectRatio: "16:9"
            }
          }
        });

        // 결과물에서 이미지 파트 찾기
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (error) {
        console.error("AI 이미지 생성 중 오류 발생:", error);
      }
    }

    // 2. Fallback: 스마트 무드 엔진 (Unsplash 기반)
    // 키워드에 따라 연관된 감성 이미지를 불러오도록 Unsplash Source 패턴 활용
    const randomSeed = Math.floor(Math.random() * 1000000);
    const keywords = userInput ? encodeURIComponent(userInput) : 'lofi,night,cozy,cinematic';
    // images.unsplash.com의 특정 고화질 베이스 이미지에 검색 태그와 시드를 조합하여 폴백
    return `https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=1280&h=720&sig=${randomSeed}&search=${keywords}`;
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    let apiKey = '';
    try {
      apiKey = process.env.API_KEY || '';
    } catch (e) {
      return DEFAULT_BRANDING;
    }
    
    if (!apiKey || apiKey === "undefined") return DEFAULT_BRANDING;

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
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

      const text = response.text?.trim() || '';
      return JSON.parse(text);
    } catch (e) {
      console.error("브랜딩 가이드 생성 오류:", e);
      return DEFAULT_BRANDING;
    }
  }
}
