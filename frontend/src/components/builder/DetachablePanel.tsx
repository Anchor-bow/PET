import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Position {
  x: number;
  y: number;
}

interface DetachablePanelProps {
  title: string;
  children: ReactNode;
  defaultPosition?: Position;
  detached?: boolean;
  onDetachedChange?: (v: boolean) => void;
}

export function DetachablePanel({ title, children, defaultPosition, detached: controlled, onDetachedChange }: DetachablePanelProps) {
  const [internalDetached, setInternalDetached] = useState(false);
  const detached = controlled ?? internalDetached;
  const setDetached = onDetachedChange ?? setInternalDetached;
  const [pos, setPos] = useState<Position>(defaultPosition ?? { x: 120, y: 80 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPos: Position;
    headerClicked: boolean;
  } | null>(null);

  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: pos,
      headerClicked: true,
    };
  }, [pos]);

  useEffect(() => {
    if (!detached) return;

    const onMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d || !d.headerClicked) return;
      setPos({
        x: d.startPos.x + (e.clientX - d.startX),
        y: d.startPos.y + (e.clientY - d.startY),
      });
    };

    const onMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [detached]);

  if (!detached) {
    return (
      <div className="detachable-panel">
        <div className="detachable-panel__header">
          <span className="detachable-panel__title">{title}</span>
          <button
            className="detachable-panel__detach-btn"
            onClick={() => setDetached(true)}
            title="Panel loslösen"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 1H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V7" />
              <path d="M7 1h4v4" />
              <path d="M11 1L6 6" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="detachable-panel__placeholder">
        <span className="detachable-panel__title">{title}</span>
        <button
          className="detachable-panel__attach-btn"
          onClick={() => setDetached(false)}
          title="Panel anheften"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 11L11 2" />
            <path d="M5 1H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V7" />
          </svg>
        </button>
      </div>
      {createPortal(
        <div className="detachable-panel__float" style={{ left: pos.x, top: pos.y }}>
          <div className="detachable-panel__float-header" onMouseDown={onHeaderMouseDown}>
            <span className="detachable-panel__title">{title}</span>
            <button
              className="detachable-panel__attach-btn"
              onClick={() => setDetached(false)}
              title="Panel anheften"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 11L11 2" />
                <path d="M5 1H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V7" />
              </svg>
            </button>
          </div>
          <div className="detachable-panel__float-body">{children}</div>
        </div>,
        document.body,
      )}
    </>
  );
}
