import Database from 'better-sqlite3';

const db = new Database('portfolio.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    tickers TEXT NOT NULL, -- JSON array of strings
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Subscription {
  id: number;
  email: string;
  tickers: string;
  createdAt: string;
}

export function subscribeUser(email: string, tickers: string[]) {
  const stmt = db.prepare('INSERT INTO subscriptions (email, tickers) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET tickers = excluded.tickers');
  stmt.run(email, JSON.stringify(tickers));
}

export function getAllSubscriptions(): Subscription[] {
  const stmt = db.prepare('SELECT * FROM subscriptions');
  return stmt.all() as Subscription[];
}

export function unsubscribeUser(email: string) {
  const stmt = db.prepare('DELETE FROM subscriptions WHERE email = ?');
  stmt.run(email);
}
