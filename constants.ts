
import { FilterConfig, FontStyle } from './types.ts';

export const FILTERS: FilterConfig[] = [
  { name: '없음', css: '' },
  { name: '자정의 안개', css: 'contrast(1.1) brightness(0.7) saturate(0.5) blur(0.3px)' },
  { name: '빈티지 VHS', css: 'sepia(0.2) contrast(1.2) brightness(1.1) saturate(1.4) hue-rotate(-5deg)' },
  { name: '달빛 아래', css: 'brightness(0.6) saturate(0.3) contrast(1.2) drop-shadow(0 0 15px #1e293b)' },
  { name: '따스한 호박색', css: 'sepia(0.5) saturate(1.3) brightness(0.9) contrast(1.1)' },
  { name: '새벽 공기', css: 'hue-rotate(180deg) brightness(0.8) saturate(0.7)' },
];

export const FONT_OPTIONS: { id: FontStyle; name: string; class: string }[] = [
  { id: 'serif', name: '감성 명조', class: 'font-serif-kr' },
  { id: 'sans', name: '깔끔 고딕', class: 'font-sans-kr' },
  { id: 'display', name: '강렬 블랙', class: 'font-display-kr' },
  { id: 'rounded', name: '부드러운체', class: 'font-rounded-kr' },
  { id: 'script', name: '손글씨체', class: 'font-script-kr' },
];

export const ICONS = [
  { id: 'moon', emoji: '🌙', name: '달' },
  { id: 'star', emoji: '⭐', name: '별' },
  { id: 'cloud', emoji: '☁️', name: '구름' },
  { id: 'wave', emoji: '🌊', name: '파도' },
  { id: 'heart', emoji: '💜', name: '하트' },
  { id: 'music', emoji: '🎵', name: '음악' },
];

export const PRESET_BACKGROUNDS = [
  { id: 'midnight', url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=1280&h=720', name: '심야의 별빛' },
  { id: 'rainy', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=1280&h=720', name: '창밖의 빗줄기' },
  { id: 'cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1280&h=720', name: '조용한 카페' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1280&h=720', name: '잔잔한 파도' },
  { id: 'sunset', url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=1280&h=720', name: '노을진 들판' },
];

export const DEFAULT_BRANDING = {
  keywords: ["고요함", "안식", "새벽", "꿈", "파도"],
  colors: [
    { hex: "#0f172a", name: "심해 네이비" },
    { hex: "#1e293b", name: "새벽 그림자" },
    { hex: "#475569", name: "차분한 안개" },
    { hex: "#6366f1", name: "꿈결 보라" }
  ],
  layouts: [
    { id: "centered", name: "중앙 집중형", description: "제목을 중앙에 배치하여 몰입감을 줍니다." },
    { id: "bottom-left", name: "하단 여백형", description: "배경 이미지를 강조하고 정보를 아래에 둡니다." }
  ],
  copywriting: [
    "잠 못 드는 밤, 당신을 위한 작은 선물",
    "조용히 흐르는 새벽의 멜로디",
    "지친 하루 끝에 만나는 따뜻한 위로",
    "오늘밤, 깊은 꿈속으로 여행을 떠나요",
    "고요한 숲속의 빗소리 ASMR"
  ]
};

export const DEFAULT_PROMPT = "영상 테마를 입력하면 AI가 어울리는 배경을 그려줍니다.";
