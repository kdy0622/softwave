
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateBackground(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("이미지 생성에 실패했습니다.");
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "잠 못 드는 밤과 휴식을 테마로 한 음악 채널 'Softwave'를 위한 브랜딩 가이드를 생성해줘. 모든 텍스트는 반드시 한국어로 작성해야 해.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "브랜드를 상징하는 시각적 키워드 5개."
            },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  name: { type: Type.STRING }
                },
                required: ["hex", "name"]
              }
            },
            layouts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "name", "description"]
              }
            },
            copywriting: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "썸네일용 감성적인 제목 10개."
            }
          },
          required: ["keywords", "colors", "layouts", "copywriting"]
        }
      }
    });

    if (!response.text) throw new Error("응답이 비어있습니다.");
    return JSON.parse(response.text.trim());
  }
}
