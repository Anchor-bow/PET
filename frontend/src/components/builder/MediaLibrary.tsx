import { type FormEvent, useEffect, useRef, useState } from 'react';
import { deleteFile, fetchFiles, fileUrl, type FileMetadata, uploadFile } from '../../api/media';
import { useAppStore } from '../../store/useAppStore';

export function MediaLibrary() {
  const appId = useAppStore((s) => s.currentApp?.id);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!appId) return;
    fetchFiles(appId).then(setFiles).catch(() => {});
  }, [appId]);

  if (!appId) {
    return (
      <aside className="property-editor property-editor--empty">
        Keine App geöffnet.
      </aside>
    );
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file || !appId) return;
    setUploading(true);
    try {
      const meta = await uploadFile(appId, file);
      setFiles((prev) => [meta, ...prev]);
    } catch { /* noop */ }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleDelete(fileId: string) {
    if (!appId) return;
    try {
      await deleteFile(appId, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch { /* noop */ }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const isImage = (mime: string) => mime.startsWith('image/');

  return (
    <aside className="property-editor">
      <div className="property-editor__header">
        <span className="property-editor__title">Mediathek</span>
      </div>

      <form className="media-upload" onSubmit={handleUpload}>
        <input type="file" ref={inputRef} className="media-upload-input" />
        <button type="submit" className="media-upload-btn" disabled={uploading}>
          {uploading ? 'Hochladen…' : 'Hochladen'}
        </button>
      </form>

      <div className="media-list">
        {files.length === 0 && (
          <p className="property-editor--empty" style={{ padding: 0, margin: 0 }}>
            Keine Dateien vorhanden.
          </p>
        )}
        {files.map((f) => (
          <div key={f.id} className="media-item">
            {isImage(f.mimetype) ? (
              <img className="media-thumb" src={fileUrl(appId, f.id)} alt={f.filename} />
            ) : (
              <div className="media-icon">{f.filename.split('.').pop()}</div>
            )}
            <div className="media-meta">
              <span className="media-name" title={f.filename}>{f.filename}</span>
              <span className="media-size">{formatSize(f.size)}</span>
            </div>
            <button
              type="button"
              className="media-delete"
              title="Löschen"
              onClick={() => handleDelete(f.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
