const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ส่งคำสั่ง Logout ไปที่ index.js
    sendLogoutRequest: () => ipcRenderer.send('logout-request'),
    
    // ขอดูหน้าเพจ (Promise-based)
    invokeFetchPage: (pageName) => ipcRenderer.invoke('fetch-page', pageName)
});