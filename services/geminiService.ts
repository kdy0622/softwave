
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateBackground(userInput: string): Promise<string> {
    const ai = this.getClient();
    
    try {
      // 1. 프롬프트 고도화 (Flash 모델 사용으로 빠른 응답)
      const promptEnhancer = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a cinematic, text-less 16:9 lofi background image prompt for: "${userInput}". focus on soft aesthetics, dreamy lighting, and emotional atmosphere.`
      });

      let enhancedPrompt = (promptEnhancer.text || userInput)
        .replace(/```[a-z]*\n/gi, '')
        .replace(/```/g, '')
        .trim();

      // 2. 이미지 생성 (gemini-2.5-flash-image 모델 사용 - 일반 환경 최적화)
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: enhancedPrompt }] },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data");
    } catch (error) {
      console.error("AI 생성 실패, 로컬 캐시 또는 에러 반환:", error);
      throw error;
    }
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "음악 채널 'Softwave'를 위한 감성 브랜딩 가이드. 한국어로 JSON 형식 응답.",
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

      const text = response.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      // API 호출 실패 시 기본 내장 데이터 반환 (무료 체험 모드처럼 동작)
      return DEFAULT_BRANDING;
    }
  }
}
