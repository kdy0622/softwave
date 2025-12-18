
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

  /**
   * 텍스트 자동 크기 조정 로직
   * 캡처 시 요소의 크기가 1280px로 변경되더라도 레이아웃을 유지하기 위해
   * containerWidth를 1280px로 가정한 고정 비율 캡처를 지원하도록 보정합니다.
   */
  useLayoutEffect(() => {
    const adjustScale = () => {
      if (!containerRef.current) return;

      // 현재 화면에서의 너비 (반응형)
      const currentWidth = containerRef.current.offsetWidth;
      // 캡처 시 기준이 되는 고정 너비 (유튜브 썸네일 표준)
      const targetWidth = 1280;
      
      // 캡처 중인지 확인 (html-to-image는 요소 크기를 강제로 변경함)
      // 기준 너비는 캡처 시점에 targetWidth가 되고, 브라우저 표시 시점에 currentWidth가 됨
      const containerWidth = (currentWidth > 0 && currentWidth < 1200) ? currentWidth : targetWidth;
      
      const horizontalPadding = containerWidth * 0.16; 
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
    
    // 텍스트 변경 시 즉각 반영
    const timer = setTimeout(adjustScale, 50);
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [config.title, config.subtitle, config.fontStyle]);

  return (
    <div 
      ref={(node) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        (containerRef as any).current = node;
      }} 
      className="relative aspect-video w-full overflow-hidden bg-slate-950 select-none no-select shadow-inner"
      style={{ isolation: 'isolate', width: '100%', minHeight: '100px' }}
    >
      {/* 1. 배경 이미지 레이어 */}
      <div className="absolute inset-0 z-0">
        {config.backgroundImage ? (
          <img 
            src={config.backgroundImage} 
            className="w-full h-full object-cover block"
            style={{ filter: filter?.css || '' }}
            crossOrigin="anonymous"
            loading="eager"
            alt=""
          />
        ) : (
          <div className="w-full h-full bg-slate-900"></div>
        )}
      </div>

      {/* 2. 오버레이 레이어 */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity z-10"
        style={{ opacity: Math.max(0.3, config.overlayOpacity + 0.1) }}
      ></div>

      {/* 3. 텍스트 컨텐츠 레이어 */}
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
              textShadow: '0 4px 16px rgba(0,0,0,0.6)'
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
            <div className="w-6 md:w-10 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.7)]"></div>
            <p className="text-[3vw] md:text-[18px] font-light text-slate-300 tracking-[0.2em] md:tracking-[0.4em] uppercase whitespace-nowrap opacity-80">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 4. 브랜딩 워터마크 레이어 */}
      <div className="absolute top-[8%] right-[8%] flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-30">
        <span className="text-[1.5vw] md:text-[9px] tracking-[0.3em] font-bold text-white uppercase opacity-70">SOFTWAVE STUDIO</span>
      </div>
      
      {/* 5. 텍스처 오버레이 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-40"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
