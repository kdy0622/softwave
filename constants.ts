
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

export const DEFAULT_PROMPT = "여기에 유튜브 영상 설명이나 키워드를 입력하세요. 예: '새벽 비오는 창가, 잔잔한 피아노 음악, 고독한 분위기'";
