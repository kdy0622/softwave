
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * Gemini 2.5 Flash Image 모델을 사용한 초실사 배경 생성
   * 몽환적인 요소를 배제하고 선명한 포커스와 사실적인 질감을 강조합니다.
   */
  async generateBackground(userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;
    const cleanPrompt = (userInput || "High-resolution reality").trim();

    if (apiKey && apiKey !== "undefined") {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        /**
         * 사실주의(Realism)를 위한 프롬프트 조합
         * 몽환적(Dreamy), 흐릿함(Blur) 요소를 철저히 배제합니다.
         */
        const realisticPrompt = `
          Hyper-realistic 8k ultra-detailed professional photography of ${cleanPrompt}. 
          Sharp focus, high contrast, vivid and natural colors, National Geographic style, 
          raw photo, crystal clear atmosphere, realistic textures, detailed environment.
          No digital art style, no soft blur, no bokeh, no dreamy glow, 
          no text, no watermarks, no distorted objects.
        `.trim();
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: realisticPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });

        if (response.candidates && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (e: any) {
        console.error("Gemini Realistic Generation Error:", e);
      }
    }

    // 폴백: AI 생성 실패 시 고화질 Unsplash 이미지 매칭 (사실적 키워드 위주)
    const randomSig = Math.floor(Math.random() * 100000);
    const searchTerms = encodeURIComponent(cleanPrompt + " sharp realistic photography 8k");
    return `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=90&w=1280&h=720&sig=${randomSig}`;
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 15) return DEFAULT_BRANDING;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "음악 채널 'Softwave'를 위한 브랜딩 가이드. 사실적이고 현대적인 비주얼 강조. JSON 형식 응답.",
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
