
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
      link.download = `softwave-pro-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download Error:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateClick = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      alert("원하는 배경의 키워드를 입력해주세요.");
      return;
    }
    onGenerate(cleanPrompt);
  };

  const copywritingList = branding?.copywriting || DEFAULT_BRANDING.copywriting;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-start mb-24">
      
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-[3rem] p-10 text-center shadow-[0_0_100px_rgba(99,102,241,0.2)] animate-in zoom-in duration-300 max-w-sm w-full">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">리얼리티 렌더링 중</h3>
            <p className="text-slate-400 text-xs">AI가 초실사 배경 이미지를 생성하고 있습니다.</p>
          </div>
        </div>
      )}

      {/* 왼쪽: 프리뷰 */}
      <div className="w-full lg:col-span-7 xl:col-span-8 sticky-preview">
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/95 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">라이브 스튜디오 캔버스</span>
            </div>
            <button 
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
              className="px-5 py-2 rounded-full text-[11px] font-black bg-white text-slate-950 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
            >
              {isDownloading ? '저장 중...' : '이미지저장'}
            </button>
          </div>
          
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <Canvas ref={canvasRef} config={config} filter={activeFilter} />
          </div>
        </div>
      </div>

      {/* 오른쪽: 편집 도구 */}
      <div className="w-full lg:col-span-5 xl:col-span-4 space-y-6">
        
        <section className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🤖</span>
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider">AI 초실사 배경 생성</h4>
          </div>
          <form onSubmit={handleGenerateClick} className="space-y-3">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 비 오는 숲속의 오두막, 새벽의 차가운 도시"
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all min-h-[60px] max-h-[90px] resize-none placeholder:text-slate-600 shadow-inner"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-[11px] bg-indigo-600 text-white hover:bg-indigo-500 transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              배경 생성 시작
            </button>
          </form>
        </section>

        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl space-y-8">
          
          <section className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">배경 조도 조절</label>
                <span className="text-[10px] font-mono text-indigo-400">{Math.round(config.overlayOpacity * 100)}%</span>
             </div>
             <input 
               type="range"
               min="0"
               max="0.9"
               step="0.01"
               value={config.overlayOpacity}
               onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
               className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
             <p className="text-[9px] text-slate-600 px-1">슬라이더를 오른쪽으로 밀수록 전체 배경이 어두워져 글자가 돋보입니다.</p>
          </section>

          <section className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">추천 배경 이미지</label>
            <div className="horizontal-presets custom-scrollbar pb-2">
              {PRESET_BACKGROUNDS.map(bg => (
                <button 
                  key={bg.id}
                  onClick={() => setConfig({ ...config, backgroundImage: bg.url })}
                  className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all ${config.backgroundImage === bg.url ? 'border-indigo-500 scale-95 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={bg.url} className="w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">타이포그래피 설정</label>
            <input 
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
              placeholder="제목 직접 입력"
            />
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((font) => (
                <button 
                  key={font.id}
                  onClick={() => setConfig({ ...config, fontStyle: font.id })}
                  className={`py-2.5 text-[10px] rounded-xl border transition-all ${config.fontStyle === font.id ? 'bg-white text-slate-950 border-white font-black' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300'}`}
                >
                  <span className={font.class}>{font.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">무드 라이브러리 (추천 문구 20개)</label>
            <div className="h-[180px] overflow-y-auto bg-slate-950/50 rounded-2xl border border-white/5 custom-scrollbar p-2 shadow-inner">
              <div className="flex flex-col gap-1">
                {copywritingList.map((txt, i) => (
                  <button 
                    key={i}
                    onClick={() => setConfig({ ...config, title: txt })}
                    className={`text-left text-[11px] p-3 rounded-lg transition-all ${config.title === txt ? 'bg-indigo-600/10 text-indigo-100 border-l-4 border-indigo-500' : 'bg-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">색감 필터</label>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map(f => (
                <button 
                  key={f.name}
                  onClick={() => setConfig({ ...config, filter: f.name })}
                  className={`px-3 py-2 text-[10px] rounded-lg border transition-all ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-slate-950 border-white/5 text-slate-600 hover:text-white'}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">빠른 이모티콘</label>
            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-2xl border border-white/5">
              {ICONS.map(i => (
                <button 
                  key={i.id}
                  onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${config.icon === i.emoji ? 'bg-white text-xl shadow-lg' : 'bg-transparent text-lg opacity-20 hover:opacity-100 scale-90 hover:scale-110'}`}
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
