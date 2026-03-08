import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface SubscribeFormProps {
  tickers: string[];
}

export default function SubscribeForm({ tickers }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || tickers.length === 0) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, tickers }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Successfully subscribed to daily updates!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while subscribing');
    }
  };

  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTestEmail = async () => {
    setTestStatus('loading');
    try {
      const response = await fetch('/api/test-email', { method: 'POST' });
      if (response.ok) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      setTestStatus('error');
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mt-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Get Daily Portfolio Updates</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Subscribe to receive a daily email with the latest insights, ratings, and news for your portfolio.
              </p>
            </div>
            {status === 'success' && (
              <button
                onClick={handleTestEmail}
                disabled={testStatus === 'loading'}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
              >
                {testStatus === 'loading' ? 'Sending...' : testStatus === 'success' ? 'Sent!' : 'Test Email Now'}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success' || !email}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {status === 'success' && (
            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              {message}
            </div>
          )}

          {status === 'error' && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
