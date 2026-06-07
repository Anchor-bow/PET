import { useDroppable } from '@dnd-kit/core';
import { dropZoneId, type DropZoneData } from './dragTypes';

interface DropZoneProps {
  parentId: string;
  index: number;
  variant?: 'between' | 'empty';
}

export function DropZone({ parentId, index, variant = 'between' }: DropZoneProps) {
  const data: DropZoneData = { parentId, index };
  const { setNodeRef, isOver } = useDroppable({
    id: dropZoneId(parentId, index),
    data,
  });

  const className = [
    'drop-zone',
    `drop-zone-${variant}`,
    isOver ? 'is-over' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div ref={setNodeRef} className={className} aria-hidden />;
}
