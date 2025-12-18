
import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/geminiService.ts';
import { ThumbnailConfig, BrandingGuide, AppTab } from './types.ts';
import Editor from './components/Editor.tsx';
import BrandingGuideView from './components/BrandingGuideView.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('editor');
  const [config, setConfig] = useState<ThumbnailConfig>({
    backgroundImage: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=1280&h=720',
    title: '잠 못 드는 새벽의 조각들',
    subtitle: '깊은 숙면을 위한 로파이 비트 모음',
    filter: '없음',
    fontStyle: 'serif',
    icon: '🌙',
    overlayOpacity: 0.3,
  });
  
  const [branding, setBranding] = useState<BrandingGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [gemini] = useState(() => new GeminiService());

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const data = await gemini.fetchBrandingGuide();
      setBranding(data);
    } catch (error) {
      console.error("브랜딩 로드 실패");
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    setLoading(true);
    try {
      const imageUrl = await gemini.generateBackground(prompt);
      setConfig(prev => ({ ...prev, backgroundImage: imageUrl }));
    } catch (error: any) {
      alert("AI 이미지 생성 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도하거나 프리셋을 이용해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="border-b border-white/5 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">S</div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Softwave Studio</h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              에디터
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'branding' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              브랜딩 전략
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {activeTab === 'editor' ? (
            <Editor 
              config={config} 
              setConfig={setConfig} 
              onGenerate={handleGenerateImage}
              isLoading={loading}
              branding={branding}
            />
          ) : (
            <BrandingGuideView branding={branding} isLoading={!branding} />
          )}
        </div>
      </main>

      <footer className="p-6 text-center text-slate-700 text-[10px] tracking-[0.2em] uppercase">
        &copy; 2025 Softwave Studio • Open & Free Design System
      </footer>
    </div>
  );
};

export default App;
