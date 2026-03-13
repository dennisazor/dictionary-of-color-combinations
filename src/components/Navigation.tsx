type View = 'book' | 'randomizer' | 'picker';

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: Props) {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <h1 className="text-base font-serif font-semibold text-stone-800 hidden sm:block">
            A Dictionary of Color Combinations
          </h1>
          <h1 className="text-base font-serif font-semibold text-stone-800 sm:hidden">
            Color Dict
          </h1>
        </div>

        {/* View tabs */}
        <nav className="flex gap-1">
          <button
            type="button"
            className={`nav-tab ${currentView === 'randomizer' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
            onClick={() => onViewChange('randomizer')}
          >
            <span className="hidden sm:inline">🎲 </span>Random
          </button>
          <button
            type="button"
            className={`nav-tab ${currentView === 'picker' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
            onClick={() => onViewChange('picker')}
          >
            <span className="hidden sm:inline">🎨 </span>Picker
          </button>
          <button
            type="button"
            className={`nav-tab ${currentView === 'book' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
            onClick={() => onViewChange('book')}
          >
            <span className="hidden sm:inline">📖 </span>Book
          </button>
        </nav>
      </div>
    </header>
  );
}
