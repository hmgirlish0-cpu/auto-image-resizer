import { useStore } from './store';
import { UploadView } from './components/UploadView';
import { ConfigView } from './components/ConfigView';
import { ResultsView } from './components/ResultsView';

function App() {
  const currentView = useStore((state) => state.currentView);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {currentView === 'upload' && <UploadView />}
        {currentView === 'config' && <ConfigView />}
        {currentView === 'results' && <ResultsView />}
      </div>
    </div>
  );
}

export default App;
