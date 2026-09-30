import { useCallback, useEffect, useState } from 'react';
import type { AdminStatsResponse } from '../lib/api';

const STORAGE_KEY = 'oxyfinds_admin_key';

function countryLabel(code: string): string {
  if (code === 'LOCAL') return 'Local / dev';
  if (code === 'XX') return 'Unknown';
  return code;
}

export function AdminPage() {
  const [key, setKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '');
  const [input, setInput] = useState('');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (adminKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'X-Admin-Key': adminKey },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setStats(body as AdminStatsResponse);
      sessionStorage.setItem(STORAGE_KEY, adminKey);
      setKey(adminKey);
    } catch (e) {
      setStats(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) void load(stored);
  }, [load]);

  function onLogin(e: React.FormEvent) {
    e.preventDefault();
    void load(input.trim());
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setKey('');
    setStats(null);
    setInput('');
  }

  if (!key || !stats) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-frost">Admin</h1>
        <p className="mt-2 text-sm text-mist">Visitor counts and country breakdown.</p>
        <form onSubmit={onLogin} className="card mt-6 space-y-4 p-5">
          <label className="block text-sm text-mist">
            Admin password
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input mt-1.5"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-warn">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading || !input.trim()}>
            {loading ? 'Loading…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-frost">Visitor dashboard</h1>
          <p className="mt-1 text-sm text-mist">Unique sessions and country tags</p>
        </div>
        <button type="button" onClick={() => void load(key)} className="btn-secondary" disabled={loading}>
          Refresh
        </button>
        <button type="button" onClick={logout} className="text-sm text-subtle hover:text-frost">
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-subtle">Unique visitors</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-brand">
            {stats.uniqueVisitors.toLocaleString()}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-subtle">Total sessions recorded</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-frost">
            {stats.totalVisits.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-semibold text-frost">By country</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-subtle">
              <th className="px-4 py-2 font-medium">Country</th>
              <th className="px-4 py-2 font-medium">Visitors</th>
              <th className="px-4 py-2 font-medium">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {stats.byCountry.map((row) => (
              <tr key={row.country} className="border-b border-line/50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-frost">{countryLabel(row.country)}</td>
                <td className="px-4 py-2.5 tabular-nums text-mist">{row.uniqueVisitors}</td>
                <td className="px-4 py-2.5 tabular-nums text-mist">{row.visits}</td>
              </tr>
            ))}
            {stats.byCountry.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-mist">No visits yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-semibold text-frost">Recent entries</h2>
        </div>
        <ul className="divide-y divide-line/50">
          {stats.recent.map((v) => (
            <li key={v._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <span className="rounded-md bg-raised px-2 py-0.5 font-medium text-brand">
                {countryLabel(v.country)}
              </span>
              <span className="text-mist">{v.path}</span>
              <time className="text-xs text-subtle">
                {new Date(v.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
