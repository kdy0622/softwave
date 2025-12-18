
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
  { id: 'midnight', url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=1280&h=720', name: '심야' },
  { id: 'rainy', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=1280&h=720', name: '우천' },
  { id: 'cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1280&h=720', name: '카페' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1280&h=720', name: '파도' },
  { id: 'sunset', url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=1280&h=720', name: '노을' },
  { id: 'forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1280&h=720', name: '숲속' },
  { id: 'snow', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1280&h=720', name: '설원' },
  { id: 'city', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1280&h=720', name: '도시' },
  { id: 'library', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1280&h=720', name: '서재' },
  { id: 'window', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1280&h=720', name: '창가' },
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
    { id: "centered", name: "중앙 집중형", description: "제목을 중앙에 배치하여 몰입감을 줍니다" },
    { id: "bottom-left", name: "하단 여백형", description: "배경 이미지를 강조하고 정보를 아래에 둡니다" }
  ],
  copywriting: [
    "잠 못 드는 밤 당신을 위한 작은 선물",
    "조용히 흐르는 새벽의 멜로디",
    "지친 하루 끝에 만나는 따뜻한 위로",
    "오늘밤 깊은 꿈속으로 여행을 떠나요",
    "고요한 숲속의 빗소리 ASMR",
    "새벽 3시 나만 알고 싶은 음악들",
    "마음이 차분해지는 몽환적인 밤",
    "어지러운 생각을 잠재우는 선율",
    "창밖 빗소리와 어울리는 로파이",
    "내일이 두렵지 않은 편안한 휴식",
    "달빛 아래서 읽는 한 권의 시",
    "별이 쏟아지는 밤의 연주곡",
    "깊은 바다 속을 유영하는 기분",
    "오직 당신만을 위한 수면 가이드",
    "잊고 있던 감성을 깨우는 시간",
    "서늘한 공기 따뜻한 차 한 잔",
    "꿈의 가장자리에서 부르는 노래",
    "지친 영혼을 달래는 새벽 안개",
    "아무도 모르게 흘리는 위로의 눈물",
    "새벽이 지나가면 만날 수 있는 희망"
  ]
};

export const DEFAULT_PROMPT = "영상 테마를 입력하면 AI가 어울리는 배경을 그려줍니다";
