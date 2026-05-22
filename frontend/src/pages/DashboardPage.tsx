import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function DashboardPage() {
  const { apps, loadApps, isLoading, error } = useAppStore();

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return (
    <section>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Übersicht deiner Apps. CRUD folgt in Phase 5.</p>
      </header>

      {isLoading && <p>Lade…</p>}
      {error && <p className="error">{error}</p>}

      <ul className="app-list">
        {apps.length === 0 && !isLoading && <li className="empty">Noch keine Apps vorhanden.</li>}
        {apps.map((app) => (
          <li key={app.id} className="app-card">
            <strong>{app.name}</strong>
            <span>v{app.version}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
