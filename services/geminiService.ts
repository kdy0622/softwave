
import { GoogleGenAI, Type } from "@google/genai";
import { BrandingGuide } from "../types.ts";
import { DEFAULT_BRANDING } from "../constants.ts";

export class GeminiService {
  /**
   * 고화질 저작권 무료 배경 생성 (AI + Smart Match Engine)
   */
  async generateBackground(userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;
    const cleanPrompt = (userInput || "").trim().toLowerCase();

    // 1. Gemini AI 시도 (API 키가 유효한 경우)
    if (apiKey && apiKey !== "undefined" && apiKey.length > 15) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `High resolution cinematic 16:9 lofi background: ${cleanPrompt}` }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      } catch (e) {
        console.warn("AI Generation fallback to Smart Engine...");
      }
    }

    // 2. 스마트 매칭 엔진 (API 키 미입력 시 100% 작동)
    // Softwave 감성에 최적화된 고화질 저작권 프리 이미지 풀
    const moodPool: Record<string, string[]> = {
      rain: ["1515694346937-94d85e41e6f0", "1534274988757-a28bf1f539cf", "1428592953211-077101b2021b", "1519692933481-e162a57d6721"],
      night: ["1516339901601-2e1b62dc0c45", "1477959858617-67f85cf4f1df", "1506744038136-46273834b3fb", "1483706600675-2b47a8b47e9e"],
      ocean: ["1507525428034-b723cf961d3e", "1505118380757-91f5f45d2927", "1473116763249-2faaef81ccda", "1500375592092-40eb2168fd21"],
      cafe: ["1554118811-1e0d58224f24", "1495474472287-4d71bcdd2085", "1509042239860-f550ce710b93", "1445116572660-236099ec97a0"],
      sunset: ["1470252649378-9c29740c9fa8", "1490750967868-888a51510b80", "1475924156734-496f6cac6ec1", "1501418619847-2425816fed16"],
      city: ["1477322524744-039f34d792ec", "1514565132033-8a9ba4675a3e", "1444723121867-7a241cacace9", "1519500534145-25272a744ef0"],
      general: [
        "1516339901601-2e1b62dc0c45", "1515694346937-94d85e41e6f0", "1554118811-1e0d58224f24",
        "1507525428034-b723cf961d3e", "1470252649378-9c29740c9fa8", "1441974231531-c6227db76b6e"
      ]
    };

    let selectedPool = moodPool.general;
    if (cleanPrompt.includes("비") || cleanPrompt.includes("rain")) selectedPool = moodPool.rain;
    else if (cleanPrompt.includes("밤") || cleanPrompt.includes("night")) selectedPool = moodPool.night;
    else if (cleanPrompt.includes("바다") || cleanPrompt.includes("ocean")) selectedPool = moodPool.ocean;
    else if (cleanPrompt.includes("카페") || cleanPrompt.includes("cafe")) selectedPool = moodPool.cafe;
    else if (cleanPrompt.includes("노을") || cleanPrompt.includes("sunset")) selectedPool = moodPool.sunset;
    else if (cleanPrompt.includes("도시") || cleanPrompt.includes("city")) selectedPool = moodPool.city;

    const randomId = selectedPool[Math.floor(Math.random() * selectedPool.length)];
    // sig 값을 주어 매번 새로운 랜덤 이미지가 로드되도록 함 (Unsplash/Pixabay 수준의 고화질)
    return `https://images.unsplash.com/photo-${randomId}?auto=format&fit=crop&q=85&w=1280&h=720&sig=${Math.random()}`;
  }

  async fetchBrandingGuide(): Promise<BrandingGuide> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 15) return DEFAULT_BRANDING;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "음악 채널 'Softwave'를 위한 감성 브랜딩 가이드. JSON 형식 응답.",
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
