import { useState } from 'react';
import { AppView } from './types';
import SplitterApp from './apps/splitter/SplitterApp';
import { Plus } from './components/ui/Icons';
import prowessLogo from './assets/prowesslogo.png';

function App() {
  const [currentApp, setCurrentApp] = useState<AppView>(AppView.LAUNCHER);

  if (currentApp === AppView.SPLITTER) {
    return <SplitterApp onBack={() => setCurrentApp(AppView.LAUNCHER)} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between py-12 px-6 relative overflow-hidden">
      
      {/* Top Logo */}
      <div className="w-full max-w-2xl pt-8">
        <img src={prowessLogo} alt="PROWESS" className="w-full object-contain" />
      </div>

      {/* Middle Spacer */}
      <div className="flex-1" />

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-12 pb-12">
        
        {/* Buttons Grid */}
        <div className="flex gap-8 w-full justify-center">
            {/* Splitter Button */}
            <button 
              onClick={() => setCurrentApp(AppView.SPLITTER)}
              className="w-36 h-36 rounded-[2rem] border-[2px] border-prowess-beige text-prowess-beige flex items-center justify-center hover:bg-prowess-beige hover:text-black transition-colors group"
            >
              <span className="font-serif text-7xl font-light relative top-1 italic">$</span>
            </button>

            {/* Suggest/Add Button */}
            <button 
              className="w-36 h-36 rounded-[2rem] border-[2px] border-prowess-beige text-prowess-beige flex items-center justify-center hover:bg-prowess-beige hover:text-black transition-colors cursor-not-allowed opacity-50"
            >
              <Plus size={56} strokeWidth={1.5} />
            </button>
        </div>

        {/* Footer Text */}
        <div className="text-prowess-beige tracking-[0.5em] text-sm font-optician font-bold">
          APPS
        </div>
      </div>
    </div>
  );
}

export default App;
