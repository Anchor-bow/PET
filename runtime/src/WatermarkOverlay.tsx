import { useRuntime } from './RuntimeProvider';

export function WatermarkOverlay() {
  const { isLicensed } = useRuntime();
  if (isLicensed) return null;

  return (
    <div className="runtime-watermark-overlay">
      <div className="runtime-watermark-banner">
        <p>Setze dich mit unserem Support in Verbindung um eine Lizenz zu aktivieren</p>
      </div>
    </div>
  );
}
