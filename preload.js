// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// เราจะ "เปิดเผย" (expose) ฟังก์ชันที่จำเป็น
// ให้กับหน้าเว็บ (Renderer Process) อย่างปลอดภัย
contextBridge.exposeInMainWorld('electronAPI', {
  // สร้างฟังก์ชันชื่อ sendCancelClick 
  // ซึ่งข้างในจะไปเรียกใช้ ipcRenderer.send
  sendCancelClick: () => ipcRenderer.send('cancel-button-clicked')
});