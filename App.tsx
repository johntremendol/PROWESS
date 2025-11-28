import React, { useState } from 'react';
import { AppView } from './types';
import SplitterApp from './apps/splitter/SplitterApp';
import { Plus, DollarSign } from './components/ui/Icons';

function App() {
  const [currentApp, setCurrentApp] = useState<AppView>(AppView.LAUNCHER);

  if (currentApp === AppView.SPLITTER) {
    return <SplitterApp onBack={() => setCurrentApp(AppView.LAUNCHER)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Texture Logic */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ 
        backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
        mixBlendMode: 'overlay'
      }} />

      {/* Decorative Circles matching the vibe of the reference image */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full border border-white/5 opacity-40" />
      <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full border border-white/5 opacity-50" />
      <div className="absolute top-[-10%] left-[0%] w-[400px] h-[400px] rounded-full border border-white/5 opacity-60" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-2xl mb-12 animate-fade-in">
        <h2 className="text-xs font-sans tracking-[0.3em] text-prowess-muted uppercase mb-2 ml-1">Studio Collection</h2>
        <h1 className="text-4xl sm:text-5xl font-serif text-white tracking-wide">
          PROWESS <br/>
          <span className="italic font-light text-stone-400">PLAYGROUNDS</span>
        </h1>
      </div>

      {/* App Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-6 w-full max-w-md animate-slide-up">
        
        {/* Splitter Card (Active) */}
        <button 
          onClick={() => setCurrentApp(AppView.SPLITTER)}
          className="group relative aspect-square bg-stone-900 border border-white/10 rounded-lg flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-prowess-red hover:shadow-[0_0_30px_-5px_rgba(200,62,54,0.3)]"
        >
          <div className="w-20 h-20 bg-prowess-red rounded-sm flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
             <div className="font-serif text-5xl text-stone-200 font-light flex items-center justify-center h-full pb-1">
               $
               {/* Stylized I overlay for logic like the logo in image */}
               <div className="absolute h-14 w-1 bg-stone-200/40 rounded-full" />
             </div>
          </div>
          <span className="font-serif text-lg text-stone-300 group-hover:text-white transition-colors">Splitter</span>
        </button>

        {/* Suggest Card (Inactive) */}
        <div className="aspect-square bg-stone-900/50 border border-white/5 rounded-lg flex flex-col items-center justify-center gap-4 opacity-60 cursor-not-allowed">
           <div className="w-20 h-20 bg-stone-800 rounded-sm flex items-center justify-center">
             <Plus size={32} className="text-stone-600" />
           </div>
           <span className="font-serif text-lg text-stone-600">Suggest</span>
        </div>

      </div>

      <div className="absolute bottom-8 text-xs text-stone-600 font-sans tracking-widest uppercase opacity-50">
        Internal & External Use
      </div>

    </div>
  );
}

export default App;