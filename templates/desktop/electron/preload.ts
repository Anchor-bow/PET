import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onMenuExport: (callback: () => void) => {
    ipcRenderer.on('menu-export', callback);
  },
});
