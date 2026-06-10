import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RuntimeRenderer } from '@pet/runtime';
import type { StoredApp } from '@pet/types';
import { fetchApp } from '../api/apps';

export function PreviewPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<StoredApp | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchApp(appId)
      .then(setApp)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'App konnte nicht geladen werden.');
      });
  }, [appId, navigate]);

  if (error) {
    return (
      <section className="preview-page">
        <header className="preview-page__header">
          <button type="button" onClick={() => navigate('/dashboard')}>
            ← Zurück zum Dashboard
          </button>
          <h1>Fehler</h1>
        </header>
        <p className="preview-page__error">{error}</p>
      </section>
    );
  }

  if (!app) {
    return (
      <section className="preview-page">
        <p className="preview-page__loading">Lade App…</p>
      </section>
    );
  }

  return (
    <section className="preview-page">
      <header className="preview-page__header">
        <button type="button" onClick={() => navigate('/dashboard')}>
          ← Zurück
        </button>
        <h1>{app.schema.name}</h1>
        <span className="preview-page__badge">Vorschau</span>
      </header>
      <div className="preview-page__content">
        <RuntimeRenderer app={app.schema} />
      </div>
    </section>
  );
}
