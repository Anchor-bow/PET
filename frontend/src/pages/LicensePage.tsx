import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface License {
  id: string;
  key: string;
  appId: string;
  customer: string | null;
  maxUsers: number;
  usedCount: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  expiresAt: string | null;
  createdAt: string;
  _count?: { consumptions: number };
}

interface AppSummary {
  id: string;
  name: string;
}

export function LicensePage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createAppId, setCreateAppId] = useState('');
  const [createCustomer, setCreateCustomer] = useState('');
  const [createMaxUsers, setCreateMaxUsers] = useState(1);
  const [createExpiresAt, setCreateExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadApps = useCallback(async () => {
    try {
      const { data } = await apiClient.get<AppSummary[]>('/apps');
      setApps(data);
    } catch { /* ignore */ }
  }, []);

  const loadLicenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<License[]>('/licenses');
      setLicenses(data);
    } catch {
      setError('Lizenzen konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
    loadLicenses();
  }, [loadApps, loadLicenses]);

  const handleCreate = async () => {
    if (!createAppId) return;
    setIsCreating(true);
    try {
      await apiClient.post('/licenses', {
        appId: createAppId,
        customer: createCustomer || undefined,
        maxUsers: createMaxUsers,
        expiresAt: createExpiresAt || undefined,
      });
      setShowCreate(false);
      setCreateAppId('');
      setCreateCustomer('');
      setCreateMaxUsers(1);
      setCreateExpiresAt('');
      await loadLicenses();
    } catch {
      alert('Lizenz konnte nicht erstellt werden.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Lizenz wirklich widerrufen?')) return;
    try {
      await apiClient.patch(`/licenses/${id}`, { status: 'REVOKED' });
      await loadLicenses();
    } catch {
      alert('Lizenz konnte nicht widerrufen werden.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Lizenz wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.')) return;
    try {
      await apiClient.delete(`/licenses/${id}`);
      await loadLicenses();
    } catch {
      alert('Lizenz konnte nicht gelöscht werden.');
    }
  };

  const statusLabel: Record<string, string> = {
    ACTIVE: 'Aktiv',
    REVOKED: 'Widerrufen',
    EXPIRED: 'Abgelaufen',
  };

  const statusClass: Record<string, string> = {
    ACTIVE: 'license-status--active',
    REVOKED: 'license-status--revoked',
    EXPIRED: 'license-status--expired',
  };

  return (
    <section>
      <header className="page-header">
        <h1>Lizenzen</h1>
        <p>Verwalte Lizenz-Keys für deine Apps.</p>
        <button type="button" onClick={() => setShowCreate(true)}>
          Neue Lizenz
        </button>
      </header>

      {showCreate && (
        <div className="panel">
          <h3>Neue Lizenz erstellen</h3>
          <div className="form-row">
            <label>App *</label>
            <select value={createAppId} onChange={(e) => setCreateAppId(e.target.value)}>
              <option value="">— App wählen —</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.id.slice(0, 6)})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Kunde</label>
            <input
              type="text"
              value={createCustomer}
              onChange={(e) => setCreateCustomer(e.target.value)}
              placeholder="Kundenname (optional)"
            />
          </div>
          <div className="form-row">
            <label>Max. Nutzer</label>
            <input
              type="number"
              min={1}
              value={createMaxUsers}
              onChange={(e) => setCreateMaxUsers(Number(e.target.value))}
            />
          </div>
          <div className="form-row">
            <label>Ablauf</label>
            <input
              type="date"
              value={createExpiresAt}
              onChange={(e) => setCreateExpiresAt(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleCreate} disabled={isCreating || !createAppId}>
              {isCreating ? 'Erstelle…' : 'Erstellen'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      {isLoading && <p>Lade…</p>}
      {error && <p className="error">{error}</p>}

      <table className="license-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>App</th>
            <th>Kunde</th>
            <th>Status</th>
            <th>Genutzt</th>
            <th>Max</th>
            <th>Ablauf</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {licenses.length === 0 && !isLoading && (
            <tr><td colSpan={8} className="empty">Keine Lizenzen vorhanden.</td></tr>
          )}
          {licenses.map((lic) => {
            const appName = apps.find((a) => a.id === lic.appId)?.name ?? lic.appId.slice(0, 8);
            return (
              <tr key={lic.id}>
                <td><code>{lic.key}</code></td>
                <td>{appName}</td>
                <td>{lic.customer ?? '—'}</td>
                <td><span className={`license-status ${statusClass[lic.status] ?? ''}`}>{statusLabel[lic.status] ?? lic.status}</span></td>
                <td>{lic.usedCount}</td>
                <td>{lic.maxUsers}</td>
                <td>{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : '—'}</td>
                <td className="license-actions">
                  {lic.status === 'ACTIVE' && (
                    <button type="button" onClick={() => handleRevoke(lic.id)} title="Widerrufen">
                      Widerrufen
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(lic.id)} title="Löschen">
                    Löschen
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
