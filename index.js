// main: index.js
const { app, BrowserWindow, ipcMain } = require('electron'); // <-- ตรงนี้ถูกต้องแล้ว
const path = require('path');

// === เพิ่มส่วนนี้เข้าไปครับ ===
// ดักฟังสัญญาณ 'cancel-button-clicked' ที่ส่งมาจาก preload.js
ipcMain.on('cancel-button-clicked', () => {
  console.log('ได้รับสัญญาณยกเลิก... กำลังปิดโปรแกรม');
  app.quit(); // สั่งปิดโปรแกรม
});
// =========================

// ฟังก์ชันสำหรับสร้างหน้าต่างโปรแกรม
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800, // กว้าง
    height: 600, // สูง
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') 
    }
  });

  // ให้หน้าต่างนี้โหลดไฟล์ login.html
  win.loadFile('login.html');
};

// เมื่อ Electron พร้อมทำงาน ให้เรียกฟังก์ชัน createWindow
app.whenReady().then(() => {
  createWindow();

  // สำหรับ macOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ปิดโปรแกรมเมื่อหน้าต่างทั้งหมดถูกปิด (สำหรับ Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});