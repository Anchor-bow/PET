import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export function DashboardPage() {
  const { apps, loadApps, createApp, deleteApp, isLoading, error } = useAppStore();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleCreate = async () => {
    setIsCreating(true);
    setActionError(null);
    try {
      const app = await createApp('Neue App');
      navigate(`/editor/${app.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'App konnte nicht erstellt werden.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`App "${name}" wirklich löschen?`)) return;
    setActionError(null);
    try {
      await deleteApp(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'App konnte nicht gelöscht werden.');
    }
  };

  return (
    <section>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Übersicht deiner Apps.</p>
        <button type="button" onClick={handleCreate} disabled={isCreating}>
          {isCreating ? 'Erstelle…' : 'Neue App'}
        </button>
      </header>

      {isLoading && <p>Lade…</p>}
      {error && <p className="error">{error}</p>}
      {actionError && <p className="error">{actionError}</p>}

      <ul className="app-list">
        {apps.length === 0 && !isLoading && <li className="empty">Noch keine Apps vorhanden.</li>}
        {apps.map((app) => (
          <li key={app.id} className="app-card">
            <div className="app-card-info">
              <Link to={`/editor/${app.id}`}>
                <strong>{app.name}</strong>
              </Link>
              <span className="app-card-id">{app.id.slice(0, 6)}</span>
            </div>
            <div className="app-card-actions">
              <span className="app-card-version">v{app.version}</span>
              <button type="button" onClick={() => handleDelete(app.id, app.name)}>
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
