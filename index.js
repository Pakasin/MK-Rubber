// main: index.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

console.log("--- [Backend] index.js is starting... ---"); // <-- LOG 1

// === 1. เพิ่ม: Import ตัวเชื่อมต่อ Database ===
const { Pool } = require("pg");

// === 2. เพิ่ม: ตั้งค่าการเชื่อมต่อ Database ===
// (ใช้วิธีใหม่นี้แทน)
// 1. Connection String
// นี่คือ Connection String ที่ถูกต้องสำหรับ IPv4 Pooler
let connectionString =
  "postgresql://postgres.movfghkrghhgleoinjln:datamkrubber1@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

// 3. สร้าง Pool ด้วย Connection String
const pool = new Pool({
  connectionString: connectionString,
  // family: 4,  <-- ไม่จำเป็นต้องใช้แล้ว เพราะ Pooler นี้รองรับ IPv4
  connectionTimeoutMillis: 5000, // <-- ถ้าต่อไม่ได้ใน 5 วิ ให้โยน Error (แก้ค้าง)
});

// เพิ่ม: ดักจับ Error ที่การเชื่อมต่อ Pool โดยตรง
pool.on("error", (err, client) => {
  console.error("[Backend] POOL ERROR: Error on idle client", err);
  process.exit(-1); // ออกจากโปรแกรมถ้า Pool พัง
});

console.log("[Backend] Pool configured with IPv4 Pooler."); // <-- LOG 2

let loginWin;

ipcMain.on("cancel-button-clicked", () => {
  console.log("ได้รับสัญญาณยกเลิก... กำลังปิดโปรแกรม");
  app.quit();
});

// === 3. แก้ไข: เปลี่ยน Logic การ Login ทั้งหมด ===
ipcMain.on("login-request", async (event, username, password) => {
  console.log(`[Backend] ได้รับคำขอล็อกอิน: User: ${username}`); // <-- LOG 5 (ถ้ามาถึงนี่)

  // คำสั่ง SQL เช็ก Username และ รหัสผ่านที่เข้ารหัส (crypt)
  // [FIX]: แก้ไข SQL ให้เป็นบรรทัดเดียวเพื่อลบอักขระที่มองไม่เห็น (แก้ปัญหา syntax error)
  const queryText = "SELECT user_id, username, full_name, role FROM users WHERE username = $1 AND password_hash = crypt($2, password_hash)";

  try {
    // รันคำสั่ง SQL
    console.log("[Backend] Connecting to database for login...");
    const result = await pool.query(queryText, [username, password]);
    console.log("[Backend] Query successful.");

    if (result.rows.length > 0) {
      // ถ้าเจอ 1 แถว = Login สำเร็จ
      console.log(`[Backend] ล็อกอินสำเร็จ: ${username}`);
      createMainWindow();
      loginWin.close();
    } else {
      // ถ้าไม่เจอ = Login ล้มเหลว (ชื่อหรือรหัสผิด)
      console.log("[Backend] ล็อกอินล้มเหลว (ชื่อหรือรหัสผิด)");
      event.sender.send("login-fail");
    }
  } catch (err) {
    // ถ้า Database Error (เช่น ต่อเน็ตไม่ได้, config ผิด, timeout)
    console.error("[Backend] DATABASE ERROR:", err.message); // แสดง error message จริง
    event.sender.send("login-fail");
  }
});

// === 4. แก้ไข: รับคำสั่ง Logout จาก Sidebar ===
ipcMain.on("logout-request", () => {
  // ปิดการเชื่อมต่อ Database ก่อน
  pool.end(() => {
    console.log("[Backend] ปิดการเชื่อมต่อ Database และ Relaunch");
    app.relaunch(); // สั่งให้เริ่มโปรแกรมใหม่
    app.quit();
  });
});

// === 5. โหลดหน้า HTML ===
ipcMain.handle("fetch-page", async (event, pageName) => {
  console.log(`[Backend] Fetching page: ${pageName}`); // <-- LOG (เมื่อเปลี่ยนหน้า)
  try {
    const filePath = path.join(__dirname, "page", `${pageName}.html`);
    const data = await fs.promises.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(`Failed to read page: ${pageName}`, err);
    return `<h1 class="error">Error: Page not found</h1><p>Could not load ${pageName}.html</p>`;
  }
});

// === 6. API Backend สำหรับ "ดึง" ค่า Settings ===
ipcMain.handle("get-settings", async (event) => {
  console.log('[Backend] ได้รับคำขอ "ดึง" ข้อมูล Settings');
  try {
    // [FIX]: แก้ไข SQL ให้เป็นบรรทัดเดียว
    const result = await pool.query(
      "SELECT setting_key, setting_value FROM settings"
    );

    // แปลงผลลัพธ์จาก Array เป็น Object เพื่อให้หน้าร้านใช้ง่าย
    const settingsObject = result.rows.reduce((obj, item) => {
      obj[item.setting_key] = item.setting_value;
      return obj;
    }, {});

    return { success: true, settings: settingsObject };
  } catch (err) {
    console.error("[Backend] Error get-settings:", err.message);
    return { success: false, message: err.message };
  }
});

// === 7. เพิ่ม: API Backend สำหรับ "บันทึก" ค่า Settings ===
ipcMain.handle("save-settings", async (event, settingsObject) => {
  console.log('[Backend] ได้รับคำขอ "บันทึก" ข้อมูล Settings:', settingsObject);

  const client = await pool.connect(); // ยืมการเชื่อมต่อมา
  try {
    await client.query("BEGIN"); // เริ่ม Transaction

    // วนลูปอัปเดตทีละค่า
    for (const key in settingsObject) {
      const value = settingsObject[key];
      // [FIX]: แก้ไข SQL ให้เป็นบรรทัดเดียว
      await client.query(
        "UPDATE settings SET setting_value = $1 WHERE setting_key = $2",
        [value, key]
      );
    }

    await client.query("COMMIT"); // ยืนยันการเปลี่ยนแปลงทั้งหมด
    console.log("[Backend] บันทึก Settings สำเร็จ");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK"); // ยกเลิกทั้งหมดถ้ามี Error
    console.error("[Backend] Error save-settings:", err.message);
    return { success: false, message: err.message };
  } finally {
    client.release(); // คืนการเชื่อมต่อ
  }
});

// --- ส่วนฟังก์ชันสร้างหน้าต่าง (เหมือนเดิม) ---

const createMainWindow = () => {
  console.log("[Backend] Creating MainWindow...");
  const mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "main_preload.js"),
    },
  });
  mainWin.setMenu(null);
  mainWin.loadFile("main.html");
};

const createWindow = () => {
  console.log("[Backend] createWindow() is called."); // <-- LOG 4
  loginWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  loginWin.loadFile("login.html");
  loginWin.setMenu(null);
};

// --- ส่วนจัดการ App (แก้ไขเล็กน้อย) ---

app.whenReady().then(() => {
  console.log("[Backend] App is ready."); // <-- LOG 3
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // === 8. แก้ไข: ปิดการเชื่อมต่อ Database ก่อนปิดโปรแกรม ===
    console.log("[Backend] All windows closed, quitting app...");
    pool.end();
    app.quit();
  }
});

