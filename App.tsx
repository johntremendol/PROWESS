import { useState } from 'react';
import { AppView } from './types';
import SplitterApp from './apps/splitter/SplitterApp';
import { Plus } from './components/ui/Icons';
import prowessLogo from './src/assets/prowesslogo.png';
import splitterLogo from './src/assets/splitterlogo.png';

function App() {
  const [currentApp, setCurrentApp] = useState<AppView>(AppView.LAUNCHER);

  if (currentApp === AppView.SPLITTER) {
    return <SplitterApp onBack={() => setCurrentApp(AppView.LAUNCHER)} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between relative overflow-hidden">
      
      {/* Top Logo - Anchored Top */}
      <div className="w-full px-4 pt-4 pb-0">
        <img src={prowessLogo} alt="PROWESS" className="w-full object-contain" />
      </div>

      {/* Middle Spacer */}
      <div className="flex-1" />

      {/* Bottom Controls - Anchored Bottom */}
      <div className="w-full max-w-md flex flex-col items-center gap-8 pb-12">
        
        {/* Buttons Grid */}
        <div className="flex gap-6 w-full justify-center">
            {/* Splitter Button */}
        <button 
          onClick={() => setCurrentApp(AppView.SPLITTER)}
              className="w-32 h-32 rounded-[2rem] border-[2px] border-prowess-beige text-prowess-beige flex items-center justify-center hover:bg-prowess-beige hover:text-black transition-colors group overflow-hidden p-5"
            >
              <img 
                src={splitterLogo} 
                alt="Splitter" 
                className="w-full h-full object-contain filter brightness-100 group-hover:brightness-0 transition-all" 
              />
        </button>

            {/* Suggest/Add Button */}
            <button 
              className="w-32 h-32 rounded-[2rem] border-[2px] border-prowess-beige text-prowess-beige flex items-center justify-center hover:bg-prowess-beige hover:text-black transition-colors cursor-not-allowed opacity-50"
            >
              <Plus size={48} strokeWidth={1.5} />
            </button>
        </div>

        {/* Footer Text */}
        <div className="text-label text-prowess-beige text-xs">
          APPS
      </div>
      </div>
    </div>
  );
}

export default App;
