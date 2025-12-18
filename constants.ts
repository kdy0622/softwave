
import { FilterConfig } from './types';

export const FILTERS: FilterConfig[] = [
  { name: '없음', css: '' },
  { name: '자정의 안개', css: 'contrast(1.1) brightness(0.8) saturate(0.6) blur(0.5px) hue-rotate(-10deg)' },
  { name: '빈티지 VHS', css: 'sepia(0.2) contrast(1.2) brightness(1.1) saturate(1.4) hue-rotate(-5deg)' },
  { name: '달빛 아래', css: 'brightness(0.7) saturate(0.4) contrast(1.1) drop-shadow(0 0 10px #4a5568)' },
  { name: '따스한 호박색', css: 'sepia(0.4) saturate(1.2) brightness(0.9) contrast(1.1)' },
];

export const ICONS = [
  { id: 'moon', emoji: '🌙', name: '달' },
  { id: 'star', emoji: '⭐', name: '별' },
  { id: 'cloud', emoji: '☁️', name: '구름' },
  { id: 'wave', emoji: '🌊', name: '파도' },
];

export const DEFAULT_PROMPT = "음악 채널 'Softwave'를 위한 영화 같은 16:9 유튜브 썸네일 배경. 테마는 '잠 못 드는 밤'과 '깊은 휴식'입니다. 새벽 3시, 큰 창문 너머로 비 내리는 도시나 별이 빛나는 밤하늘이 보이는 아늑하고 어두운 침실 풍경. 작은 침대 옆 스탠드에서 나오는 부드럽고 따뜻한 조명. 로파이(Lo-fi) 미학, 입자가 거친 필름 질감, 꿈결 같고 영롱한 분위기. 짙은 네이비, 차분한 보라색, 따뜻한 호박색의 컬러 팔레트를 사용하세요. 텍스트는 포함하지 말고, 중앙에 타이포그래피를 위한 충분한 여백을 두세요.";
