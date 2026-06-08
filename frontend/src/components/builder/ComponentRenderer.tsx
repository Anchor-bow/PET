import type { ComponentNode } from '@pet/types';
import { getComponentDefinition } from './registry';

interface ComponentRendererProps {
  node: ComponentNode;
  onAction?: Record<string, () => void>;
}

export function ComponentRenderer({ node, onAction }: ComponentRendererProps) {
  const definition = getComponentDefinition(node.type);

  const actionHandlers: Record<string, () => void> = {};
  if (node.actions && node.actions.length > 0) {
    const seen = new Set<string>();
    for (const a of node.actions) {
      if (!seen.has(a.trigger)) {
        seen.add(a.trigger);
        actionHandlers[a.trigger] = onAction?.[a.trigger] ?? (() => {});
      }
    }
  }

  const { Component, supportsChildren } = definition;

  const children =
    supportsChildren && node.children && node.children.length > 0
      ? node.children.map((child) => <ComponentRenderer key={child.id} node={child} />)
      : null;

  return (
    <Component node={node} onAction={Object.keys(actionHandlers).length > 0 ? actionHandlers : undefined}>
      {children}
    </Component>
  );
}
