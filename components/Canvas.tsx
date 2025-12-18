
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

  const getFontBaseStyles = () => {
    switch(config.fontStyle) {
      case 'display': return { baseSize: 'text-[6vw] md:text-[64px]', weight: 'font-normal', extra: 'tracking-tighter leading-[1.1]' };
      case 'script': return { baseSize: 'text-[7vw] md:text-[80px]', weight: 'font-normal', extra: 'tracking-normal leading-normal' };
      case 'rounded': return { baseSize: 'text-[5vw] md:text-[52px]', weight: 'font-normal', extra: 'tracking-tight leading-snug' };
      case 'serif': return { baseSize: 'text-[5vw] md:text-[56px]', weight: 'font-bold', extra: 'tracking-tight leading-snug' };
      case 'sans': return { baseSize: 'text-[5vw] md:text-[52px]', weight: 'font-bold', extra: 'tracking-tighter leading-tight' };
      default: return { baseSize: 'text-[5vw] md:text-[52px]', weight: 'font-bold', extra: 'tracking-tight leading-tight' };
    }
  };

  const fontStyles = getFontBaseStyles();

  useLayoutEffect(() => {
    const adjustScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const horizontalPadding = containerWidth * 0.16; // 좌우 여백 8%씩
      const maxAllowedWidth = containerWidth - horizontalPadding;

      if (titleRef.current) {
        titleRef.current.style.transform = 'scale(1)';
        const naturalWidth = titleRef.current.scrollWidth;
        if (naturalWidth > maxAllowedWidth && naturalWidth > 0) {
          setTitleScale(Math.max(0.2, maxAllowedWidth / naturalWidth)); 
        } else {
          setTitleScale(1);
        }
      }

      if (subtitleRef.current) {
        subtitleRef.current.style.transform = 'scale(1)';
        const naturalWidth = subtitleRef.current.scrollWidth;
        const maxSubWidth = maxAllowedWidth * 0.8;
        if (naturalWidth > maxSubWidth && naturalWidth > 0) {
          setSubtitleScale(Math.max(0.3, maxSubWidth / naturalWidth));
        } else {
          setSubtitleScale(1);
        }
      }
    };

    const resizeObserver = new ResizeObserver(adjustScale);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    adjustScale();
    
    return () => resizeObserver.disconnect();
  }, [config.title, config.subtitle, config.fontStyle]);

  return (
    <div 
      ref={(node) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        (containerRef as any).current = node;
      }} 
      className="relative aspect-video w-full overflow-hidden bg-slate-950 select-none no-select shadow-inner"
      style={{ isolation: 'isolate' }}
    >
      {/* 배경 레이어: 딜레이 없는 즉시 렌더링을 위해 transition 조정 */}
      {config.backgroundImage ? (
        <img 
          src={config.backgroundImage} 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: filter?.css || '' }}
          crossOrigin="anonymous"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900"></div>
      )}

      {/* 가독성 레이어: 하단 그라데이션 강화 */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity"
        style={{ opacity: Math.max(0.4, config.overlayOpacity + 0.2) }}
      ></div>

      {/* 텍스트 컨텐츠: 반응형 패딩 적용 */}
      <div className="absolute inset-0 p-[8%] flex flex-col justify-end items-start z-20">
        {config.icon && (
          <div className="text-[10vw] md:text-5xl mb-4 md:mb-6 drop-shadow-2xl opacity-90">
            {config.icon}
          </div>
        )}
        
        <div className="w-full flex flex-col items-start">
          <h1 
            ref={titleRef}
            className={`${selectedFont?.class} ${fontStyles.baseSize} ${fontStyles.weight} ${fontStyles.extra} text-white whitespace-nowrap origin-left transition-transform duration-200`}
            style={{ 
              transform: `scale(${titleScale})`,
              width: 'max-content',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            {config.title}
          </h1>
          
          <div 
            ref={subtitleRef}
            className="mt-3 md:mt-5 flex items-center gap-3 md:gap-4 origin-left transition-transform duration-200"
            style={{ 
              transform: `scale(${subtitleScale})`,
              width: 'max-content'
            }}
          >
            <div className="w-6 md:w-10 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
            <p className="text-[3vw] md:text-[18px] font-light text-slate-300 tracking-[0.2em] md:tracking-[0.4em] uppercase whitespace-nowrap opacity-80">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 브랜딩 워터마크: 레이아웃 고정 */}
      <div className="absolute top-[8%] right-[8%] flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <span className="text-[1.5vw] md:text-[9px] tracking-[0.3em] font-bold text-white uppercase opacity-70">SOFTWAVE STUDIO</span>
      </div>
      
      {/* 텍스처 노이즈 레이어: 감성 필터 */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
