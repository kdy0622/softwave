
import React, { useState, useRef } from 'react';
import { ThumbnailConfig, BrandingGuide } from '../types.ts';
import Canvas from './Canvas.tsx';
import { FILTERS, ICONS, DEFAULT_PROMPT, FONT_OPTIONS } from '../constants.ts';
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
      // 폰트 렌더링을 기다리기 위해 아주 짧은 지연시간 부여
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2, // 고해상도 다운로드
      });
      
      const link = document.createElement('a');
      link.download = `softwave-thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('다운로드 중 오류 발생:', err);
      alert('이미지 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 미리보기 영역 */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative group">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">PRO Preview</span>
              {isDownloading && (
                <span className="text-[10px] text-indigo-400 animate-pulse">이미지 렌더링 중...</span>
              )}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold transition-all ${
                  isDownloading 
                  ? 'bg-slate-800 text-slate-500' 
                  : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {isDownloading ? '준비 중' : '이미지 저장'}
              </button>
            </div>
          </div>
          <Canvas ref={canvasRef} config={config} filter={activeFilter} />
        </div>

        {/* AI 배경 생성 섹션 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 p-1 rounded-md">✨</span>
              지능형 AI 배경 엔진
            </h3>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase">Gemini 2.5 Image</span>
          </div>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-4 placeholder:text-slate-700"
            placeholder={DEFAULT_PROMPT}
          />
          <button 
            onClick={() => onGenerate(prompt || "Dreamy lofi bedroom at night")}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
              isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.01] active:scale-[0.99] text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
                AI가 테마를 분석하고 배경을 그리고 있습니다...
              </>
            ) : (
              '테마 분석 및 배경 생성'
            )}
          </button>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
             <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
             디자인 스튜디오
          </h2>
          
          <div className="flex-1 space-y-8 overflow-y-auto pr-1">
            {/* 타이포그래피 확장 */}
            <section>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Typography & Fonts</label>
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="메인 제목 입력"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none text-white font-medium"
                />
                <input 
                  type="text"
                  placeholder="부제목 입력"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none text-slate-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button 
                      key={font.id}
                      onClick={() => setConfig({ ...config, fontStyle: font.id })}
                      className={`py-2.5 px-3 text-xs rounded-xl border transition-all ${config.fontStyle === font.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'} ${font.class}`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 필터 섹션 */}
            <section>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Atmosphere Filter</label>
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.map((f) => (
                  <button 
                    key={f.name}
                    onClick={() => setConfig({ ...config, filter: f.name })}
                    className={`py-2 px-3 text-xs rounded-xl border transition-all truncate ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </section>

            {/* AI 대량 추천 문구 */}
            {branding && (
              <section className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">AI Copywriting (20+)</label>
                  <span className="text-[8px] text-indigo-500/50">SCROLL</span>
                </div>
                <div className="h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {branding.copywriting.map((title, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setConfig({ ...config, title })}
                      className="w-full text-left text-xs bg-slate-950/50 hover:bg-indigo-600/20 p-3 rounded-xl border border-slate-800/50 transition-all text-slate-400 hover:text-indigo-200"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 오버레이 조정 */}
            <section className="pb-4">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Vignette & Icons</label>
                <div className="flex gap-2">
                  {ICONS.map(i => (
                    <button 
                      key={i.id}
                      onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm transition-all ${config.icon === i.emoji ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'}`}
                    >
                      {i.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.overlayOpacity}
                onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </section>
          </div>
          
          {/* 하단 통합 다운로드 버튼 (모바일 접근성 등 고려) */}
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
             {isDownloading ? '저장하는 중...' : '최종 이미지 다운로드'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
