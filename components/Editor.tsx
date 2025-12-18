
import React, { useState } from 'react';
import { ThumbnailConfig, BrandingGuide } from '../types';
import Canvas from './Canvas';
import { FILTERS, ICONS, DEFAULT_PROMPT } from '../constants';

interface EditorProps {
  config: ThumbnailConfig;
  setConfig: React.Dispatch<React.SetStateAction<ThumbnailConfig>>;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  branding: BrandingGuide | null;
}

const Editor: React.FC<EditorProps> = ({ config, setConfig, onGenerate, isLoading, branding }) => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  const activeFilter = FILTERS.find(f => f.name === config.filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left side: Preview Canvas */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">실시간 미리보기 (16:9)</span>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/30"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/30"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/30"></span>
            </div>
          </div>
          <Canvas config={config} filter={activeFilter} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-indigo-400">✦</span> AI 배경 생성기
          </h3>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-4"
            placeholder="생성하고 싶은 배경의 분위기를 설명해주세요..."
          />
          <button 
            onClick={() => onGenerate(prompt)}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
                마법을 부리는 중...
              </>
            ) : (
              '새로운 분위기 생성하기'
            )}
          </button>
        </div>
      </div>

      {/* Right side: Controls */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-4">디자인 컨트롤</h2>
          
          <div className="space-y-6">
            {/* Typography Section */}
            <section>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">타이포그래피</label>
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="메인 제목"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <input 
                  type="text"
                  placeholder="부제목"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setConfig({ ...config, fontStyle: 'serif' })}
                    className={`flex-1 py-2 text-xs rounded-lg border border-slate-800 ${config.fontStyle === 'serif' ? 'bg-indigo-600 border-indigo-600 text-white' : 'text-slate-400 hover:border-slate-700'}`}
                  >
                    명조체 (Serif)
                  </button>
                  <button 
                    onClick={() => setConfig({ ...config, fontStyle: 'sans' })}
                    className={`flex-1 py-2 text-xs rounded-lg border border-slate-800 ${config.fontStyle === 'sans' ? 'bg-indigo-600 border-indigo-600 text-white' : 'text-slate-400 hover:border-slate-700'}`}
                  >
                    고딕체 (Sans)
                  </button>
                </div>
              </div>
            </section>

            {/* Visual Filters */}
            <section>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">분위기 필터</label>
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.map((f) => (
                  <button 
                    key={f.name}
                    onClick={() => setConfig({ ...config, filter: f.name })}
                    className={`py-2 px-3 text-xs rounded-lg border border-slate-800 text-left truncate ${config.filter === f.name ? 'bg-indigo-600 border-indigo-600 text-white' : 'text-slate-400 hover:border-slate-700'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Elements */}
            <section>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">오버레이 및 아이콘</label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>비네팅 강도</span>
                    <span>{Math.round(config.overlayOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.overlayOpacity}
                    onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div className="flex gap-3">
                  {ICONS.map(i => (
                    <button 
                      key={i.id}
                      onClick={() => setConfig({ ...config, icon: i.emoji === config.icon ? null : i.emoji })}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border border-slate-800 text-lg transition-all ${config.icon === i.emoji ? 'bg-indigo-600 border-indigo-600 scale-110' : 'hover:bg-slate-800'}`}
                      title={i.name}
                    >
                      {i.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Branding Suggestions */}
            {branding && (
              <section className="bg-slate-950 p-4 rounded-xl border border-indigo-500/20">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 block">AI 추천 문구</label>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 italic mb-2">클릭하여 제목으로 사용하세요:</p>
                  <div className="h-32 overflow-y-auto space-y-2 scrollbar-hide">
                    {branding.copywriting.map((title, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setConfig({ ...config, title })}
                        className="w-full text-left text-xs bg-slate-900 hover:bg-slate-800 p-2 rounded border border-slate-800 transition-colors text-slate-300"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
