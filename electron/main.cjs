const { app, BrowserWindow, desktopCapturer, session, ipcMain } = require('electron');
const path = require('path');
const dgram = require('dgram');

const UDP_PORT = 41235;
let udpSocket = null;
const activeWindows = new Set();

function setupUDPSocket() {
  udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

  udpSocket.on('error', (err) => {
    console.error('UDP socket error:', err);
    try {
      udpSocket.close();
    } catch {}
    // Retry setup after some delay
    setTimeout(setupUDPSocket, 5000);
  });

  udpSocket.on('message', (msg, rinfo) => {
    try {
      const data = JSON.parse(msg.toString());
      // Broadcast received message to all active BrowserWindow instances
      for (const win of activeWindows) {
        if (!win.isDestroyed()) {
          win.webContents.send('p2p-receive', data);
        }
      }
    } catch (err) {
      // Ignore invalid JSON
    }
  });

  udpSocket.on('listening', () => {
    udpSocket.setBroadcast(true);
    console.log(`UDP Server listening on port ${UDP_PORT}`);
  });

  udpSocket.bind(UDP_PORT);
}

function broadcastUDP(data) {
  if (!udpSocket) return;
  try {
    const payload = Buffer.from(JSON.stringify(data));
    // Broadcast to the local network broadcast address
    udpSocket.send(payload, 0, payload.length, UDP_PORT, '255.255.255.255', (err) => {
      if (err) {
        console.error('Failed to broadcast UDP message:', err);
      }
    });
  } catch (err) {
    console.error('UDP Broadcast error:', err);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    }
  });

  activeWindows.add(win);

  win.on('closed', () => {
    activeWindows.delete(win);
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  setupUDPSocket();
  createWindow();

  // IPC channel to receive messages from Renderer and broadcast them to LAN
  ipcMain.on('p2p-send', (event, data) => {
    broadcastUDP(data);
  });

  // Register Display Media Request Handler for Electron screen sharing
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      if (sources.length > 0) {
        // Automatically grant access to the first screen/window source
        callback({ video: sources[0] });
      } else {
        callback({});
      }
    }).catch((err) => {
      console.error('Failed to get desktop sources:', err);
      callback({});
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
