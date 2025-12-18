
import React, { useState, useRef } from 'react';
import { ThumbnailConfig, BrandingGuide } from '../types.ts';
import Canvas from './Canvas.tsx';
import { FILTERS, ICONS, FONT_OPTIONS, PRESET_BACKGROUNDS, DEFAULT_BRANDING } from '../constants.ts';
import * as htmlToImage from 'html-to-image';

interface EditorProps {
  config: ThumbnailConfig;
  setConfig: React.Dispatch<React.SetStateAction<ThumbnailConfig>>;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  branding: BrandingGuide | null;
}

const Editor: React.FC<EditorProps> = ({ config, setConfig, onGenerate, isLoading, branding }) => {
  const [prompt, setPrompt] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const activeFilter = FILTERS.find(f => f.name === config.filter);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    
    // 폰트 렌더링 확정을 위해 약간의 지연
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // 1280x720 고해상도 캡처
      const dataUrl = await htmlToImage.toJpeg(canvasRef.current, { 
        quality: 1.0,
        pixelRatio: 2, 
        backgroundColor: '#020617',
        cacheBust: true,
        style: {
          transform: 'none',
          margin: '0',
          padding: '0',
          borderRadius: '0',
          position: 'static',
          display: 'block'
        }
      });
      
      const link = document.createElement('a');
      link.download = `softwave-thumbnail-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download Error:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateAI = () => {
    const searchQuery = prompt.trim() || "cinematic cozy lofi atmosphere";
    onGenerate(searchQuery);
  };

  // 무드 카피 20개 (데이터가 부족하면 기본값 보충)
  const baseCopy = branding?.copywriting || DEFAULT_BRANDING.copywriting;
  const displayCopywriting = baseCopy.slice(0, 20);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-24">
      
      {/* 1. 결과물 프리뷰 (Sticky 영역) */}
      <div className="w-full lg:col-span-7 xl:col-span-8 sticky-preview">
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/95 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Result Preview</span>
            </div>
            <button 
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
              className="flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-bold bg-white text-slate-950 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            >
              {isDownloading ? '저장 중...' : '고화질 저장'}
            </button>
          </div>
          
          <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
            <Canvas ref={canvasRef} config={config} filter={activeFilter} />
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-bold text-xs tracking-widest">AI가 배경을 상상하는 중...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 컨트롤 영역 */}
      <div className="w-full lg:col-span-5 xl:col-span-4 space-y-8">
        
        {/* AI 배경 생성기 */}
        <section className="bg-indigo-900/10 border border-indigo-500/20 rounded-[2rem] p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">AI Background Creator</label>
          </div>
          <div className="space-y-3">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="주제나 배경 설명을 입력하세요 (예: 비 내리는 창밖, 보라색 네온사인, 숲속의 요정)"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors min-h-[80px] resize-none"
            />
            <button 
              onClick={handleGenerateAI}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? '생성 중...' : '배경 만들기 (AI)'}
            </button>
          </div>
        </section>

        {/* 편집 컨트롤러 카드 */}
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-12">
          
          {/* 배경 프리셋 (기존 10개 유지) */}
          <section className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Library Presets</label>
            <div className="horizontal-presets custom-scrollbar">
              {PRESET_BACKGROUNDS.map(bg => (
                <button 
                  key={bg.id}
                  onClick={() => setConfig({ ...config, backgroundImage: bg.url })}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${config.backgroundImage === bg.url ? 'border-indigo-500 scale-90 ring-4 ring-indigo-500/10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={bg.url} className="w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" />
                </button>
              ))}
            </div>
          </section>

          {/* 타이포그래피 설정 */}
          <section className="space-y-6">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Typography</label>
            <div className="space-y-3">
              <input 
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-base font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                placeholder="메인 제목"
              />
              <input 
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-3.5 text-xs text-slate-400 focus:border-indigo-500/50 focus:outline-none"
                placeholder="서브 제목"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {FONT_OPTIONS.map((font) => (
                <button 
                  key={font.id}
                  onClick={() => setConfig({ ...config, fontStyle: font.id })}
                  className={`py-4 text-[11px] rounded-2xl border transition-all ${config.fontStyle === font.id ? 'bg-white text-slate-950 border-white shadow-xl scale-[1.02]' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'} ${font.class}`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </section>

          {/* 무드 라이브러리 (항상 스크롤바 유지 및 20개 고정) */}
          <section className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Mood Copy Library</label>
              <span className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">20 SAMPLES</span>
            </div>
            <div 
              className="h-[320px] overflow-y-scroll bg-slate-950 rounded-[2rem] border border-white/5 custom-scrollbar shadow-inner block"
              style={{ display: 'block' }}
            >
              <div className="flex flex-col p-4 gap-2">
                {displayCopywriting.map((txt, i) => (
                  <button 
                    key={i}
                    onClick={() => setConfig({ ...config, title: txt })}
                    className={`text-left text-[11px] p-5 border rounded-2xl transition-all active:scale-[0.98] ${config.title === txt ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100' : 'bg-slate-900/40 border-transparent text-slate-400 hover:border-white/10 hover:text-white'}`}
                  >
                    <span className="opacity-20 mr-3 text-[9px] font-mono">#{String(i+1).padStart(2, '0')}</span>{txt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 비주얼 디테일 */}
          <section className="space-y-8 pb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5 block">Visual Filters</label>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button 
                    key={f.name}
                    onClick={() => setConfig({ ...config, filter: f.name })}
                    className={`px-5 py-3 text-[10px] rounded-2xl border transition-all ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atmosphere Intensity</label>
                <span className="text-[11px] font-mono text-indigo-400 font-bold">{Math.round(config.overlayOpacity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="0.85" step="0.01"
                value={config.overlayOpacity}
                onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex justify-between bg-slate-950 p-4 rounded-[2rem] border border-white/5 shadow-inner">
              {ICONS.map(i => (
                <button 
                  key={i.id}
                  onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${config.icon === i.emoji ? 'bg-white text-3xl scale-110 shadow-2xl' : 'bg-transparent text-2xl opacity-15 hover:opacity-100'}`}
                >
                  {i.emoji}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Editor;
