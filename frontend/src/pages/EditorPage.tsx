import { useParams } from 'react-router-dom';

export function EditorPage() {
  const { appId } = useParams();

  return (
    <section className="editor">
      <header className="page-header">
        <h1>Editor</h1>
        <p>
          {appId ? (
            <>
              App: <code>{appId}</code>
            </>
          ) : (
            'Keine App ausgewählt. Drag & Drop Engine folgt in Phase 8.'
          )}
        </p>
      </header>
      <div className="editor-canvas">Canvas-Platzhalter</div>
    </section>
  );
}
