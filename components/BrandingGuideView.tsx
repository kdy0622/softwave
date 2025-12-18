
import React from 'react';
import { BrandingGuide } from '../types';

interface BrandingGuideViewProps {
  branding: BrandingGuide | null;
  isLoading: boolean;
}

const BrandingGuideView: React.FC<BrandingGuideViewProps> = ({ branding, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">창의적인 아이디어를 정리하는 중...</p>
      </div>
    );
  }

  if (!branding) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 serif italic">채널 정체성</h2>
        <p className="text-slate-400">"Softwave"의 미학은 편안함, 고요함, 그리고 늦은 밤의 섬세한 우울함을 기반으로 구축되었습니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Keywords */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4">핵심 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {branding.keywords.map((word, i) => (
              <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-2">
          <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4">기본 컬러 팔레트</h3>
          <div className="grid grid-cols-4 gap-4">
            {branding.colors.map((color, i) => (
              <div key={i} className="space-y-2">
                <div 
                  className="h-16 rounded-xl border border-white/10 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="text-[10px] text-center">
                  <div className="text-white font-medium">{color.name}</div>
                  <div className="text-slate-500 font-mono uppercase">{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copywriting */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4">무드 메시지</h3>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            "깊은 네이비와 차분한 보라색이 만나 잠 못 드는 영혼을 위한 안식처를 만듭니다."
          </p>
        </div>
      </div>

      {/* Layout Strategies */}
      <section>
        <h3 className="text-2xl font-bold mb-6 serif">추천 레이아웃</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {branding.layouts.map((layout) => (
            <div key={layout.id} className="group cursor-default">
              <div className="aspect-video bg-slate-900 border-2 border-slate-800 rounded-xl mb-4 relative overflow-hidden group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                 <div className="text-xs text-slate-600 font-mono uppercase tracking-tighter">
                   시각화: {layout.name}
                 </div>
              </div>
              <h4 className="font-bold text-white mb-1">{layout.name}</h4>
              <p className="text-sm text-slate-400">{layout.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Headline Ideas */}
      <section className="bg-indigo-900/10 border border-indigo-500/20 p-10 rounded-3xl">
         <h3 className="text-2xl font-bold mb-8 serif text-center">감성 타이틀 뱅크</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {branding.copywriting.map((text, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-300 border-b border-slate-800 pb-2">
                <span className="text-indigo-500 font-mono text-xs">{String(i+1).padStart(2, '0')}</span>
                <span className="text-lg">{text}</span>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default BrandingGuideView;
