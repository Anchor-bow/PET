import { app, BrowserWindow, Menu, type MenuItemConstructorOptions, shell } from 'electron';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

const RENDERER_DIR = join(__dirname, '..', 'renderer');

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  win.once('ready-to-show', () => win.show());

  win.loadFile(join(RENDERER_DIR, 'index.html'));

  return win;
}

function buildMenu(win: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin';

  const appMenu: MenuItemConstructorOptions = {
    label: 'PET App',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  };

  const fileMenu: MenuItemConstructorOptions = {
    label: 'Datei',
    submenu: [
      {
        label: 'Exportieren…',
        accelerator: 'CmdOrCtrl+E',
        click: () => win.webContents.send('menu-export'),
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  };

  const editMenu: MenuItemConstructorOptions = {
    label: 'Bearbeiten',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  };

  const viewMenu: MenuItemConstructorOptions = {
    label: 'Ansicht',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  };

  const helpMenu: MenuItemConstructorOptions = {
    label: 'Hilfe',
    submenu: [
      {
        label: 'PET Dokumentation',
        click: () => shell.openExternal('https://github.com/anomalyco/PET'),
      },
      { type: 'separator' },
      { role: 'toggleDevTools' },
    ],
  };

  const template: MenuItemConstructorOptions[] = [fileMenu, editMenu, viewMenu, helpMenu];
  if (isMac) template.unshift(appMenu);

  return Menu.buildFromTemplate(template);
}

app.whenReady().then(() => {
  const win = createWindow();
  const menu = buildMenu(win);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
