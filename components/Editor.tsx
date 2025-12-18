
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
    try {
      // 렌더링 안정성을 위해 미세한 지연
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await htmlToImage.toPng(canvasRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#020617'
      });
      const link = document.createElement('a');
      link.download = `softwave-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 왼쪽: 미리보기 및 이미지 생성 */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Studio View</span>
            </div>
            <button 
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-white text-slate-950 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {isDownloading ? '저장 중...' : '결과물 저장'}
            </button>
          </div>
          
          <div className="relative p-2 bg-slate-950">
            <Canvas ref={canvasRef} config={config} filter={activeFilter} />
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-bold text-sm tracking-widest animate-pulse">무드 이미지를 찾는 중...</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
              프리셋 테마
            </h3>
            <div className="grid grid-cols-5 gap-2 h-[140px] overflow-y-auto pr-2 custom-scrollbar">
              {PRESET_BACKGROUNDS.map(bg => (
                <button 
                  key={bg.id}
                  onClick={() => setConfig({ ...config, backgroundImage: bg.url })}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${config.backgroundImage === bg.url ? 'border-indigo-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white py-0.5 text-center">
                    {bg.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex flex-col shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1 h-4 bg-violet-500 rounded-full"></span>
                무드 검색 엔진
              </span>
              <span className="text-[8px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full font-bold">Free</span>
            </h3>
            <div className="flex-1 flex flex-col gap-3">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onGenerate(prompt || "lofi room rain")}
                placeholder="어떤 분위기를 원하시나요?"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all"
              />
              <button 
                onClick={() => onGenerate(prompt || "lofi night sky")}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl text-xs font-bold bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? '검색 중...' : '배경 이미지 찾기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 디자인 컨트롤 */}
      <div className="lg:col-span-4 h-full">
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 h-[calc(100vh-160px)] flex flex-col shadow-2xl sticky top-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Toolbox</h2>
            <button 
              onClick={() => setConfig({ ...config, title: '새로운 이야기', subtitle: '감성을 담은 비트' })}
              className="text-[10px] text-indigo-400 hover:text-white transition-colors"
            >
              초기화
            </button>
          </div>
          
          <div className="flex-1 space-y-10 overflow-y-auto pr-3 custom-scrollbar">
            {/* 타이틀 입력 */}
            <section className="space-y-4">
              <div className="space-y-3">
                <input 
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="메인 타이틀"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                />
                <input 
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="서브 타이틀"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-slate-400 focus:border-indigo-500/50 focus:outline-none"
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

            {/* 무드 라이브러리 (20개 문구 스크롤 선택 영역) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Mood Library (20)</label>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-3 bg-slate-950/50 rounded-2xl p-2 border border-white/5">
                {(branding?.copywriting || DEFAULT_BRANDING.copywriting).map((txt, i) => (
                  <button 
                    key={i}
                    onClick={() => setConfig({ ...config, title: txt })}
                    className={`group text-left text-[11px] p-4 border rounded-xl transition-all active:scale-[0.98] ${config.title === txt ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:border-indigo-500/30'}`}
                  >
                    <span className={`mr-2 transition-colors ${config.title === txt ? 'text-indigo-300' : 'opacity-40 group-hover:opacity-100 group-hover:text-indigo-400'}`}>#</span>
                    {txt}
                  </button>
                ))}
              </div>
            </section>

            {/* 나머지 컨트롤 */}
            <section className="space-y-8 pb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Atmosphere Filter</label>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map(f => (
                    <button 
                      key={f.name}
                      onClick={() => setConfig({ ...config, filter: f.name })}
                      className={`px-4 py-2 text-[10px] rounded-full border transition-all ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dimmer Control</label>
                  <span className="text-[10px] font-mono text-indigo-400">{Math.round(config.overlayOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="0.8" step="0.01"
                  value={config.overlayOpacity}
                  onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex justify-center gap-3 bg-slate-950 p-4 rounded-2xl border border-white/5">
                {ICONS.map(i => (
                  <button 
                    key={i.id}
                    onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border text-xl transition-all ${config.icon === i.emoji ? 'bg-white border-white scale-110 shadow-xl' : 'bg-slate-900 border-white/5 hover:bg-slate-800'}`}
                  >
                    {i.emoji}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
