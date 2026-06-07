import type { ComponentType } from '@pet/types';

export const PALETTE_PREFIX = 'palette:';
export const NODE_PREFIX = 'node:';
export const DROPZONE_PREFIX = 'drop:';

export interface PaletteDragData {
  source: 'palette';
  componentType: ComponentType;
}

export interface NodeDragData {
  source: 'node';
  nodeId: string;
}

export type DragData = PaletteDragData | NodeDragData;

export interface DropZoneData {
  parentId: string;
  index: number;
}

export function paletteId(type: ComponentType): string {
  return `${PALETTE_PREFIX}${type}`;
}

export function nodeId(id: string): string {
  return `${NODE_PREFIX}${id}`;
}

export function dropZoneId(parentId: string, index: number): string {
  return `${DROPZONE_PREFIX}${parentId}:${index}`;
}
