import React from 'react';
import { InsightData } from '../types';
import { TrendingUp, TrendingDown, Minus, Activity, Target, Newspaper } from 'lucide-react';

interface InsightCardsProps {
  insights: InsightData[];
}

export default function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null;

  const getRecommendationColor = (rec: string) => {
    switch (rec.toLowerCase()) {
      case 'buy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'sell': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'trim': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hold':
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec.toLowerCase()) {
      case 'buy': return <TrendingUp className="w-4 h-4" />;
      case 'sell': return <TrendingDown className="w-4 h-4" />;
      case 'trim': return <TrendingDown className="w-4 h-4" />;
      case 'hold':
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score <= 40) return 'text-red-400';
    return 'text-amber-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight) => (
        <div key={insight.ticker} className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800/50 flex justify-between items-start bg-zinc-900/40">
            <div>
              <h3 className="text-xl font-bold text-zinc-100 font-mono tracking-tight">{insight.ticker}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRecommendationColor(insight.recommendation)}`}>
                  {getRecommendationIcon(insight.recommendation)}
                  {insight.recommendation.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Sentiment</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-mono ${getSentimentColor(insight.sentimentScore)}`}>
                  {insight.sentimentScore}
                </span>
                <span className="text-zinc-500 text-xs">/100</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  Ratings
                </div>
                <div className="text-sm text-zinc-200 font-medium">{insight.analystRatings}</div>
              </div>
              <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">
                  <Target className="w-3.5 h-3.5" />
                  Target
                </div>
                <div className="text-sm text-zinc-200 font-medium">{insight.targetPrice}</div>
              </div>
            </div>

            <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1.5">
                <Newspaper className="w-3.5 h-3.5" />
                Top Headline
              </div>
              <p className="text-sm text-zinc-300 leading-snug line-clamp-2" title={insight.topHeadline}>
                "{insight.topHeadline}"
              </p>
            </div>

            <div className="mt-auto pt-2">
              <p className="text-sm text-zinc-400 leading-relaxed">
                <span className="text-zinc-500 font-semibold mr-1">Reasoning:</span>
                {insight.reasoning}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
