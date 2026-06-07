import type { ComponentNode } from '@pet/types';
import { getComponentDefinition } from './registry';

interface ComponentRendererProps {
  node: ComponentNode;
}

export function ComponentRenderer({ node }: ComponentRendererProps) {
  const definition = getComponentDefinition(node.type);
  const { Component, supportsChildren } = definition;

  const children =
    supportsChildren && node.children && node.children.length > 0
      ? node.children.map((child) => <ComponentRenderer key={child.id} node={child} />)
      : null;

  return <Component node={node}>{children}</Component>;
}
