import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { Sparkles, Search, Layers, FileText, Download, X, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const Sidebar = () => {
  const { suggestions, summary, clusterCards, summarizeBoard, searchCards, loading, createCard, columns } = useBoard();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'summary' | 'search'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleCluster = async () => {
    await clusterCards(0.7);
  };

  const handleSummarize = async () => {
    await summarizeBoard();
    setActiveTab('summary');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchCards(searchQuery);
    setSearchResults(results);
  };

  const addSuggestion = async (suggestion: string) => {
    if (columns.length > 0) {
      await createCard(columns[0]._id, suggestion, '');
    }
  };

  const exportMarkdown = () => {
    const markdown = `# Board Summary\n\n${summary}\n\n## Suggestions\n\n${suggestions.map(s => `- ${s}`).join('\n')}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'board-export.md';
    a.click();
  };

  if (!showSidebar) {
    return (
      <button
        onClick={() => setShowSidebar(true)}
        className="fixed right-4 top-20 bg-white/10 backdrop-blur-md text-white p-3 rounded-lg hover:bg-white/20 transition-colors z-10"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="w-96 bg-white/10 backdrop-blur-md border-l border-white/20 p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          AI Assistant
        </h2>
        <button
          onClick={() => setShowSidebar(false)}
          className="text-white hover:bg-white/20 p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm ${
            activeTab === 'suggestions' ? 'bg-white text-primary-600 font-semibold' : 'bg-white/20 text-white'
          }`}
        >
          Ideas
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm ${
            activeTab === 'summary' ? 'bg-white text-primary-600 font-semibold' : 'bg-white/20 text-white'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm ${
            activeTab === 'search' ? 'bg-white text-primary-600 font-semibold' : 'bg-white/20 text-white'
          }`}
        >
          Search
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleCluster}
          disabled={loading}
          className="flex-1 bg-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Layers className="w-4 h-4" />
          Cluster
        </button>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="flex-1 bg-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          Summarize
        </button>
        <button
          onClick={exportMarkdown}
          disabled={!summary}
          className="bg-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-2">AI Suggestions</h3>
            {suggestions.length === 0 ? (
              <p className="text-white/70 text-sm">Add a new card to get AI-powered idea suggestions!</p>
            ) : (
              suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white/20 rounded-lg p-3">
                  <p className="text-white text-sm mb-2">{suggestion}</p>
                  <button
                    onClick={() => addSuggestion(suggestion)}
                    className="text-xs bg-white text-primary-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    Add to Board
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Board Summary</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-white animate-spin" />
              </div>
            ) : summary ? (
              <div className="text-white text-sm prose prose-invert max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-white/70 text-sm">Click 'Summarize' to generate an AI summary of your board</p>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-2">Semantic Search</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search ideas..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={handleSearch}
                className="bg-white text-primary-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 mt-4">
              {searchResults.map((card) => (
                <div key={card._id} className="bg-white/20 rounded-lg p-3">
                  <h4 className="text-white font-medium text-sm">{card.title}</h4>
                  {card.description && (
                    <p className="text-white/70 text-xs mt-1">{card.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
