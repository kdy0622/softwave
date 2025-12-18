
import React from 'react';
import { ThumbnailConfig, FilterConfig } from '../types';

interface CanvasProps {
  config: ThumbnailConfig;
  filter?: FilterConfig;
}

const Canvas: React.FC<CanvasProps> = ({ config, filter }) => {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black select-none">
      {/* Background Image */}
      {config.backgroundImage && (
        <img 
          src={config.backgroundImage} 
          alt="Thumbnail Background"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          style={{ filter: filter?.css || '' }}
        />
      )}

      {/* Overlay/Vignette */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"
        style={{ opacity: config.overlayOpacity + 0.2 }}
      ></div>
      <div 
        className="absolute inset-0 bg-black/40 pointer-events-none"
        style={{ opacity: config.overlayOpacity }}
      ></div>

      {/* Content Layer */}
      <div className="absolute inset-0 p-12 flex flex-col justify-end items-start">
        {config.icon && (
          <div className="text-4xl mb-4 drop-shadow-lg opacity-90 animate-pulse">
            {config.icon}
          </div>
        )}
        
        <div className="max-w-2xl">
          <h1 
            className={`text-6xl font-bold leading-tight mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${config.fontStyle === 'serif' ? 'serif' : 'tracking-tight'} text-white`}
          >
            {config.title}
          </h1>
          <p 
            className="text-lg font-light text-slate-200 opacity-80 border-l-2 border-indigo-500 pl-4 uppercase tracking-widest drop-shadow-md"
          >
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* Branding Tag */}
      <div className="absolute top-8 right-8 bg-black/50 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-[10px] tracking-[0.2em] font-bold text-white/50 uppercase">
        Softwave Official
      </div>
    </div>
  );
};

export default Canvas;
