// main: index.js
const { app, BrowserWindow, ipcMain } = require("electron"); // ลบ Menu ออก
const path = require("path");
const fs = require("fs"); // เพิ่ม File System

let loginWin;

ipcMain.on("cancel-button-clicked", () => {
  console.log("ได้รับสัญญาณยกเลิก... กำลังปิดโปรแกรม");
  app.quit();
});

ipcMain.on("login-request", (event, username, password) => {
  console.log(`ได้รับคำขอล็อกอิน: User: ${username}, Pass: ${password}`);

  if (username === "admin" && password === "1234") {
    console.log("ล็อกอินสำเร็จ!");
    createMainWindow();
    loginWin.close();
  } else {
    console.log("ล็อกอินล้มเหลว");
    event.sender.send("login-fail");
  }
});

// === เพิ่ม: รับคำสั่ง Logout จาก Sidebar ===
ipcMain.on("logout-request", () => {
  app.relaunch(); // สั่งให้เริ่มโปรแกรมใหม่
  app.quit();
});

// === เพิ่ม: ระบบโหลดหน้า HTML อย่างปลอดภัย ===
ipcMain.handle("fetch-page", async (event, pageName) => {
  try {
    // === FIX: แก้ไข Path ตรงนี้ครับ ===
    // โฟลเดอร์ของคุณชื่อ 'page' (ไม่มี s) แต่โค้ดเดิมอ้างอิง 'pages' (มี s)
    const filePath = path.join(__dirname, "page", `${pageName}.html`); // <--- แก้จาก 'pages' เป็น 'page'
    const data = await fs.promises.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(`Failed to read page: ${pageName}`, err);
    return `<h1 class="error">Error: Page not found</h1><p>Could not load ${pageName}.html</p>`;
  }
});

const createMainWindow = () => {
  const mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "main_preload.js"),
    },
  }); // === ลบ Menu Bar แบบเก่าออกทั้งหมด ===

  mainWin.setMenu(null); // ===================================
  mainWin.loadFile("main.html");
};

// ฟังก์ชันสำหรับหน้า Login (เหมือนเดิม)
const createWindow = () => {
  loginWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  loginWin.loadFile("login.html");
  loginWin.setMenu(null); // หน้า Login ก็ไม่ควรมีเมนู
};

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
