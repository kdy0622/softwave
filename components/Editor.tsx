
import React, { useState, useRef } from 'react';
import { ThumbnailConfig, BrandingGuide } from '../types.ts';
import Canvas from './Canvas.tsx';
import { FILTERS, ICONS, DEFAULT_PROMPT, FONT_OPTIONS, PRESET_BACKGROUNDS } from '../constants.ts';
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
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await htmlToImage.toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `softwave-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('저장에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 미리보기 및 빠른 설정 */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Studio Preview</span>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-slate-950 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {isDownloading ? '준비중' : '이미지 저장'}
            </button>
          </div>
          <Canvas ref={canvasRef} config={config} filter={activeFilter} />
        </div>

        {/* 배경 선택 영역 (프리셋 + AI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 프리셋 배경 */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
              프리셋 테마
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_BACKGROUNDS.map(bg => (
                <button 
                  key={bg.id}
                  onClick={() => setConfig({ ...config, backgroundImage: bg.url })}
                  className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${config.backgroundImage === bg.url ? 'border-indigo-500 scale-95 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* AI 생성 배경 */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1 h-4 bg-violet-500 rounded-full"></span>
                AI 아트 엔진
              </span>
              <span className="text-[8px] px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full font-mono uppercase">Gemini Flash</span>
            </h3>
            <div className="flex-1 flex flex-col gap-3">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="어떤 배경을 원하시나요?"
                className="bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
              />
              <button 
                onClick={() => onGenerate(prompt || "Dreamy midnight sky")}
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${isLoading ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02]'}`}
              >
                {isLoading ? '생성 중...' : '새로운 배경 생성'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 디자인 컨트롤 영역 */}
      <div className="lg:col-span-4">
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 h-full flex flex-col shadow-xl">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">Typography & Style</h2>
          
          <div className="space-y-10 overflow-y-auto pr-1">
            {/* 타이포그래피 */}
            <section className="space-y-4">
              <div className="space-y-3">
                <input 
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="제목 입력"
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
                />
                <input 
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="부제목"
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FONT_OPTIONS.map((font) => (
                  <button 
                    key={font.id}
                    onClick={() => setConfig({ ...config, fontStyle: font.id })}
                    className={`py-2 text-[10px] rounded-xl border transition-all ${config.fontStyle === font.id ? 'bg-white text-slate-950 border-white' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'} ${font.class}`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </section>

            {/* AI 추천 문구 */}
            <section>
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 block">Mood Titles</label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                {branding?.copywriting.map((txt, i) => (
                  <button 
                    key={i}
                    onClick={() => setConfig({ ...config, title: txt })}
                    className="text-left text-[11px] p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </section>

            {/* 필터 및 아이콘 */}
            <section className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Atmosphere Filter</label>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map(f => (
                    <button 
                      key={f.name}
                      onClick={() => setConfig({ ...config, filter: f.name })}
                      className={`px-3 py-1.5 text-[10px] rounded-full border transition-all ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Vignette Intensity</label>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={config.overlayOpacity}
                  onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="flex gap-2">
                {ICONS.map(i => (
                  <button 
                    key={i.id}
                    onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                    className={`w-10 h-10 flex items-center justify-center rounded-2xl border text-lg transition-all ${config.icon === i.emoji ? 'bg-white border-white scale-110' : 'bg-slate-950 border-white/5 hover:bg-slate-800'}`}
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
