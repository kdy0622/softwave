
import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { ThumbnailConfig, BrandingGuide, AppTab } from './types';
import Editor from './components/Editor';
import BrandingGuideView from './components/BrandingGuideView';
import { DEFAULT_PROMPT } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('editor');
  const [config, setConfig] = useState<ThumbnailConfig>({
    backgroundImage: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1280&h=720&auto=format&fit=crop',
    title: '잠 못 드는 새벽의 조각들',
    subtitle: '깊은 숙면을 위한 로파이 비트 모음',
    filter: '없음',
    fontStyle: 'serif',
    icon: '🌙',
    overlayOpacity: 0.3,
  });
  
  const [branding, setBranding] = useState<BrandingGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const gemini = new GeminiService();

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const data = await gemini.fetchBrandingGuide();
      setBranding(data);
    } catch (error) {
      console.error("브랜딩 로드 실패:", error);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    setLoading(true);
    try {
      const imageUrl = await gemini.generateBackground(prompt);
      setConfig(prev => ({ ...prev, backgroundImage: imageUrl }));
    } catch (error) {
      console.error("이미지 생성 실패:", error);
      alert("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div>
            <h1 className="text-xl font-semibold tracking-tight">Softwave 스튜디오</h1>
          </div>
          <nav className="flex gap-4">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              에디터
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'branding' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              브랜딩 가이드
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">
        <div className="max-w-7xl mx-auto p-6">
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

      {/* Footer */}
      <footer className="border-t border-slate-900 p-4 text-center text-slate-600 text-xs">
        &copy; 2024 Softwave 브랜딩 스튜디오 • Powered by Gemini AI
      </footer>
    </div>
  );
};

export default App;
