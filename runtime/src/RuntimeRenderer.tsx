import type { AppDefinition } from '@pet/types';
import { RuntimeProvider } from './RuntimeProvider';
import { RuntimePageRenderer } from './RuntimePageRenderer';
import { WatermarkOverlay } from './WatermarkOverlay';

export interface RuntimeRendererProps {
  app: AppDefinition;
  pageId?: string;
  onPageChange?: (pageId: string) => void;
  isLicensed?: boolean;
}

export function RuntimeRenderer({ app, pageId, onPageChange, isLicensed }: RuntimeRendererProps) {
  return (
    <RuntimeProvider app={app} pageId={pageId} onPageChange={onPageChange} isLicensed={isLicensed}>
      <RuntimePageRenderer />
      {!isLicensed && <WatermarkOverlay />}
    </RuntimeProvider>
  );
}
