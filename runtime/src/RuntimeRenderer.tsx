import type { AppDefinition } from '@pet/types';
import { RuntimeProvider } from './RuntimeProvider';
import { RuntimePageRenderer } from './RuntimePageRenderer';

export interface RuntimeRendererProps {
  app: AppDefinition;
  pageId?: string;
  onPageChange?: (pageId: string) => void;
}

export function RuntimeRenderer({ app, pageId, onPageChange }: RuntimeRendererProps) {
  return (
    <RuntimeProvider app={app} pageId={pageId} onPageChange={onPageChange}>
      <RuntimePageRenderer />
    </RuntimeProvider>
  );
}
