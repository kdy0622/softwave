
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
      await new Promise(resolve => setTimeout(resolve, 800));
      const dataUrl = await htmlToImage.toJpeg(canvasRef.current, { 
        quality: 1.0,
        pixelRatio: 2, 
        backgroundColor: '#020617',
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `softwave-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download Error:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onGenerate(prompt.trim());
  };

  const baseCopy = branding?.copywriting || DEFAULT_BRANDING.copywriting;
  const displayCopywriting = baseCopy.slice(0, 20);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-24">
      
      {/* 고품질 생성 중 모달 */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-12 max-w-sm w-full text-center shadow-[0_0_80px_rgba(99,102,241,0.3)] animate-in zoom-in duration-300">
            <div className="relative w-16 h-16 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🪄</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">이미지 찾는 중...</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              최적의 감성 이미지를<br/>자동으로 매칭하고 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 1. 프리뷰 영역 */}
      <div className="w-full lg:col-span-7 xl:col-span-8 sticky-preview">
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-3 md:p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/95 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Preview</span>
            </div>
            <button 
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
              className="px-5 py-2.5 rounded-full text-[11px] font-bold bg-white text-slate-950 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            >
              {isDownloading ? '저장 중' : '이미지 저장'}
            </button>
          </div>
          
          <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
            <Canvas ref={canvasRef} config={config} filter={activeFilter} />
          </div>
        </div>
      </div>

      {/* 2. 에디터 컨트롤 영역 */}
      <div className="w-full lg:col-span-5 xl:col-span-4 space-y-6 md:space-y-8">
        
        {/* 자동 배경 생성 섹션 */}
        <section className="bg-gradient-to-br from-indigo-900/20 to-slate-900/60 border border-indigo-500/30 rounded-[2.5rem] p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xl">✨</div>
            <div>
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Auto Mood Creator</label>
              <p className="text-[11px] text-slate-500">원하는 테마를 입력하고 배경을 만드세요</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 비 내리는 고요한 카페, 새벽녘의 보라색 도시"
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all min-h-[90px] resize-none placeholder:text-slate-700 shadow-inner"
            />
            <button 
              type="button"
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="w-full py-4.5 rounded-2xl text-sm font-black bg-indigo-600 text-white hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-950/40 border border-white/10"
            >
              배경생성
            </button>
            <p className="text-[9px] text-slate-600 text-center uppercase tracking-tighter">API 키 없이도 지능형 엔진이 즉시 배경을 찾아드립니다</p>
          </div>
        </section>

        {/* 편집 컨트롤 패널 */}
        <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-6 md:p-8 shadow-2xl space-y-10">
          
          {/* 라이브러리 프리셋 */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block px-1">Library Presets</label>
            <div className="horizontal-presets custom-scrollbar pb-2">
              {PRESET_BACKGROUNDS.map(bg => (
                <button 
                  key={bg.id}
                  onClick={() => setConfig({ ...config, backgroundImage: bg.url })}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all ${config.backgroundImage === bg.url ? 'border-indigo-500 scale-90 ring-4 ring-indigo-500/10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={bg.url} className="w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" />
                </button>
              ))}
            </div>
          </section>

          {/* 가독성 제어 슬라이더 (새로 추가됨) */}
          <section className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility (Darkness)</label>
                <span className="text-[10px] font-mono text-indigo-400">{Math.round(config.overlayOpacity * 100)}%</span>
             </div>
             <input 
               type="range"
               min="0"
               max="0.8"
               step="0.01"
               value={config.overlayOpacity}
               onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
               className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
             <p className="text-[9px] text-slate-600">배경이 너무 밝아 글씨가 안 보일 때 수치를 높여주세요.</p>
          </section>

          {/* 타이포그래피 */}
          <section className="space-y-6">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block px-1">Typography</label>
            <div className="space-y-3">
              <input 
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-base font-bold text-white focus:border-indigo-500/50 focus:outline-none transition-all shadow-inner"
                placeholder="메인 제목 입력"
              />
              <div className="grid grid-cols-2 gap-3">
                {FONT_OPTIONS.map((font) => (
                  <button 
                    key={font.id}
                    onClick={() => setConfig({ ...config, fontStyle: font.id })}
                    className={`py-3.5 text-[11px] rounded-2xl border transition-all ${config.fontStyle === font.id ? 'bg-white text-slate-950 border-white shadow-xl scale-[1.03]' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300'}`}
                  >
                    <span className={font.class}>{font.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 무드 카피 라이브러리 */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block px-1">Mood Library</label>
            <div className="h-[250px] overflow-y-auto bg-slate-950/50 rounded-[2rem] border border-white/5 custom-scrollbar shadow-inner p-3">
              <div className="flex flex-col gap-2">
                {displayCopywriting.map((txt, i) => (
                  <button 
                    key={i}
                    onClick={() => setConfig({ ...config, title: txt })}
                    className={`text-left text-[11px] p-4 border rounded-xl transition-all ${config.title === txt ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-100' : 'bg-slate-900/50 border-transparent text-slate-500 hover:bg-slate-800'}`}
                  >
                    <span className="opacity-30 mr-3 text-[9px] font-mono">#{String(i+1).padStart(2, '0')}</span>
                    {txt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 비주얼 옵션 */}
          <section className="space-y-8 pb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 block px-1">Visual Filters</label>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button 
                    key={f.name}
                    onClick={() => setConfig({ ...config, filter: f.name })}
                    className={`px-5 py-3 text-[10px] rounded-2xl border transition-all ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-950 border-white/5 text-slate-600 hover:text-white'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 이모티콘 선택 바 */}
            <div className="flex justify-between items-center bg-slate-950 p-2 md:p-4 rounded-[1.2rem] md:rounded-[2.2rem] border border-white/5 shadow-inner">
              {ICONS.map(i => (
                <button 
                  key={i.id}
                  onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                  className={`w-8 h-8 md:w-14 md:h-14 flex items-center justify-center rounded-lg md:rounded-2xl transition-all ${config.icon === i.emoji ? 'bg-white text-base md:text-3xl scale-110 shadow-2xl' : 'bg-transparent text-sm md:text-2xl opacity-20 hover:opacity-100 hover:scale-110'}`}
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
