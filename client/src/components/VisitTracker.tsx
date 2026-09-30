import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSessionId } from '../lib/sessionId';

const FLAGGED_KEY = 'oxyfinds_visit_sent';

/** Records one visit per browser session for the admin dashboard. */
export function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem(FLAGGED_KEY)) return;

    const sessionId = getSessionId();
    void fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, path: location.pathname }),
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(FLAGGED_KEY, '1');
      })
      .catch(() => {});
  }, [location.pathname]);

  return null;
}
