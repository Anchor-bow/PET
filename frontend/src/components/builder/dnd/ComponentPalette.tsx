import { useDraggable } from '@dnd-kit/core';
import type { ComponentType } from '@pet/types';
import { componentRegistry, insertableComponentTypes } from '../registry';
import { paletteId, type PaletteDragData } from './dragTypes';

function PaletteItem({ type }: { type: ComponentType }) {
  const data: PaletteDragData = { source: 'palette', componentType: type };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: paletteId(type),
    data,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`palette-item${isDragging ? ' is-dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      + {componentRegistry[type].label}
    </button>
  );
}

export function ComponentPalette() {
  return (
    <div className="palette">
      <span className="palette-title">Komponenten</span>
      <div className="palette-list">
        {insertableComponentTypes.map((type) => (
          <PaletteItem key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
