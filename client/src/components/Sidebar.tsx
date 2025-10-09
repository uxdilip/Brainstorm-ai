import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { Sparkles, Search, Layers, FileText, Download, X, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const Sidebar = () => {
    const { suggestions, summary, clusterCards, summarizeBoard, searchCards, loading, createCard, columns, clusters } = useBoard();
    const [activeTab, setActiveTab] = useState<'suggestions' | 'summary' | 'search'>('suggestions');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [clusterThreshold, setClusterThreshold] = useState(0.3);

    const handleCluster = async () => {
        await clusterCards(clusterThreshold);
    };

    const handleSummarize = async () => {
        await summarizeBoard();
        setActiveTab('summary');
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        console.log('🔍 Searching for:', searchQuery);

        try {
            const results = await searchCards(searchQuery);
            console.log('✅ Search results:', results);
            setSearchResults(results);
        } catch (error) {
            console.error('❌ Search failed:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
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
                className="fixed right-2 sm:right-4 bottom-4 lg:top-20 lg:bottom-auto bg-white text-[#2383e2] shadow-lg p-2.5 sm:p-3 rounded-lg hover:shadow-xl transition-all z-10 border border-[#e9e9e7]"
            >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        );
    }

    return (
        <div className="fixed lg:relative bottom-0 left-0 right-0 lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-[#e9e9e7] flex flex-col overflow-hidden shadow-lg z-20 h-[60vh] lg:h-auto">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#e9e9e7] lg:border-b-0">
                <h2 className="text-base sm:text-lg font-semibold text-[#37352f] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#2383e2]" />
                    AI Assistant
                </h2>
                <button
                    onClick={() => setShowSidebar(false)}
                    className="text-[#9b9a97] hover:bg-[#f1f1ef] p-1.5 rounded-md transition-colors"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 px-3 sm:px-4 pt-2 lg:pt-0">
                <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md transition-colors text-xs sm:text-sm font-medium ${activeTab === 'suggestions' ? 'bg-[#e5f2ff] text-[#2383e2]' : 'bg-[#f7f6f3] text-[#787774] hover:bg-[#f1f1ef]'
                        }`}
                >
                    Ideas
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md transition-colors text-xs sm:text-sm font-medium ${activeTab === 'summary' ? 'bg-[#e5f2ff] text-[#2383e2]' : 'bg-[#f7f6f3] text-[#787774] hover:bg-[#f1f1ef]'
                        }`}
                >
                    Summary
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md transition-colors text-xs sm:text-sm font-medium ${activeTab === 'search' ? 'bg-[#e5f2ff] text-[#2383e2]' : 'bg-[#f7f6f3] text-[#787774] hover:bg-[#f1f1ef]'
                        }`}
                >
                    Search
                </button>
            </div>

            <div className="mb-3 sm:mb-4 space-y-2 px-3 sm:px-4">
                <div className="flex gap-2">
                    <button
                        onClick={handleCluster}
                        disabled={loading}
                        className="flex-1 bg-[#f7f6f3] text-[#37352f] py-1.5 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-[#f1f1ef] transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium disabled:opacity-50 border border-[#e9e9e7]"
                    >
                        <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Cluster</span>
                    </button>
                    <button
                        onClick={handleSummarize}
                        disabled={loading}
                        className="flex-1 bg-[#f7f6f3] text-[#37352f] py-1.5 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-[#f1f1ef] transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium disabled:opacity-50 border border-[#e9e9e7]"
                    >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Summarize</span>
                    </button>
                    <button
                        onClick={exportMarkdown}
                        disabled={!summary}
                        className="bg-[#f7f6f3] text-[#37352f] py-1.5 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-[#f1f1ef] transition-colors disabled:opacity-50 border border-[#e9e9e7]"
                    >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                </div>

                {/* Cluster Threshold Slider */}
                <div className="bg-[#f7f6f3] rounded-lg p-3 border border-[#e9e9e7]">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[#37352f] text-xs font-medium">Similarity Threshold</label>
                        <span className="text-[#787774] text-xs bg-white px-2 py-0.5 rounded border border-[#e9e9e7]">{clusterThreshold.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="0.2"
                        max="0.95"
                        step="0.05"
                        value={clusterThreshold}
                        onChange={(e) => setClusterThreshold(parseFloat(e.target.value))}
                        className="w-full h-2 bg-[#e9e9e7] rounded-lg appearance-none cursor-pointer accent-[#2383e2]"
                    />
                    <div className="flex justify-between text-[#9b9a97] text-xs mt-1">
                        <span>Loose</span>
                        <span>Tight</span>
                    </div>
                </div>

                {/* Cluster Info */}
                {clusters && clusters.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-[#37352f] text-xs">
                            🎯 Found <strong>{clusters.length}</strong> cluster{clusters.length > 1 ? 's' : ''} of similar ideas!
                        </p>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-3 sm:px-4">
                {activeTab === 'suggestions' && (
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <h3 className="text-[#37352f] font-semibold text-xs sm:text-sm">💡 AI Suggestions</h3>
                            {suggestions.length > 0 && (
                                <span className="text-xs text-[#787774] bg-[#f7f6f3] px-2 py-1 rounded border border-[#e9e9e7]">
                                    {suggestions.length} ideas
                                </span>
                            )}
                        </div>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-2">
                                <Loader className="w-5 h-5 sm:w-6 sm:h-6 text-[#2383e2] animate-spin" />
                                <p className="text-[#787774] text-xs sm:text-sm">Generating creative suggestions...</p>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="bg-[#f7f6f3] rounded-lg p-3 sm:p-4 text-center border border-[#e9e9e7]">
                                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#9b9a97] mx-auto mb-2" />
                                <p className="text-[#787774] text-xs sm:text-sm">
                                    Add a new card to get AI-powered idea suggestions!
                                </p>
                                <p className="text-[#9b9a97] text-xs mt-2">
                                    I'll analyze your idea and suggest 3 related concepts
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                                    <p className="text-[#37352f] text-xs">
                                        💡 Click "Add to Board" to quickly create a card from any suggestion
                                    </p>
                                </div>
                                {suggestions.map((suggestion, index) => (
                                    <div key={index} className="bg-white rounded-lg p-2 sm:p-3 hover:shadow-md transition-all border border-[#e9e9e7]">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="text-[#2383e2] font-bold text-xs sm:text-sm">{index + 1}.</span>
                                            <p className="text-[#37352f] text-xs sm:text-sm flex-1">{suggestion}</p>
                                        </div>
                                        <button
                                            onClick={() => addSuggestion(suggestion)}
                                            className="w-full text-xs bg-[#2383e2] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-[#1a73cf] transition-colors font-medium flex items-center justify-center gap-1"
                                        >
                                            <span>+</span> Add to Board
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[#37352f] font-semibold text-xs sm:text-sm">Board Summary</h3>
                            {summary && (
                                <button
                                    onClick={exportMarkdown}
                                    className="text-[#787774] hover:text-[#37352f] text-xs flex items-center gap-1"
                                >
                                    <Download className="w-3 h-3" />
                                    Export
                                </button>
                            )}
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-6 sm:py-8 bg-[#f7f6f3] rounded-lg border border-[#e9e9e7]">
                                <Loader className="w-5 h-5 sm:w-6 sm:h-6 text-[#2383e2] animate-spin" />
                            </div>
                        ) : summary ? (
                            <div className="bg-[#f7f6f3] rounded-lg p-3 sm:p-4 max-h-[calc(60vh-200px)] lg:max-h-[calc(100vh-300px)] overflow-y-auto border border-[#e9e9e7]">
                                <div className="text-[#37352f] text-xs sm:text-sm prose max-w-none prose-headings:text-[#37352f] prose-strong:text-[#37352f] prose-p:text-[#37352f] prose-li:text-[#37352f]">
                                    <ReactMarkdown
                                        components={{
                                            h2: ({ node, ...props }) => <h2 className="text-sm sm:text-base font-bold mt-3 sm:mt-4 mb-1 sm:mb-2 first:mt-0 text-[#37352f]" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xs sm:text-sm font-semibold mt-2 sm:mt-3 mb-1 text-[#37352f]" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="space-y-1 mb-2 sm:mb-3" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="space-y-1 mb-2 sm:mb-3" {...props} />,
                                            li: ({ node, ...props }) => <li className="text-[#37352f]" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-1 sm:mb-2 text-[#37352f]" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-[#37352f] font-semibold" {...props} />,
                                            hr: ({ node, ...props }) => <hr className="border-[#e9e9e7] my-3 sm:my-4" {...props} />,
                                        }}
                                    >
                                        {summary}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#f7f6f3] rounded-lg p-4 sm:p-6 text-center border border-[#e9e9e7]">
                                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-[#9b9a97] mx-auto mb-2 sm:mb-3" />
                                <p className="text-[#787774] text-xs sm:text-sm">Click 'Summarize' to generate an AI-powered analysis of your board</p>
                                <p className="text-[#9b9a97] text-xs mt-2">Get key themes, top ideas, and next steps</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className="space-y-2 sm:space-y-3">
                        <h3 className="text-[#37352f] font-semibold mb-2 text-xs sm:text-sm">Semantic Search</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search ideas..."
                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-white border border-[#e9e9e7] text-[#37352f] placeholder-[#9b9a97] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] text-xs sm:text-sm transition-all"
                                disabled={searching}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={searching || !searchQuery.trim()}
                                className="bg-[#2383e2] text-white p-1.5 sm:p-2 rounded-md hover:bg-[#1a73cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {searching ? (
                                    <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </button>
                        </div>

                        {/* Search Results */}
                        <div className="space-y-2 mt-3 sm:mt-4">
                            {searching ? (
                                <div className="flex items-center justify-center py-6 sm:py-8 text-[#787774]">
                                    <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2 text-[#2383e2]" />
                                    <span className="text-xs sm:text-sm">Searching...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <>
                                    <div className="text-[#787774] text-xs mb-2">
                                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                                    </div>
                                    {searchResults.map((card) => (
                                        <div key={card._id} className="bg-white rounded-lg p-2 sm:p-3 hover:shadow-md transition-all border border-[#e9e9e7]">
                                            <h4 className="text-[#37352f] font-medium text-xs sm:text-sm">{card.title}</h4>
                                            {card.description && (
                                                <p className="text-[#787774] text-xs mt-1 line-clamp-2">{card.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            ) : searchQuery && !searching ? (
                                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-[#9b9a97] text-center">
                                    <Search className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 opacity-50" />
                                    <p className="text-xs sm:text-sm">No matching cards found</p>
                                    <p className="text-xs mt-1">Try different keywords</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-[#9b9a97] text-center">
                                    <Search className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 opacity-50" />
                                    <p className="text-xs sm:text-sm">Enter a search query</p>
                                    <p className="text-xs mt-1">Find cards by meaning, not just keywords</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
