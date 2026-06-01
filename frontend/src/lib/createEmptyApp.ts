import {
  APP_SCHEMA_VERSION,
  type AppDefinition,
  type ComponentNode,
  type PageDefinition,
} from '@pet/types';

export function createEmptyApp(name: string): AppDefinition {
  const trimmed = name.trim() || 'Neue App';
  const pageId = crypto.randomUUID();
  const rootId = crypto.randomUUID();

  const root: ComponentNode = {
    id: rootId,
    type: 'container',
    name: 'Root',
    props: {},
    children: [],
  };

  const startPage: PageDefinition = {
    id: pageId,
    name: 'Start',
    path: '/',
    root,
  };

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    name: trimmed,
    defaultPageId: pageId,
    pages: [startPage],
  };
}
