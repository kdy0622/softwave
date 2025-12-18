
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
      case 'display': return { baseSize: 'text-[6.5vw] md:text-[68px]', weight: 'font-normal', extra: 'tracking-tighter leading-[1.05]' };
      case 'script': return { baseSize: 'text-[8.5vw] md:text-[92px]', weight: 'font-normal', extra: 'tracking-normal leading-normal' };
      case 'rounded': return { baseSize: 'text-[5.5vw] md:text-[56px]', weight: 'font-normal', extra: 'tracking-tight leading-snug' };
      case 'serif': return { baseSize: 'text-[5.5vw] md:text-[60px]', weight: 'font-bold', extra: 'tracking-tight leading-snug' };
      case 'sans': return { baseSize: 'text-[5.5vw] md:text-[56px]', weight: 'font-bold', extra: 'tracking-tighter leading-tight' };
      default: return { baseSize: 'text-[5.5vw] md:text-[56px]', weight: 'font-bold', extra: 'tracking-tight leading-tight' };
    }
  };

  const fontStyles = getFontBaseStyles();

  useLayoutEffect(() => {
    const adjustScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const effectiveWidth = containerWidth > 0 && containerWidth < 1200 ? containerWidth : 1280;
      
      const horizontalPadding = effectiveWidth * 0.16; 
      const maxAllowedWidth = effectiveWidth - horizontalPadding;

      if (titleRef.current) {
        titleRef.current.style.transform = 'scale(1)';
        const naturalWidth = titleRef.current.scrollWidth;
        if (naturalWidth > maxAllowedWidth && naturalWidth > 0) {
          setTitleScale(Math.max(0.1, maxAllowedWidth / naturalWidth)); 
        } else {
          setTitleScale(1);
        }
      }

      if (subtitleRef.current) {
        subtitleRef.current.style.transform = 'scale(1)';
        const naturalWidth = subtitleRef.current.scrollWidth;
        const maxSubWidth = maxAllowedWidth * 0.85;
        if (naturalWidth > maxSubWidth && naturalWidth > 0) {
          setSubtitleScale(Math.max(0.2, maxSubWidth / naturalWidth));
        } else {
          setSubtitleScale(1);
        }
      }
    };

    const resizeObserver = new ResizeObserver(adjustScale);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    adjustScale();
    const timer = setTimeout(adjustScale, 300);
    
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
      className="relative aspect-video w-full overflow-hidden bg-slate-950 select-none shadow-2xl"
      style={{ isolation: 'isolate', width: '100%', minHeight: '100px', display: 'block' }}
    >
      <div className="absolute inset-0 z-0">
        {config.backgroundImage ? (
          <img 
            src={config.backgroundImage} 
            className="w-full h-full object-cover block transition-opacity duration-500"
            style={{ filter: filter?.css || '' }}
            crossOrigin="anonymous"
            loading="eager"
            alt=""
          />
        ) : (
          <div className="w-full h-full bg-slate-900"></div>
        )}
      </div>

      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity z-10"
        style={{ opacity: Math.max(0.3, config.overlayOpacity + 0.15) }}
      ></div>

      <div className="absolute inset-0 p-[8%] flex flex-col justify-end items-start z-20">
        {config.icon && (
          <div className="text-[11vw] md:text-6xl mb-6 md:mb-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] opacity-95">
            {config.icon}
          </div>
        )}
        
        <div className="w-full flex flex-col items-start gap-1">
          <h1 
            ref={titleRef}
            className={`${selectedFont?.class} ${fontStyles.baseSize} ${fontStyles.weight} ${fontStyles.extra} text-white whitespace-nowrap origin-left transition-transform duration-300`}
            style={{ 
              transform: `scale(${titleScale})`,
              width: 'max-content',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}
          >
            {config.title}
          </h1>
          
          <div 
            ref={subtitleRef}
            className="mt-4 md:mt-6 flex items-center gap-4 md:gap-5 origin-left transition-transform duration-300"
            style={{ 
              transform: `scale(${subtitleScale})`,
              width: 'max-content'
            }}
          >
            <div className="w-8 md:w-12 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
            <p className="text-[3vw] md:text-[18px] font-light text-slate-300 tracking-[0.2em] md:tracking-[0.4em] uppercase whitespace-nowrap opacity-80 drop-shadow-xl">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 브랜딩 워터마크 - 크기를 아주 작게(Very Small) 조정 */}
      <div className="absolute top-[5%] right-[5%] flex items-center bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5 z-30 scale-50 md:scale-[0.65] origin-right">
        <span className="text-[1vw] md:text-[10px] tracking-[0.4em] font-black text-white uppercase opacity-40 whitespace-nowrap">SOFTWAVE STUDIO</span>
      </div>
      
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-40"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
