import type { ComponentNode } from '@pet/types';
import { getComponentDefinition } from './registry';
import { useRuntime } from './RuntimeProvider';

interface RuntimeComponentRendererProps {
  node: ComponentNode;
}

export function RuntimeComponentRenderer({ node }: RuntimeComponentRendererProps) {
  const definition = getComponentDefinition(node.type);
  const { executeActions, getInputValue, setInputValue } = useRuntime();

  const actionHandlers: Record<string, () => void> = {};
  if (node.actions && node.actions.length > 0) {
    const seen = new Set<string>();
    for (const a of node.actions) {
      if (!seen.has(a.trigger)) {
        seen.add(a.trigger);
        actionHandlers[a.trigger] = () => { executeActions(node.actions!).catch(() => {}) };
      }
    }
  }

  const { Component, supportsChildren } = definition;

  const children =
    supportsChildren && node.children && node.children.length > 0
      ? node.children.map((child) => (
          <RuntimeComponentRenderer key={child.id} node={child} />
        ))
      : null;

  const value = getInputValue(node.id);
  const onChange = node.type === 'input' ? (v: string) => setInputValue(node.id, v) : undefined;

  return (
    <Component
      node={node}
      onAction={Object.keys(actionHandlers).length > 0 ? actionHandlers : undefined}
      value={value}
      onChange={onChange}
    >
      {children}
    </Component>
  );
}
