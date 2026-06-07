import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { ComponentType } from '@pet/types';
import { useState, type ReactNode } from 'react';
import { createComponentNode } from '../../../lib/createComponent';
import { useAppStore } from '../../../store/useAppStore';
import { componentRegistry } from '../registry';
import type { DragData, DropZoneData } from './dragTypes';

interface OverlayState {
  label: string;
}

export function BuilderDndContext({ children }: { children: ReactNode }) {
  const insertComponentAt = useAppStore((s) => s.insertComponentAt);
  const moveComponent = useAppStore((s) => s.moveComponent);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (!data) return;
    if (data.source === 'palette') {
      setOverlay({ label: componentRegistry[data.componentType].label });
    } else {
      setOverlay({ label: 'Verschieben' });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setOverlay(null);
    const data = event.active.data.current as DragData | undefined;
    const dropData = event.over?.data.current as DropZoneData | undefined;
    if (!data || !dropData) return;

    if (data.source === 'palette') {
      const node = createComponentNode(data.componentType as ComponentType);
      insertComponentAt(dropData.parentId, dropData.index, node);
      return;
    }

    moveComponent(data.nodeId, dropData.parentId, dropData.index);
  };

  const handleDragCancel = () => setOverlay(null);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay>
        {overlay ? <div className="drag-overlay">{overlay.label}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
