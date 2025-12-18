
import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/geminiService.ts';
import { ThumbnailConfig, BrandingGuide, AppTab } from './types.ts';
import Editor from './components/Editor.tsx';
import BrandingGuideView from './components/BrandingGuideView.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('editor');
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [config, setConfig] = useState<ThumbnailConfig>({
    backgroundImage: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=1280&h=720',
    title: '잠 못 드는 새벽의 조각들',
    subtitle: '깊은 숙면을 위한 리얼 사운드',
    filter: '없음',
    fontStyle: 'serif',
    icon: '🌙',
    overlayOpacity: 0.45,
  });
  
  const [branding, setBranding] = useState<BrandingGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [gemini] = useState(() => new GeminiService());

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        loadBranding();
      }
    } else {
      // aistudio 환경이 아닌 경우(예: Vercel 배포) 기본적으로 환경 변수 키를 사용하도록 설정
      setHasKey(true);
      loadBranding();
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // 선택 직후 성공으로 간주하고 UI 진행
      setHasKey(true);
      loadBranding();
    }
  };

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
      console.error("이미지 생성 에러:", error);
      const errorMessage = error.message || "";
      
      // API Key 관련 특정 에러 발생 시 키 선택 화면으로 유도 (aistudio 환경일 때만)
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API Key Project Not Found")) {
        if (window.aistudio) {
          alert("선택된 API 키가 유효하지 않거나 유료 프로젝트에 연결되어 있지 않습니다. 키를 다시 선택해주세요.");
          setHasKey(false);
        } else {
          alert("API 키 프로젝트를 찾을 수 없습니다. 설정된 API 키가 유료 플랜(Paid Tier)인지 확인해주세요.");
        }
      } else {
        alert(`배경 생성 중 오류가 발생했습니다: ${errorMessage || "다시 시도해주세요."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // aistudio 환경에서 키가 없는 경우에만 키 선택 UI 노출
  if (hasKey === false && window.aistudio) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 p-12 bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(79,70,229,0.4)] mb-8">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gemini API 키 필요</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            하이퍼 리얼리스틱 배경 생성을 위해 <br/>
            <strong>유료 프로젝트(Paid Project)</strong>의 <br/>
            Gemini API 키 연결이 반드시 필요합니다.
          </p>
          <div className="pt-4 space-y-4">
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl"
            >
              유료 API 키 선택하기
            </button>
            <div className="flex flex-col gap-2">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-4 tracking-wider"
              >
                결제 및 프로젝트 설정 가이드
              </a>
              <p className="text-[9px] text-slate-600">
                무료 등급(Free tier) 키는 이미지 생성이 제한될 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="border-b border-white/5 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="h-7 md:h-8 px-2.5 md:px-3.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg md:rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-[10px] md:text-[11px] tracking-tighter italic">
              SOFTWAVE
            </div>
            <div className="hidden xs:block">
              <h1 className="text-xs md:text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap">스튜디오 프로</h1>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[7px] md:text-[8px] text-green-500 font-bold uppercase tracking-widest">라이브 엔진 가동중</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
              <button 
                onClick={() => setActiveTab('editor')}
                className={`px-3 md:px-5 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'editor' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                에디터
              </button>
              <button 
                onClick={() => setActiveTab('branding')}
                className={`px-3 md:px-5 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'branding' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                브랜딩 가이드
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
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
      </main>

      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-slate-600 text-[10px] tracking-[0.2em] uppercase font-bold px-4">
          Gemini 3 Pro Image 기반 초실사 이미지 엔진 탑재
        </p>
      </footer>
    </div>
  );
};

export default App;
