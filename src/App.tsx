import React, { useState } from 'react';
import { Activity, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import PortfolioInput from './components/PortfolioInput';
import PortfolioTable from './components/PortfolioTable';
import InsightCards from './components/InsightCards';
import SubscribeForm from './components/SubscribeForm';
import { extractPortfolioData, extractPortfolioFromText, analyzeTickers } from './lib/gemini';
import { PortfolioItem, InsightData } from './types';

export default function App() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setIsExtracting(true);
    setError(null);
    setInsights([]); // Clear previous insights
    try {
      const extractedData = await extractPortfolioData(base64, mimeType);
      const itemsWithIds = extractedData.map(item => ({
        ...item,
        id: crypto.randomUUID()
      }));
      setItems(itemsWithIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data from image');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setIsExtracting(true);
    setError(null);
    setInsights([]); // Clear previous insights
    try {
      const extractedData = await extractPortfolioFromText(text);
      const itemsWithIds = extractedData.map(item => ({
        ...item,
        id: crypto.randomUUID()
      }));
      setItems(itemsWithIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data from text');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateItem = (id: string, field: keyof PortfolioItem, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAnalyze = async () => {
    const validTickers = items
      .map(item => item.ticker.trim().toUpperCase())
      .filter(ticker => ticker.length >= 2 && ticker.length <= 5 && /^[A-Z]+$/.test(ticker));

    if (validTickers.length === 0) {
      setError('No valid tickers found to analyze. Please check your portfolio table.');
      return;
    }

    // Deduplicate tickers
    const uniqueTickers = [...new Set(validTickers)];

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysisResults = await analyzeTickers(uniqueTickers);
      setInsights(analysisResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze tickers');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Portfolio Pulse</h1>
          </div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            AI Market Intelligence
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-red-200 text-sm">{error}</div>
          </div>
        )}

        {/* Section 1: Capture */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">1</span>
              Capture Portfolio
            </h2>
          </div>
          <PortfolioInput 
            onImageSelected={handleImageSelected} 
            onTextSubmit={handleTextSubmit}
            isLoading={isExtracting} 
          />
        </section>

        {/* Section 2: Verify & Edit */}
        {items.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">2</span>
                Verify Holdings
              </h2>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Market...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analyze with Google Search
                  </>
                )}
              </button>
            </div>
            <PortfolioTable 
              items={items} 
              onUpdateItem={handleUpdateItem} 
              onRemoveItem={handleRemoveItem} 
            />
          </section>
        )}

        {/* Section 3: Insights */}
        {insights.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">3</span>
                Market Insights
              </h2>
            </div>
            <InsightCards insights={insights} />
            
            <SubscribeForm 
              tickers={[...new Set(items.map(item => item.ticker.trim().toUpperCase()).filter(ticker => ticker.length >= 2 && ticker.length <= 5 && /^[A-Z]+$/.test(ticker)))]} 
            />
          </section>
        )}
      </main>
    </div>
  );
}
