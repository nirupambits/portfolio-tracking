import React from 'react';
import { PortfolioItem } from '../types';
import { AlertCircle, Trash2 } from 'lucide-react';

interface PortfolioTableProps {
  items: PortfolioItem[];
  onUpdateItem: (id: string, field: keyof PortfolioItem, value: string | number) => void;
  onRemoveItem: (id: string) => void;
}

export default function PortfolioTable({ items, onUpdateItem, onRemoveItem }: PortfolioTableProps) {
  const isTickerValid = (ticker: string) => {
    const t = ticker.trim();
    return t.length >= 2 && t.length <= 5 && /^[A-Za-z]+$/.test(t);
  };

  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
          <tr>
            <th className="px-4 py-3 font-medium">Holding Name</th>
            <th className="px-4 py-3 font-medium">Ticker</th>
            <th className="px-4 py-3 font-medium text-right">Shares</th>
            <th className="px-4 py-3 font-medium text-right">Current Value</th>
            <th className="px-4 py-3 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {items.map((item) => {
            const tickerValid = isTickerValid(item.ticker);
            
            return (
              <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.holdingName}
                    onChange={(e) => onUpdateItem(item.id, 'holdingName', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 text-zinc-200"
                  />
                </td>
                <td className="px-4 py-2 relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.ticker}
                      onChange={(e) => onUpdateItem(item.id, 'ticker', e.target.value.toUpperCase())}
                      className={`w-24 bg-transparent border focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 font-mono uppercase ${
                        !tickerValid 
                          ? 'border-amber-500/50 text-amber-400 focus:border-amber-500' 
                          : 'border-transparent text-emerald-400 hover:border-zinc-700'
                      }`}
                    />
                    {!tickerValid && (
                      <div className="group/tooltip relative flex items-center">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-xs text-zinc-300 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                          Ticker should be 2-5 letters
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.shares}
                    onChange={(e) => onUpdateItem(item.id, 'shares', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 text-zinc-200 text-right font-mono"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end">
                    <span className="text-zinc-500 mr-1">$</span>
                    <input
                      type="number"
                      value={item.currentValue}
                      onChange={(e) => onUpdateItem(item.id, 'currentValue', parseFloat(e.target.value) || 0)}
                      className="w-28 bg-transparent border-none focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 text-zinc-200 text-right font-mono"
                    />
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
