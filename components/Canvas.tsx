
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
  const [titleScale, setTitleScale] = useState(1);

  // 폰트별 기본 스타일 및 사이즈 정의
  const getFontBaseStyles = () => {
    switch(config.fontStyle) {
      case 'display': return { baseSize: 'text-7xl', extra: 'tracking-tighter leading-[0.95] uppercase' };
      case 'script': return { baseSize: 'text-8xl', extra: 'tracking-normal leading-tight' };
      case 'rounded': return { baseSize: 'text-6xl', extra: 'tracking-tight leading-tight' };
      case 'serif': return { baseSize: 'text-6xl', extra: 'tracking-tight leading-snug' };
      default: return { baseSize: 'text-6xl', extra: 'tracking-tighter leading-tight' };
    }
  };

  const fontStyles = getFontBaseStyles();

  // 텍스트가 줄바꿈 없이 영역에 꽉 차도록 스케일 계산
  useLayoutEffect(() => {
    if (titleRef.current && containerRef.current) {
      const containerPadding = 128; // p-16 = 64px * 2
      const containerWidth = containerRef.current.offsetWidth - containerPadding;
      const textWidth = titleRef.current.scrollWidth;
      
      if (textWidth > containerWidth && textWidth > 0) {
        setTitleScale(containerWidth / textWidth);
      } else {
        setTitleScale(1);
      }
    }
  }, [config.title, config.fontStyle]);

  return (
    <div 
      ref={(node) => {
        // 컴포넌트 외부 ref와 내부 containerRef를 모두 연결
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        (containerRef as any).current = node;
      }} 
      className="relative aspect-video w-full overflow-hidden bg-slate-950 select-none shadow-inner"
    >
      {/* 배경 이미지 */}
      {config.backgroundImage ? (
        <img 
          src={config.backgroundImage} 
          alt="Thumbnail Atmosphere"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
          style={{ filter: filter?.css || '' }}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 animate-pulse"></div>
      )}

      {/* 오버레이 효과 */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none transition-opacity duration-500"
        style={{ opacity: config.overlayOpacity + 0.3 }}
      ></div>
      <div 
        className="absolute inset-0 bg-black/30 pointer-events-none"
        style={{ opacity: config.overlayOpacity }}
      ></div>

      {/* 메인 콘텐츠 영역 */}
      <div className="absolute inset-0 p-16 flex flex-col justify-end items-start z-10">
        {config.icon && (
          <div className="text-5xl mb-6 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)] animate-bounce duration-[3000ms]">
            {config.icon}
          </div>
        )}
        
        <div className="max-w-full overflow-visible">
          <h1 
            ref={titleRef}
            className={`${selectedFont?.class || 'font-serif-kr'} ${fontStyles.baseSize} ${fontStyles.extra} text-white drop-shadow-[0_10px_30px_rgba(0,0,0,1)] transition-all duration-500 whitespace-nowrap origin-left`}
            style={{ 
              transform: `scale(${titleScale})`,
              width: 'max-content'
            }}
          >
            {config.title}
          </h1>
          
          <div 
            className="mt-6 flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-1000 origin-left"
            style={{ transform: `scale(${Math.min(1, titleScale * 1.1)})` }}
          >
            <div className="w-12 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
            <p className="text-xl font-light text-slate-200/90 tracking-[0.3em] uppercase drop-shadow-md whitespace-nowrap">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 브랜드 워터마크 */}
      <div className="absolute top-10 right-10 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
        <span className="text-[10px] tracking-[0.4em] font-bold text-white/70 uppercase">Softwave Studio</span>
      </div>
      
      {/* 텍스처 오버레이 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
