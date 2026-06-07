import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ComponentRenderer, componentRegistry, insertableComponentTypes } from '../components/builder';
import { createComponentNode } from '../lib/createComponent';
import { useAppStore } from '../store/useAppStore';

export function EditorPage() {
  const { appId } = useParams();
  const {
    currentApp,
    currentAppDraft,
    isCurrentAppLoading,
    currentAppError,
    isDirty,
    isSaving,
    history,
    future,
    loadApp,
    clearCurrentApp,
    updateDraft,
    addComponentToCurrentPage,
    saveCurrentApp,
    undo,
    redo,
  } = useAppStore();

  useEffect(() => {
    if (appId) {
      loadApp(appId);
    } else {
      clearCurrentApp();
    }
    return () => clearCurrentApp();
  }, [appId, loadApp, clearCurrentApp]);

  if (!appId) {
    return (
      <section className="editor">
        <header className="page-header">
          <h1>Editor</h1>
          <p>Keine App ausgewählt. Wähle eine App im Dashboard.</p>
        </header>
        <div className="editor-canvas editor-canvas-empty">Canvas-Platzhalter</div>
      </section>
    );
  }

  if (isCurrentAppLoading) {
    return (
      <section className="editor">
        <header className="page-header">
          <h1>Editor</h1>
          <p>Lade App…</p>
        </header>
      </section>
    );
  }

  if (currentAppError) {
    return (
      <section className="editor">
        <header className="page-header">
          <h1>Editor</h1>
          <p className="error">{currentAppError}</p>
        </header>
      </section>
    );
  }

  if (!currentApp || !currentAppDraft) {
    return null;
  }

  const handleRename = (name: string) => {
    updateDraft((draft) => ({ ...draft, name }));
  };

  const currentPage =
    currentAppDraft.pages.find((p) => p.id === currentAppDraft.defaultPageId) ??
    currentAppDraft.pages[0];

  return (
    <section className="editor">
      <header className="page-header">
        <h1>Editor</h1>
        <p>
          App: <code>{currentApp.id}</code> · v{currentApp.version}
          {isDirty && <span className="dirty"> · ungespeichert</span>}
        </p>
        <div className="editor-toolbar">
          <label>
            Name:{' '}
            <input
              type="text"
              value={currentAppDraft.name}
              onChange={(e) => handleRename(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => void saveCurrentApp()}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Speichere…' : 'Speichern'}
          </button>
          <button type="button" onClick={undo} disabled={history.length === 0}>
            Undo
          </button>
          <button type="button" onClick={redo} disabled={future.length === 0}>
            Redo
          </button>
        </div>
        <div className="editor-toolbar">
          <span className="editor-toolbar-label">Hinzufügen:</span>
          {insertableComponentTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addComponentToCurrentPage(createComponentNode(type))}
            >
              + {componentRegistry[type].label}
            </button>
          ))}
        </div>
      </header>
      <div className="editor-canvas">
        {currentPage ? (
          <ComponentRenderer node={currentPage.root} />
        ) : (
          <p className="empty">Keine Seite vorhanden.</p>
        )}
      </div>
    </section>
  );
}
