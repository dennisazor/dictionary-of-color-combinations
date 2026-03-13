import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { BookView } from './components/BookView';
import { Randomizer } from './components/Randomizer';
import { ColorPicker } from './components/ColorPicker';

type View = 'book' | 'randomizer' | 'picker';

function App() {
  const [currentView, setCurrentView] = useState<View>('randomizer');

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1">
        {currentView === 'book' && <BookView />}
        {currentView === 'randomizer' && <Randomizer />}
        {currentView === 'picker' && <ColorPicker />}
      </main>
      <footer className="border-t border-stone-200 py-4 text-center">
        <p className="text-xs text-stone-400">
          Based on <em className="font-serif">A Dictionary of Colour Combinations</em> by Sanzo Wada (1883–1967)
          &nbsp;·&nbsp; Published by Seigensha Art
        </p>
        <p className="text-[10px] text-stone-300 mt-1">
          Built by <a href="https://github.com/dennisazor" className="underline hover:text-stone-500 transition-colors" target="_blank" rel="noopener noreferrer">Dennis Azor</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
