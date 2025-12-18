
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * AI를 통해 배경 이미지를 생성합니다. 
   * 실패 시 사용자 경험을 위해 고화질 감성 이미지 소스로 폴백합니다.
   */
  async generateBackground(userInput: string): Promise<string> {
    // Guideline: Create a new instance right before making an API call.
    // Guideline: Use process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Softwave 채널의 정체성을 담은 스타일 지시문
    const styleInstruction = "Cinematic 16:9 lofi background, soft dreamy lighting, cozy atmosphere, no text, plenty of negative space for typography. Aesthetic: ";
    const finalPrompt = styleInstruction + (userInput || "deep night sky with stars");

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      // Guideline: Iterate through all parts to find the image part.
      const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      
      if (imagePart?.inlineData?.data) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
      
      throw new Error("AI가 이미지 데이터를 생성하지 못했습니다.");
    } catch (error) {
      console.warn("AI 생성 실패, 감성 라이브러리로 전환합니다:", error);
      
      // API 호출이 불가능하거나 실패할 경우, 사용자가 입력한 키워드를 반영한 고화질 이미지 반환
      const randomSeed = Math.floor(Math.random() * 10000);
      const searchQuery = encodeURIComponent(userInput || "lofi,night,aesthetic");
      
      // 고퀄리티 감성 이미지 소스 (Unsplash 기반)
      return `https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=1280&h=720&sig=${randomSeed}&q=${searchQuery}`;
    }
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    try {
      // API 키가 유효하지 않으면 즉시 기본 데이터로 전환
      if (!process.env.API_KEY) return DEFAULT_BRANDING;

      // Guideline: Create a new instance right before making an API call.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

      // Guideline: Access .text property directly (it's a getter, not a method).
      const text = response.text?.trim() || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      console.error("AI 브랜딩 가이드 생성 실패:", e);
      return DEFAULT_BRANDING;
    }
  }
}
