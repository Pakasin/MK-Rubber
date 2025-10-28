// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendCancelClick: () => ipcRenderer.send('cancel-button-clicked'),
  
  sendLoginRequest: (username, password) => {
    ipcRenderer.send('login-request', username, password);
  },
  onLoginFail: (callback) => {

    ipcRenderer.on('login-fail', (event, ...args) => callback(...args));
  }
});