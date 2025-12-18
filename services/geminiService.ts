
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateBackground(userInput: string): Promise<string> {
    // 사용자의 짧은 단어나 상세 설명을 고퀄리티 이미지 프롬프트로 변환
    const promptEnhancer = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `다음은 사용자가 입력한 유튜브 영상 테마 또는 설명입니다: "${userInput}". 
      이를 바탕으로 'Softwave' 채널(새벽, 휴식, 로파이 감성)에 어울리는 영화 같은 16:9 썸네일 배경 이미지를 생성하기 위한 아주 상세한 영어 프롬프트를 작성해주세요. 
      결과는 오직 프롬프트 텍스트만 출력하세요. 텍스트 포함 금지, 여백 강조.`
    });

    const enhancedPrompt = promptEnhancer.text || userInput;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: enhancedPrompt }] },
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
      contents: "잠 못 드는 밤과 휴식을 테마로 한 음악 채널 'Softwave'를 위한 브랜딩 가이드를 생성해줘. 특히 썸네일에 바로 쓸 수 있는 감성적이고 클릭을 부르는 제목을 20개 이상 제안해줘. 모든 텍스트는 한국어로 작성해.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "시각적 키워드 5개."
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
              description: "추천 제목 20개."
            }
          },
          required: ["keywords", "colors", "layouts", "copywriting"]
        }
      }
    });

    if (!response.text) throw new Error("응답이 비어있습니다.");
    const text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanJson);
  }
}
