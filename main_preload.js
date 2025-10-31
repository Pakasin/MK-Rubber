const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ส่งคำสั่ง Logout ไปที่ index.js
  sendLogoutRequest: () => ipcRenderer.send("logout-request"),

  // ขอดูหน้าเพจ (Promise-based)
  invokeFetchPage: (pageName) => ipcRenderer.invoke("fetch-page", pageName),
  //API สำหรับ "ดึง" ค่า settings ทั้งหมด
  invokeGetSettings: () => ipcRenderer.invoke("get-settings"), // <--- แก้ชื่อฟังก์ชัน และชื่อช่องสัญญาณ

  // 2. API สำหรับ "บันทึก" ค่า settings
  invokeSaveSettings: (settingsObject) =>
    ipcRenderer.invoke("save-settings", settingsObject),
});
