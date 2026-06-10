import { useRuntime } from './RuntimeProvider';
import { RuntimeComponentRenderer } from './RuntimeComponentRenderer';

export function RuntimePageRenderer() {
  const { currentPage } = useRuntime();

  if (!currentPage) {
    return <div className="runtime-error">Seite nicht gefunden</div>;
  }

  return <RuntimeComponentRenderer node={currentPage.root} />;
}
