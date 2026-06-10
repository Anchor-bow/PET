import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  fetchTables,
  createTable,
  updateTable,
  deleteTable,
  fetchRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  type TableDefinition,
  type FieldDefinition,
  type StoredRecord,
} from '../../api/db';

type View = 'list' | 'edit-table' | 'records';

const FIELD_TYPES = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Zahl' },
  { value: 'boolean', label: 'Ja/Nein' },
  { value: 'email', label: 'E-Mail' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Datum' },
  { value: 'text', label: 'Langtext' },
  { value: 'select', label: 'Auswahl' },
];

interface DbBuilderModalProps {
  onClose: () => void;
}

export function DbBuilderModal({ onClose }: DbBuilderModalProps) {
  const appId = useAppStore((s) => s.currentApp?.id);

  if (!appId) return null;

  return <DbBuilderModalInner appId={appId} onClose={onClose} />;
}

function DbBuilderModalInner({ appId, onClose }: { appId: string; onClose: () => void }) {
  const [view, setView] = useState<View>('list');
  const [tables, setTables] = useState<TableDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(null);

  const loadTables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTables(appId);
      setTables(data);
    } catch {
      setError('Tabellen konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleDeleteTable = async (table: TableDefinition) => {
    if (!confirm(`Tabelle "${table.name}" wirklich löschen?`)) return;
    try {
      await deleteTable(appId, table.id);
      await loadTables();
    } catch {
      setError('Tabelle konnte nicht gelöscht werden.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2 className="modal__title">
            {view === 'list' && 'Datenbank-Builder'}
            {view === 'edit-table' && (selectedTable ? 'Tabelle bearbeiten' : 'Neue Tabelle')}
            {view === 'records' && `Daten: ${selectedTable?.name ?? ''}`}
          </h2>
          <div className="modal__header-actions">
            {view !== 'list' && (
              <button className="modal__back-btn" onClick={() => setView('list')}>
                Zurück
              </button>
            )}
            <button className="modal__close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        <div className="modal__body">
          {error && <p className="error">{error}</p>}

          {view === 'list' && (
            <TableView
              tables={tables}
              isLoading={isLoading}
              onSelectTable={(t) => { setSelectedTable(t); setView('edit-table'); }}
              onNewTable={() => { setSelectedTable(null); setView('edit-table'); }}
              onDeleteTable={handleDeleteTable}
              onViewRecords={(t) => { setSelectedTable(t); setView('records'); }}
            />
          )}

          {view === 'edit-table' && (
            <TableEditor
              appId={appId}
              table={selectedTable}
              onSaved={() => { loadTables(); setView('list'); }}
              onCancel={() => setView('list')}
            />
          )}

          {view === 'records' && selectedTable && (
            <RecordsView
              appId={appId}
              table={selectedTable}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Table List View ── */

function TableView({
  tables,
  isLoading,
  onSelectTable,
  onNewTable,
  onDeleteTable,
  onViewRecords,
}: {
  tables: TableDefinition[];
  isLoading: boolean;
  onSelectTable: (t: TableDefinition) => void;
  onNewTable: () => void;
  onDeleteTable: (t: TableDefinition) => void;
  onViewRecords: (t: TableDefinition) => void;
}) {
  return (
    <div>
      <div className="table-list-toolbar">
        <button className="btn btn--primary" onClick={onNewTable}>
          + Neue Tabelle
        </button>
      </div>
      {isLoading && <p className="empty">Lade Tabellen…</p>}
      {!isLoading && tables.length === 0 && (
        <p className="empty">Noch keine Tabellen vorhanden.</p>
      )}
      {tables.map((t) => (
        <div key={t.id} className="table-list-item">
          <div className="table-list-item__info">
            <strong>{t.name}</strong>
            <span className="table-list-item__slug">{t.slug}</span>
            <span className="table-list-item__fields">{t.fields.length} Felder</span>
          </div>
          <div className="table-list-item__actions">
            <button className="btn btn--ghost" onClick={() => onViewRecords(t)}>
              Daten
            </button>
            <button className="btn btn--ghost" onClick={() => onSelectTable(t)}>
              Bearbeiten
            </button>
            <button className="btn btn--ghost btn--danger" onClick={() => onDeleteTable(t)}>
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Table Editor (create/edit table + fields) ── */

function TableEditor({
  appId,
  table,
  onSaved,
  onCancel,
}: {
  appId: string;
  table: TableDefinition | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(table?.name ?? '');
  const [slug, setSlug] = useState(table?.slug ?? '');
  const [fields, setFields] = useState<FieldDefinition[]>(table?.fields ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddField = () => {
    const newField: FieldDefinition = {
      id: crypto.randomUUID(),
      name: '',
      key: '',
      type: 'string',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, patch: Partial<FieldDefinition>) => {
    const updated = { ...fields[index], ...patch };
    if (patch.name !== undefined) {
      updated.key = patch.name.toLowerCase().replace(/[^a-z0-9_äöü]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'feld';
    }
    setFields(fields.map((f, i) => (i === index ? updated : f)));
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name und Slug sind erforderlich.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        fields: fields.map(({ id, ...rest }) => rest),
      };
      if (table) {
        await updateTable(appId, table.id, payload);
      } else {
        await createTable(appId, payload);
      }
      onSaved();
    } catch {
      setError('Tabelle konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="table-editor">
      {error && <p className="error">{error}</p>}
      <div className="table-editor__row">
        <label className="table-editor__label">Name</label>
        <input className="table-editor__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Kunden" />
      </div>
      <div className="table-editor__row">
        <label className="table-editor__label">Slug</label>
        <input className="table-editor__input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="z.B. customers" />
      </div>

      <h4 className="table-editor__fields-title">Felder</h4>
      <div className="table-editor__fields">
        <div className="table-editor__field-headers">
          <span className="table-editor__field-header">Feldname</span>
          <span className="table-editor__field-header">Typ</span>
          <span className="table-editor__field-header">Optionen</span>
          <span className="table-editor__field-header" />
          <span className="table-editor__field-header" />
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="table-editor__field-row">
            <input className="table-editor__input table-editor__input--sm" value={field.name} onChange={(e) => handleUpdateField(index, { name: e.target.value })} placeholder="z.B. E-Mail" />
            <select className="table-editor__select" value={field.type} onChange={(e) => handleUpdateField(index, { type: e.target.value })}>
              {FIELD_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
            {field.type === 'select' ? (
              <input className="table-editor__input table-editor__input--sm" value={(field.options ?? []).join(', ')} onChange={(e) => handleUpdateField(index, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Opt1, Opt2" />
            ) : (
              <span className="table-editor__field-spacer" />
            )}
            <label className="table-editor__checkbox-label">
              <input type="checkbox" checked={field.required} onChange={(e) => handleUpdateField(index, { required: e.target.checked })} />
              Pflicht
            </label>
            <button className="btn btn--ghost btn--danger" onClick={() => handleRemoveField(index)} title="Feld entfernen">
              ✕
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn--ghost" onClick={handleAddField}>
        + Feld hinzufügen
      </button>

      <div className="table-editor__actions">
        <button className="btn btn--primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Speichere…' : (table ? 'Aktualisieren' : 'Erstellen')}
        </button>
        <button className="btn btn--ghost" onClick={onCancel}>Abbrechen</button>
      </div>
    </div>
  );
}

/* ── Records View ── */

function RecordsView({ appId, table }: { appId: string; table: TableDefinition }) {
  const [records, setRecords] = useState<StoredRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<StoredRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRecords(appId, table.id);
      setRecords(data);
    } catch {
      setError('Daten konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, [appId, table.id]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = async (recordId: string) => {
    if (!confirm('Datensatz wirklich löschen?')) return;
    try {
      await deleteRecord(appId, table.id, recordId);
      await loadRecords();
    } catch {
      setError('Datensatz konnte nicht gelöscht werden.');
    }
  };

  const handleSaveRecord = async (data: Record<string, unknown>, recordId?: string) => {
    try {
      if (recordId) {
        await updateRecord(appId, table.id, recordId, { data });
      } else {
        await createRecord(appId, table.id, { data });
      }
      setEditingRecord(null);
      setIsCreating(false);
      await loadRecords();
    } catch {
      setError('Datensatz konnte nicht gespeichert werden.');
    }
  };

  if (isCreating || editingRecord) {
    return (
      <RecordForm
        fields={table.fields}
        initialData={editingRecord?.data ?? {}}
        onSave={(data) => handleSaveRecord(data, editingRecord?.id)}
        onCancel={() => { setEditingRecord(null); setIsCreating(false); }}
      />
    );
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="table-list-toolbar">
        <button className="btn btn--primary" onClick={() => setIsCreating(true)}>
          + Neuer Datensatz
        </button>
        <button className="btn btn--ghost" onClick={loadRecords} disabled={isLoading}>
          Aktualisieren
        </button>
      </div>
      {isLoading && <p className="empty">Lade Daten…</p>}
      {!isLoading && records.length === 0 && (
        <p className="empty">Keine Datensätze vorhanden.</p>
      )}
      {records.length > 0 && (
        <div className="records-table-wrap">
          <table className="records-table">
            <thead>
              <tr>
                <th className="records-table__id">ID</th>
                {table.fields.map((f) => (
                  <th key={f.key}>{f.name}</th>
                ))}
                <th className="records-table__actions">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="records-table__id"><code>{r.id.slice(0, 8)}</code></td>
                  {table.fields.map((f) => (
                    <td key={f.key}>{formatValue(r.data[f.key], f.type)}</td>
                  ))}
                  <td className="records-table__actions">
                    <button className="btn btn--ghost" onClick={() => setEditingRecord(r)}>
                      Bearbeiten
                    </button>
                    <button className="btn btn--ghost btn--danger" onClick={() => handleDelete(r.id)}>
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return '—';
  if (type === 'boolean') return value ? 'Ja' : 'Nein';
  const s = String(value);
  return s.length > 60 ? s.slice(0, 60) + '…' : s;
}

/* ── Record Form (create/edit) ── */

function RecordForm({
  fields,
  initialData,
  onSave,
  onCancel,
}: {
  fields: FieldDefinition[];
  initialData: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="record-form">
      {fields.length === 0 && <p className="empty">Diese Tabelle hat keine Felder.</p>}
      {fields.map((f) => (
        <label key={f.id} className="record-form__field">
          <span className="record-form__label">
            {f.name}{f.required ? ' *' : ''}
          </span>
          {f.type === 'boolean' ? (
            <input type="checkbox" checked={!!data[f.key]} onChange={(e) => setData({ ...data, [f.key]: e.target.checked })} />
          ) : f.type === 'select' ? (
            <select className="table-editor__select" value={(data[f.key] as string) ?? ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })}>
              <option value="">—</option>
              {(f.options ?? []).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : f.type === 'number' ? (
            <input className="table-editor__input" type="number" value={(data[f.key] as string | number) ?? ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value ? Number(e.target.value) : '' })} />
          ) : f.type === 'text' ? (
            <textarea className="table-editor__textarea" value={(data[f.key] as string) ?? ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
          ) : (
            <input className="table-editor__input" value={(data[f.key] as string) ?? ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
          )}
        </label>
      ))}
      <div className="table-editor__actions">
        <button className="btn btn--primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Speichere…' : 'Speichern'}
        </button>
        <button className="btn btn--ghost" onClick={onCancel}>Abbrechen</button>
      </div>
    </div>
  );
}
