
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
      case 'display': return { baseSize: 'text-[7.5vw] md:text-[76px]', weight: 'font-normal', extra: 'tracking-tighter leading-tight' };
      case 'script': return { baseSize: 'text-[9.5vw] md:text-[100px]', weight: 'font-normal', extra: 'tracking-normal' };
      case 'rounded': return { baseSize: 'text-[6.5vw] md:text-[64px]', weight: 'font-normal', extra: 'tracking-tight' };
      case 'serif': return { baseSize: 'text-[6.5vw] md:text-[68px]', weight: 'font-bold', extra: 'tracking-tight' };
      case 'sans': return { baseSize: 'text-[6.5vw] md:text-[64px]', weight: 'font-bold', extra: 'tracking-tighter' };
      default: return { baseSize: 'text-[6.5vw] md:text-[64px]', weight: 'font-bold', extra: 'tracking-tight' };
    }
  };

  const fontStyles = getFontBaseStyles();

  useLayoutEffect(() => {
    const adjustScale = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      // 캔버스의 실제 가로 크기 기준 (16:9 비율 유지)
      const effectiveWidth = containerWidth > 0 ? containerWidth : 1280;
      
      // 텍스트가 차지할 수 있는 최대 가로 폭 (좌우 여백 8%씩 제외한 약 84%)
      const horizontalPadding = effectiveWidth * 0.16;
      const maxAllowedWidth = effectiveWidth - horizontalPadding;

      // 타이틀 크기 조정
      if (titleRef.current) {
        // 측정을 위해 일시적으로 스케일 초기화 및 너비 제한 해제
        titleRef.current.style.transform = 'scale(1)';
        titleRef.current.style.width = 'max-content';
        
        const naturalWidth = titleRef.current.getBoundingClientRect().width;
        
        if (naturalWidth > maxAllowedWidth && naturalWidth > 0) {
          const newScale = maxAllowedWidth / naturalWidth;
          setTitleScale(Math.min(1, Math.max(0.1, newScale))); 
        } else {
          setTitleScale(1);
        }
      }

      // 부제목 크기 조정
      if (subtitleRef.current) {
        subtitleRef.current.style.transform = 'scale(1)';
        subtitleRef.current.style.width = 'max-content';
        
        const naturalWidth = subtitleRef.current.getBoundingClientRect().width;
        // 부제목은 타이틀보다 조금 더 여유 있게(약 90%) 조정
        const maxSubWidth = maxAllowedWidth * 0.95;
        
        if (naturalWidth > maxSubWidth && naturalWidth > 0) {
          const newScale = maxSubWidth / naturalWidth;
          setSubtitleScale(Math.min(1, Math.max(0.2, newScale)));
        } else {
          setSubtitleScale(1);
        }
      }
    };

    // 폰트 로딩 대기 및 리사이즈 감지
    const resizeObserver = new ResizeObserver(adjustScale);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    // 즉시 실행 및 지연 실행 (폰트 적용 보장)
    adjustScale();
    const timer = setTimeout(adjustScale, 150);
    const longTimer = setTimeout(adjustScale, 1000); // 폰트가 늦게 뜰 경우 대비
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
      clearTimeout(longTimer);
    };
  }, [config.title, config.subtitle, config.fontStyle, config.backgroundImage]);

  return (
    <div 
      ref={(node) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        (containerRef as any).current = node;
      }} 
      className="relative aspect-video w-full overflow-hidden bg-slate-950 select-none shadow-2xl"
      style={{ isolation: 'isolate', width: '100%', minHeight: '100px', display: 'block' }}
    >
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

      {/* 조도(Illumination) 레이어 */}
      <div 
        className="absolute inset-0 bg-black transition-opacity z-10"
        style={{ opacity: config.overlayOpacity }}
      ></div>
      
      {/* 가독성 보강 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[11]"></div>

      <div className="absolute inset-0 p-[8%] flex flex-col justify-end items-start z-20 overflow-hidden">
        {config.icon && (
          <div className="text-[6vw] md:text-7xl mb-3 md:mb-10 drop-shadow-[0_0_25px_rgba(0,0,0,1)] filter brightness-125 shrink-0">
            {config.icon}
          </div>
        )}
        
        <div className="w-full flex flex-col items-start gap-1 overflow-visible">
          <h1 
            ref={titleRef}
            className={`${selectedFont?.class} ${fontStyles.baseSize} ${fontStyles.weight} ${fontStyles.extra} text-white whitespace-nowrap origin-left will-change-transform`}
            style={{ 
              transform: `scale(${titleScale})`,
              width: 'max-content',
              textShadow: '0 0 10px rgba(255,255,255,0.2), 0px 4px 15px rgba(0,0,0,1), 0px 8px 30px rgba(0,0,0,1)'
            }}
          >
            {config.title}
          </h1>
          
          <div 
            ref={subtitleRef}
            className="mt-4 md:mt-10 flex items-center gap-4 md:gap-6 origin-left will-change-transform"
            style={{ 
              transform: `scale(${subtitleScale})`,
              width: 'max-content'
            }}
          >
            <div className="w-6 md:w-16 h-0.5 md:h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] shrink-0"></div>
            <p 
              className="text-[3vw] md:text-[22px] font-black text-white tracking-[0.3em] md:tracking-[0.4em] uppercase whitespace-nowrap"
              style={{ textShadow: '0px 2px 10px rgba(0,0,0,1), 0px 4px 15px rgba(0,0,0,1)' }}
            >
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 브랜딩 워터마크 */}
      <div className="absolute top-[6%] right-[6%] flex items-center bg-black/70 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10 z-30 scale-50 md:scale-[0.8] origin-right">
        <span className="text-[10px] md:text-[11px] tracking-[0.4em] font-black text-white uppercase opacity-90 whitespace-nowrap">SOFTWAVE STUDIO PRO</span>
      </div>
      
      {/* 텍스처 오버레이 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-40"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
