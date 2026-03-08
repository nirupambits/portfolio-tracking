import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { subscribeUser, getAllSubscriptions } from './src/db';
import cron from 'node-cron';
import { Resend } from 'resend';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/subscribe', (req, res) => {
    const { email, tickers } = req.body;
    if (!email || !tickers || !Array.isArray(tickers)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
      subscribeUser(email, tickers);
      res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
      console.error('Error subscribing user:', error);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  });

  app.post('/api/test-email', async (req, res) => {
    try {
      // Run the job in the background so we don't block the response for too long
      runEmailJob();
      res.json({ success: true, message: 'Email job triggered successfully' });
    } catch (error) {
      console.error('Error triggering email job:', error);
      res.status(500).json({ error: 'Failed to trigger email job' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    setupCronJob();
  });
}

function setupCronJob() {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', runEmailJob);
}

async function runEmailJob() {
  console.log('Running daily portfolio email job...');
  const subscriptions = getAllSubscriptions();
  
  let resendClient: Resend | null = null;
  if (process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  } else {
    console.warn('RESEND_API_KEY is not set. Emails will not be sent, but the job will run.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  for (const sub of subscriptions) {
    try {
      const tickers = JSON.parse(sub.tickers) as string[];
      if (tickers.length === 0) continue;

      // Fetch insights
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze the following stock tickers: ${tickers.join(', ')}.
        For each ticker, find the latest analyst ratings, target prices, and today's top news headline.
        Based on this data, provide a Sentiment Score (0-100) and a TPM Recommendation (Buy/Hold/Sell/Trim).
        
        You MUST return the result as a raw JSON array of objects. Do not include markdown formatting like \`\`\`json.
        Each object must have these exact keys:
        - ticker (string)
        - analystRatings (string)
        - targetPrice (string)
        - topHeadline (string)
        - sentimentScore (number)
        - recommendation (string: "Buy", "Hold", "Sell", or "Trim")
        - reasoning (string: brief explanation of the recommendation)
        `,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
        },
      });

      if (!response.text) throw new Error('No response from Gemini');
      
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Failed to parse analysis results');
      
      const insights = JSON.parse(jsonMatch[0]);

      // Generate email HTML
      const html = generateEmailHtml(insights);

      if (resendClient) {
        const { data, error } = await resendClient.emails.send({
          from: 'Portfolio Pulse <onboarding@resend.dev>',
          to: sub.email,
          subject: 'Your Daily Portfolio Pulse Insights',
          html: html,
        });
        
        if (error) {
          console.error(`Resend API Error for ${sub.email}:`, error);
        } else {
          console.log(`Successfully sent email to ${sub.email}. Resend ID:`, data?.id);
        }
      } else {
        console.log(`Would send email to ${sub.email} with ${insights.length} insights.`);
      }
    } catch (error) {
      console.error(`Error processing subscription for ${sub.email}:`, error);
    }
  }
}

function generateEmailHtml(insights: any[]) {
  let html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f5; color: #18181b;">
      <h1 style="color: #10b981; margin-bottom: 24px;">Portfolio Pulse Daily Insights</h1>
  `;

  for (const insight of insights) {
    html += `
      <div style="background-color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e4e4e7;">
        <h2 style="margin: 0 0 8px 0; font-size: 20px;">${insight.ticker} - ${insight.recommendation}</h2>
        <p style="margin: 0 0 4px 0;"><strong>Sentiment Score:</strong> ${insight.sentimentScore}/100</p>
        <p style="margin: 0 0 4px 0;"><strong>Target Price:</strong> ${insight.targetPrice}</p>
        <p style="margin: 0 0 4px 0;"><strong>Analyst Ratings:</strong> ${insight.analystRatings}</p>
        <div style="margin-top: 12px; padding: 12px; background-color: #f4f4f5; border-radius: 6px;">
          <p style="margin: 0 0 8px 0; font-weight: bold;">Top Headline:</p>
          <p style="margin: 0;">"${insight.topHeadline}"</p>
        </div>
        <p style="margin: 12px 0 0 0; color: #52525b;">${insight.reasoning}</p>
      </div>
    `;
  }

  html += `
      <p style="font-size: 12px; color: #a1a1aa; margin-top: 24px; text-align: center;">
        You are receiving this because you subscribed to daily updates on Portfolio Pulse.
      </p>
    </div>
  `;

  return html;
}

startServer();
