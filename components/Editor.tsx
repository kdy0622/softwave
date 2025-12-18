
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
    
    // 캡처 전 폰트 로딩 대기를 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // 유튜브 썸네일 규격: 1280x720, 2MB 이하
      const dataUrl = await htmlToImage.toJpeg(canvasRef.current, { 
        quality: 0.85, 
        width: 1280,
        height: 720,
        pixelRatio: 1, 
        backgroundColor: '#020617',
        cacheBust: true,
        style: {
          transform: 'none', // 캡처 시 변형 방지
        }
      });
      
      const link = document.createElement('a');
      link.download = `softwave-thumbnail-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download Error:', err);
      alert('썸네일 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSearch = () => {
    const searchQuery = prompt.trim() || "cinematic cozy night atmosphere";
    onGenerate(searchQuery);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-20">
      {/* 프리뷰 영역: 모바일에서도 툴바 조절 시 항상 상단에 노출되도록 sticky 적용 */}
      <div className="w-full lg:col-span-7 xl:col-span-8 space-y-4 lg:sticky lg:top-20 z-30 sticky-preview">
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-pulse"></span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 hidden sm:inline">LIVE PREVIEW</span>
            </div>
            <button 
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-bold bg-white text-slate-950 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
            >
              {isDownloading ? '준비 중...' : '결과물 저장'}
            </button>
          </div>
          
          <div className="relative p-0 bg-slate-950 flex items-center justify-center overflow-hidden">
            {/* Canvas는 1280x720 원본 비율을 유지하며 캡처됨 */}
            <Canvas ref={canvasRef} config={config} filter={activeFilter} />
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-bold text-sm">무드를 검색하는 중...</p>
              </div>
            )}
          </div>
        </div>

        {/* 배경 빠른 변경 도구 */}
        <div className="hidden lg:flex gap-3 bg-slate-900/50 border border-white/5 rounded-2xl p-3 items-center">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2">Presets</label>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar scrollbar-hide flex-1">
            {PRESET_BACKGROUNDS.map(bg => (
              <button 
                key={bg.id}
                onClick={() => setConfig({ ...config, backgroundImage: bg.url })}
                className={`flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${config.backgroundImage === bg.url ? 'border-indigo-500 scale-90' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={bg.url} className="w-full h-full object-cover" crossOrigin="anonymous" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 에디터 툴박스 */}
      <div className="w-full lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 md:p-7 shadow-2xl space-y-8">
          
          {/* 1. 배경 생성 */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">AI Background Engine</label>
            <div className="flex gap-2">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="어떤 분위기의 배경을 원하시나요?"
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white focus:outline-none focus:border-indigo-500/50"
              />
              <button 
                onClick={handleSearch}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl text-[12px] font-bold bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95"
              >
                생성
              </button>
            </div>
          </section>

          {/* 2. 타이포그래피 */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Typography & Content</label>
            <div className="space-y-2">
              <input 
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                placeholder="메인 타이틀"
              />
              <input 
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-slate-400 focus:border-indigo-500/50 focus:outline-none"
                placeholder="서브 타이틀"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((font) => (
                <button 
                  key={font.id}
                  onClick={() => setConfig({ ...config, fontStyle: font.id })}
                  className={`py-3 text-[10px] rounded-xl border transition-all ${config.fontStyle === font.id ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'} ${font.class}`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </section>

          {/* 3. 무드 라이브러리 (스크롤 고정 수정) */}
          <section className="flex flex-col space-y-3">
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Mood Library Selection</label>
            <div 
              className="h-[280px] md:h-[340px] overflow-y-scroll bg-slate-950 rounded-2xl border border-white/10 custom-scrollbar shadow-inner"
            >
              <div className="flex flex-col p-2 gap-1.5">
                {(branding?.copywriting || DEFAULT_BRANDING.copywriting).map((txt, i) => (
                  <button 
                    key={i}
                    onClick={() => setConfig({ ...config, title: txt })}
                    className={`text-left text-[11px] p-4 border rounded-xl transition-all active:scale-[0.98] ${config.title === txt ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900 border-transparent text-slate-400 hover:border-white/10 hover:text-white'}`}
                  >
                    <span className="opacity-40 mr-2 text-[9px]">#</span>{txt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 4. 비주얼 제어 */}
          <section className="space-y-6 pb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Atmosphere Filters</label>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button 
                    key={f.name}
                    onClick={() => setConfig({ ...config, filter: f.name })}
                    className={`px-4 py-2 text-[10px] rounded-xl border transition-all ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Darkness</label>
                <span className="text-[10px] font-mono text-indigo-400">{Math.round(config.overlayOpacity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="0.8" step="0.01"
                value={config.overlayOpacity}
                onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex justify-around bg-slate-950 p-3 rounded-2xl border border-white/5">
              {ICONS.map(i => (
                <button 
                  key={i.id}
                  onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${config.icon === i.emoji ? 'bg-white text-2xl scale-110 shadow-xl' : 'bg-transparent text-lg opacity-30 hover:opacity-100'}`}
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
