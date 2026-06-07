import { useDraggable } from '@dnd-kit/core';
import type { ComponentNode } from '@pet/types';
import { useAppStore } from '../../../store/useAppStore';
import { getComponentDefinition } from '../registry';
import { DropZone } from './DropZone';
import { nodeId as toNodeId, type NodeDragData } from './dragTypes';

interface BuilderCanvasProps {
  root: ComponentNode;
}

export function BuilderCanvas({ root }: BuilderCanvasProps) {
  return (
    <div className="builder-canvas-root">
      <BuilderNode node={root} isRoot />
    </div>
  );
}

function BuilderNode({ node, isRoot = false }: { node: ComponentNode; isRoot?: boolean }) {
  const removeComponent = useAppStore((s) => s.removeComponent);
  const setSelectedNode = useAppStore((s) => s.setSelectedNode);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const definition = getComponentDefinition(node.type);
  const { Component, supportsChildren } = definition;

  const data: NodeDragData = { source: 'node', nodeId: node.id };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: toNodeId(node.id),
    data,
    disabled: isRoot,
  });

  const children = supportsChildren ? (
    <ChildrenWithDropZones parentId={node.id} children={node.children ?? []} />
  ) : null;

  if (isRoot) {
    return <Component node={node}>{children}</Component>;
  }

  const isSelected = selectedNodeId === node.id;
  const className = [
    'builder-node',
    isDragging ? 'is-dragging' : '',
    isSelected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setNodeRef}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNode(node.id);
      }}
      {...attributes}
    >
      <div className="builder-node-handle" {...listeners}>
        <span className="builder-node-label">{definition.label}</span>
        <button
          type="button"
          className="builder-node-delete"
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(node.id);
          }}
          aria-label="Komponente löschen"
        >
          ×
        </button>
      </div>
      <Component node={node}>{children}</Component>
    </div>
  );
}

function ChildrenWithDropZones({
  parentId,
  children,
}: {
  parentId: string;
  children: ComponentNode[];
}) {
  if (children.length === 0) {
    return <DropZone parentId={parentId} index={0} variant="empty" />;
  }
  return (
    <>
      <DropZone parentId={parentId} index={0} />
      {children.map((child, i) => (
        <div key={child.id} className="builder-node-slot">
          <BuilderNode node={child} />
          <DropZone parentId={parentId} index={i + 1} />
        </div>
      ))}
    </>
  );
}
