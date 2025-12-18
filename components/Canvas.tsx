
import React, { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { ThumbnailConfig, FilterConfig } from '../types.ts';
import { FONT_OPTIONS } from '../constants.ts';

interface CanvasProps {
  config: ThumbnailConfig;
  filter?: FilterConfig;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({ config, filter }, ref) => {
  const selectedFont = FONT_OPTIONS.find(f => f.id === config.fontStyle);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const [titleScale, setTitleScale] = useState(1);
  const [subtitleScale, setSubtitleScale] = useState(1);

  // 폰트별 기본 스타일 정의 (가시성 및 일관성 확보)
  const getFontBaseStyles = () => {
    switch(config.fontStyle) {
      case 'display': return { baseSize: 'text-7xl', weight: 'font-normal', extra: 'tracking-tighter leading-tight uppercase' };
      case 'script': return { baseSize: 'text-8xl', weight: 'font-normal', extra: 'tracking-normal leading-normal' };
      case 'rounded': return { baseSize: 'text-6xl', weight: 'font-normal', extra: 'tracking-tight leading-snug' };
      case 'serif': return { baseSize: 'text-6xl', weight: 'font-bold', extra: 'tracking-tight leading-snug' };
      case 'sans': return { baseSize: 'text-6xl', weight: 'font-bold', extra: 'tracking-tighter leading-tight' };
      default: return { baseSize: 'text-6xl', weight: 'font-bold', extra: 'tracking-tight leading-tight' };
    }
  };

  const fontStyles = getFontBaseStyles();

  // 텍스트 크기 자동 조정 로직 (이미지 경계를 절대 넘지 않도록 설계)
  useLayoutEffect(() => {
    const adjustScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      // 좌우 안전 여백을 넉넉히 주어 모서리가 잘리는 현상 방지
      const horizontalPadding = containerWidth * 0.15; 
      const maxAllowedWidth = containerWidth - horizontalPadding;

      // 1. 메인 타이틀 스케일 계산
      if (titleRef.current) {
        // 측정을 위해 현재 적용된 스케일을 무시하고 실제 너비 측정
        titleRef.current.style.transform = 'scale(1)';
        const naturalWidth = titleRef.current.scrollWidth;
        
        if (naturalWidth > maxAllowedWidth && naturalWidth > 0) {
          const newScale = maxAllowedWidth / naturalWidth;
          // 최소 스케일을 0.2로 설정하여 텍스트가 너무 작아져도 보임은 유지
          setTitleScale(Math.max(0.2, newScale)); 
        } else {
          setTitleScale(1);
        }
      }

      // 2. 서브 타이틀 스케일 계산
      if (subtitleRef.current) {
        subtitleRef.current.style.transform = 'scale(1)';
        const naturalWidth = subtitleRef.current.scrollWidth;
        // 서브타이틀은 메인보다 약간 더 좁은 여백을 가짐
        const maxSubWidth = maxAllowedWidth * 0.9;

        if (naturalWidth > maxSubWidth && naturalWidth > 0) {
          const newScale = maxSubWidth / naturalWidth;
          setSubtitleScale(Math.max(0.3, newScale));
        } else {
          setSubtitleScale(1);
        }
      }
    };

    // 폰트가 완전히 로드된 후에 측정이 정확함
    if ('fonts' in document) {
      (document as any).fonts.ready.then(() => {
        // 폰트 변경 후 돔 반영 시간을 위한 미세 지연
        setTimeout(adjustScale, 30);
      });
    }
    
    // 즉시 실행
    adjustScale();
    
    // 윈도우 리사이즈 및 레이아웃 변화 감지
    const observer = new ResizeObserver(adjustScale);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [config.title, config.subtitle, config.fontStyle]);

  return (
    <div 
      ref={(node) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        (containerRef as any).current = node;
      }} 
      className="relative aspect-video w-full overflow-hidden bg-slate-950 select-none shadow-2xl"
      style={{ isolation: 'isolate' }}
    >
      {/* 배경 이미지 레이어 */}
      {config.backgroundImage ? (
        <img 
          src={config.backgroundImage} 
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: filter?.css || '' }}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900"></div>
      )}

      {/* 가독성 향상 오버레이 (하단 텍스트 가독성 확보) */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"
        style={{ opacity: Math.min(1, config.overlayOpacity + 0.4) }}
      ></div>

      {/* 메인 텍스트 레이아웃 */}
      <div className="absolute inset-0 p-12 md:p-16 flex flex-col justify-end items-start z-20">
        {config.icon && (
          <div className="text-5xl mb-6 drop-shadow-2xl animate-pulse">
            {config.icon}
          </div>
        )}
        
        <div className="w-full">
          {/* 타이틀: 폰트 적용 안정성을 위해 font-family를 인라인으로 한 번 더 확인 */}
          <h1 
            ref={titleRef}
            className={`${selectedFont?.class} ${fontStyles.baseSize} ${fontStyles.weight} ${fontStyles.extra} text-white whitespace-nowrap origin-left transition-transform duration-200 ease-out`}
            style={{ 
              transform: `scale(${titleScale})`,
              width: 'max-content',
              textShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.5)',
              fontFamily: 'inherit' 
            }}
          >
            {config.title}
          </h1>
          
          {/* 서브 타이틀 */}
          <div 
            ref={subtitleRef}
            className="mt-6 flex items-center gap-4 origin-left transition-transform duration-200 ease-out"
            style={{ 
              transform: `scale(${subtitleScale})`,
              width: 'max-content'
            }}
          >
            <div className="w-10 h-0.5 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)]"></div>
            <p className="text-xl font-light text-slate-100/95 tracking-[0.5em] uppercase whitespace-nowrap"
               style={{ textShadow: '0 4px 15px rgba(0,0,0,1)' }}>
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 브랜딩 워터마크 */}
      <div className="absolute top-10 right-10 flex items-center gap-3 bg-black/70 backdrop-blur-lg px-6 py-3 rounded-full border border-white/10 shadow-2xl">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
        <span className="text-[11px] tracking-[0.5em] font-black text-white uppercase opacity-90">SOFTWAVE</span>
      </div>
      
      {/* 고전적인 필름 그레인 효과 */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
