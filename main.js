const { ipcMain } = require('electron');
// main.js
const { app, BrowserWindow, Menu } = require('electron');
const Store = require('electron-store');
const path = require('path');

app.setPath("userData", path.join(__dirname, 'data'));

const store = new Store(
    {
        defaults: {
            settings: {
                fontFamily: 'Consolas-pIqaD',
                fontSize: 14
            },
            timers: {
                timer1: {
                    name: 'Timer 1',
                    duration: 10,
                    remaining: 10,
                    running: false
                },
                timer2: {
                    name: 'Timer 2',
                    duration: 5,
                    remaining: 5,
                    running: false
                }
            }
        }
    }

);



// IPC listener
ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (event, key, val) => {
    store.set(key, val);
});

ipcMain.on('settings-updated', (event) => {
    // mainWindow is the BrowserWindow instance for your main window
    ipcMain.send('settings-updated');
});


const createSettingsWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.openDevTools();

    win.loadFile('settings.html')
}

const createWindow = () => {
    // Get the path to the preload script
    const preloadPath = path.join(__dirname, 'preload.js');
    console.log('Preload path: ', preloadPath); // Log the preload path
    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Exit',
                    click: () => {
                        app.quit()
                    }
                },
            ]
        },
        {
            label: 'Configuration',
            submenu: [
                {
                    label: 'Settings',
                    click: createSettingsWindow
                }
            ]
        },
        {
            label: 'Developer',
            submenu: [
                {
                    label: 'Open Developer Tools',
                    click: () => win.webContents.openDevTools()
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            sandbox: false
        }
    })

    win.loadFile('index.html')


}

app.whenReady().then(() => {
    createWindow()
});

