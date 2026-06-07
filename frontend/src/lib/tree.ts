import type { ComponentNode, JsonValue } from '@pet/types';
import { getComponentDefinition } from '../components/builder/registry';

export function findNode(root: ComponentNode, id: string): ComponentNode | null {
  if (root.id === id) return root;
  if (!root.children) return null;
  for (const child of root.children) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
}

export function findParent(
  root: ComponentNode,
  id: string,
): { parent: ComponentNode; index: number } | null {
  if (!root.children) return null;
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === id) return { parent: root, index: i };
    const hit = findParent(root.children[i], id);
    if (hit) return hit;
  }
  return null;
}

export function isDescendant(root: ComponentNode, ancestorId: string, candidateId: string): boolean {
  const ancestor = findNode(root, ancestorId);
  if (!ancestor) return false;
  return findNode(ancestor, candidateId) !== null && ancestorId !== candidateId;
}

export function acceptsChildren(node: ComponentNode): boolean {
  return getComponentDefinition(node.type).supportsChildren;
}

export function removeNode(root: ComponentNode, id: string): ComponentNode | null {
  const located = findParent(root, id);
  if (!located) return null;
  const [removed] = located.parent.children!.splice(located.index, 1);
  return removed;
}

export function insertNode(
  root: ComponentNode,
  parentId: string,
  index: number,
  node: ComponentNode,
): boolean {
  const parent = findNode(root, parentId);
  if (!parent || !acceptsChildren(parent)) return false;
  if (!parent.children) parent.children = [];
  const clamped = Math.max(0, Math.min(index, parent.children.length));
  parent.children.splice(clamped, 0, node);
  return true;
}

export function updateNodeProps(
  root: ComponentNode,
  id: string,
  patch: Record<string, JsonValue>,
): boolean {
  const node = findNode(root, id);
  if (!node) return false;
  node.props = { ...node.props, ...patch };
  return true;
}

export function moveNode(
  root: ComponentNode,
  nodeId: string,
  targetParentId: string,
  targetIndex: number,
): boolean {
  if (nodeId === targetParentId) return false;
  if (isDescendant(root, nodeId, targetParentId)) return false;

  const sourceLocation = findParent(root, nodeId);
  if (!sourceLocation) return false;

  const target = findNode(root, targetParentId);
  if (!target || !acceptsChildren(target)) return false;

  let adjustedIndex = targetIndex;
  if (sourceLocation.parent.id === targetParentId && sourceLocation.index < targetIndex) {
    adjustedIndex = targetIndex - 1;
  }

  const [moved] = sourceLocation.parent.children!.splice(sourceLocation.index, 1);
  if (!target.children) target.children = [];
  const clamped = Math.max(0, Math.min(adjustedIndex, target.children.length));
  target.children.splice(clamped, 0, moved);
  return true;
}
