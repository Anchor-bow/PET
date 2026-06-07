import {
  getDefaultComponentProps,
  type ComponentNode,
  type ComponentType,
} from '@pet/types';

export function createComponentNode(type: ComponentType): ComponentNode {
  const node: ComponentNode = {
    id: crypto.randomUUID(),
    type,
    props: getDefaultComponentProps(type),
  };
  if (type === 'container' || type === 'custom') {
    node.children = [];
  }
  return node;
}
