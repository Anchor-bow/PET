import type { PageDefinition } from '@pet/types';
import { useAppStore } from '../../store/useAppStore';

interface PageEditorProps {
  page: PageDefinition;
  onClose: () => void;
}

export function PageEditor({ page, onClose }: PageEditorProps) {
  const currentAppDraft = useAppStore((s) => s.currentAppDraft);
  const updatePage = useAppStore((s) => s.updatePage);
  const setDefaultPage = useAppStore((s) => s.setDefaultPage);
  const pages = currentAppDraft?.pages ?? [];
  const parentOptions = pages.filter((p) => p.id !== page.id);

  const field = (
    label: string,
    children: React.ReactNode,
    row?: boolean,
  ) => (
    <div className={`page-editor__field${row ? ' page-editor__field-row' : ''}`}>
      <span className="page-editor__label">{label}</span>
      {children}
    </div>
  );

  return (
    <aside className="page-editor">
      <header className="page-editor__header">
        <span className="page-editor__title">Seite bearbeiten</span>
        <span className="page-editor__subtitle">{page.id}</span>
        <button
          type="button"
          className="page-editor__close"
          onClick={onClose}
          title="Schließen"
        >
          ×
        </button>
      </header>

      {field('Name', (
        <input
          type="text"
          className="page-editor__input"
          value={page.name}
          onChange={(e) => updatePage(page.id, { name: e.target.value })}
        />
      ))}

      {field('Beschreibung', (
        <textarea
          className="page-editor__input page-editor__textarea"
          value={page.description ?? ''}
          onChange={(e) => updatePage(page.id, { description: e.target.value })}
          placeholder="Optionale Beschreibung dieser Seite"
        />
      ))}

      {field('Startseite', (
        <input
          type="checkbox"
          className="page-editor__checkbox"
          checked={page.id === currentAppDraft?.defaultPageId}
          onChange={() => setDefaultPage(page.id)}
        />
      ), true)}

      {field('Übergeordnete Seite', (
        <select
          className="page-editor__input page-editor__select"
          value={page.parentPageId ?? ''}
          onChange={(e) =>
            updatePage(page.id, { parentPageId: e.target.value || undefined })
          }
        >
          <option value="">— Keine —</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ))}

      {field('Pfad', (
        <input
          type="text"
          className="page-editor__input"
          value={page.path}
          onChange={(e) => updatePage(page.id, { path: e.target.value })}
        />
      ))}
    </aside>
  );
}
