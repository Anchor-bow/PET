import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RuntimeRenderer } from '@pet/runtime';
import {
  BuilderCanvas,
  BuilderDndContext,
  ComponentPalette,
  MediaLibrary,
  PropertyEditor,
} from '../components/builder';
import { PageEditor } from '../components/builder/PageEditor';
import { useAppStore } from '../store/useAppStore';
import { exportAppWeb, exportAppDesktop, exportAppAndroid } from '../api/apps';

export function EditorPage() {
  const { appId } = useParams();
  const {
    currentApp,
    currentAppDraft,
    currentPageId,
    isCurrentAppLoading,
    currentAppError,
    isDirty,
    isSaving,
    history,
    future,
    loadApp,
    clearCurrentApp,
    updateDraft,
    saveCurrentApp,
    setSelectedNode,
    undo,
    redo,
    setCurrentPage,
    addPage,
    removePage,
  } = useAppStore();

  const [previewMode, setPreviewMode] = useState(false);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [pageEditorPageId, setPageEditorPageId] = useState<string | null>(null);
  const [confirmDeletePageId, setConfirmDeletePageId] = useState<string | null>(null);
  const [showMedia, setShowMedia] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingDesktop, setIsExportingDesktop] = useState(false);
  const handleExport = useCallback(async () => {
    if (!appId) return;
    setIsExporting(true);
    try {
      const blob = await exportAppWeb(appId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appId}-web.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Export fehlgeschlagen.');
    } finally {
      setIsExporting(false);
    }
  }, [appId]);

  const handleExportDesktop = useCallback(async () => {
    if (!appId) return;
    setIsExportingDesktop(true);
    try {
      const blob = await exportAppDesktop(appId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appId}-setup.exe`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Desktop-Export fehlgeschlagen. Ist electron-builder installiert?');
    } finally {
      setIsExportingDesktop(false);
    }
  }, [appId]);

  const [isExportingAndroid, setIsExportingAndroid] = useState(false);
  const handleExportAndroid = useCallback(async () => {
    if (!appId) return;
    setIsExportingAndroid(true);
    try {
      const blob = await exportAppAndroid(appId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appId}-app.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Android-Export fehlgeschlagen. Ist das Android SDK installiert?');
    } finally {
      setIsExportingAndroid(false);
    }
  }, [appId]);

  useEffect(() => {
    if (appId) {
      loadApp(appId);
    } else {
      clearCurrentApp();
    }
    return () => clearCurrentApp();
  }, [appId, loadApp, clearCurrentApp]);

  useEffect(() => {
    setPageEditorPageId(null);
    setConfirmDeletePageId(null);
  }, [currentPageId]);

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
    currentAppDraft.pages.find((p) => p.id === currentPageId) ??
    currentAppDraft.pages.find((p) => p.id === currentAppDraft.defaultPageId) ??
    currentAppDraft.pages[0];

  const handleAddPage = () => {
    const name = newPageName.trim() || `Seite ${currentAppDraft.pages.length + 1}`;
    addPage(name);
    setNewPageName('');
  };

  const handleConfirmDelete = () => {
    if (!confirmDeletePageId) return;
    if (currentAppDraft.pages.length <= 1) return;
    removePage(confirmDeletePageId);
    setConfirmDeletePageId(null);
  };

  const editingPage = pageEditorPageId
    ? currentAppDraft.pages.find((p) => p.id === pageEditorPageId) ?? null
    : null;

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
          <button type="button" onClick={() => { setShowMedia((v) => !v); setPageEditorPageId(null); }}>
            {showMedia ? 'Eigenschaften' : 'Mediathek'}
          </button>
          <button
            type="button"
            className={previewMode ? 'preview-toggle preview-toggle--active' : 'preview-toggle'}
            onClick={() => {
              if (previewMode) {
                setPreviewMode(false);
              } else {
                setPreviewPageId(currentPageId);
                setPreviewMode(true);
              }
            }}
          >
            {previewMode ? 'Editor' : 'Vorschau'}
          </button>
          {previewMode && appId && (
            <a
              href={`/preview/${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-open-tab"
            >
              In neuem Tab öffnen
            </a>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            title="App als Web-App exportieren (ZIP)"
          >
            {isExporting ? 'Exportiere…' : 'Web-Export'}
          </button>
          <button
            type="button"
            onClick={handleExportDesktop}
            disabled={isExportingDesktop}
            title="App als Desktop-App exportieren (.exe)"
          >
            {isExportingDesktop ? 'Exportiere…' : 'Desktop-Export'}
          </button>
          <button
            type="button"
            onClick={handleExportAndroid}
            disabled={isExportingAndroid}
            title="App als Android-App exportieren (.apk)"
          >
            {isExportingAndroid ? 'Exportiere…' : 'Android-Export'}
          </button>
        </div>
        <div className="page-tabs">
          {currentAppDraft.pages.map((page) => {
            const isActivePage = previewMode
              ? page.id === previewPageId
              : page.id === currentPageId;
            return (
              <div
                key={page.id}
                className={`page-tab${isActivePage ? ' page-tab--active' : ''}`}
              >
                <button
                  type="button"
                  className="page-tab__btn"
                  onClick={() => {
                    if (previewMode) {
                      setPreviewPageId(page.id);
                    } else {
                      setCurrentPage(page.id);
                    }
                  }}
                  title={`Zu "${page.name}" wechseln`}
                >
                  {page.name}
                  {page.id === currentAppDraft.defaultPageId && (
                    <span className="page-tab__default" title="Startseite">★</span>
                  )}
                </button>
                {!previewMode && (
                  <>
                    <button
                      type="button"
                      className="page-tab__edit"
                      onClick={() => setPageEditorPageId(page.id)}
                      title="Seite bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="page-tab__delete"
                      onClick={() => setConfirmDeletePageId(page.id)}
                      disabled={currentAppDraft.pages.length <= 1}
                      title="Seite löschen"
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            );
          })}
          {!previewMode && (
            <div className="page-tab page-tab--add">
              <input
                type="text"
                className="page-tab__input"
                placeholder="Neue Seite"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddPage();
                }}
              />
              <button
                type="button"
                className="page-tab__add-btn"
                onClick={handleAddPage}
                title="Seite hinzufügen"
              >
                +
              </button>
            </div>
          )}
        </div>
      </header>

      {confirmDeletePageId && (
        <div className="confirm-overlay" onClick={() => setConfirmDeletePageId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p>Willst du diese Seite wirklich löschen?</p>
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="confirm-dialog__btn confirm-dialog__btn--yes"
                onClick={handleConfirmDelete}
              >
                Ja
              </button>
              <button
                type="button"
                className="confirm-dialog__btn confirm-dialog__btn--no"
                onClick={() => setConfirmDeletePageId(null)}
              >
                Nein
              </button>
            </div>
          </div>
        </div>
      )}

      {previewMode && currentAppDraft ? (
        <div className="editor-preview">
          <RuntimeRenderer
            app={currentAppDraft}
            pageId={previewPageId ?? currentAppDraft.defaultPageId}
            onPageChange={setPreviewPageId}
            isLicensed
          />
        </div>
      ) : (
        <BuilderDndContext>
          <div className="editor-workspace">
            <ComponentPalette />
            <div className="editor-canvas" onClick={() => setSelectedNode(null)}>
              {currentPage ? (
                <BuilderCanvas root={currentPage.root} />
              ) : (
                <p className="empty">Keine Seite vorhanden.</p>
              )}
            </div>
            {editingPage ? (
              <PageEditor page={editingPage} onClose={() => setPageEditorPageId(null)} />
            ) : showMedia ? (
              <MediaLibrary />
            ) : (
              <PropertyEditor />
            )}
          </div>
        </BuilderDndContext>
      )}
    </section>
  );
}
