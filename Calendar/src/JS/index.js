const { app, BrowserWindow } = require('electron');
const path = require('path');

const setupPug = require('electron-pug')


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

app.on('ready', async () => {
  try {
    let pug = await setupPug({pretty: true})
    pug.on('error', err => console.error('electron-pug error', err))
  } catch (err) {
    // Could not initiate 'electron-pug'
  }
 
  let mainWindow = new BrowserWindow({ width: 1700, height: 900,  webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        }})
 
  mainWindow.loadFile(path.join(__dirname, '../views/pages/index.pug'));
  // the rest...
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
