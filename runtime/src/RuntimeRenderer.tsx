import type { AppDefinition } from '@pet/types';
import { RuntimeProvider } from './RuntimeProvider';
import { RuntimePageRenderer } from './RuntimePageRenderer';

export interface RuntimeRendererProps {
  app: AppDefinition;
}

export function RuntimeRenderer({ app }: RuntimeRendererProps) {
  return (
    <RuntimeProvider app={app}>
      <RuntimePageRenderer />
    </RuntimeProvider>
  );
}
