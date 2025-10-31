// renderer.js (เวอร์ชันแก้ไขแล้ว)
document.addEventListener('DOMContentLoaded', () => {
  
  const cancelButton = document.getElementById('cancel-button');
  cancelButton.addEventListener('click', () => {
    window.electronAPI.sendCancelClick();
  });

  // --- 1. อ้างอิงตัวแปร (เพิ่ม errorMessage) ---
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message'); // <-- เพิ่มบรรทัดนี้

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // กันหน้าเว็บโหลดใหม่
    
    // (Bonus) ซ่อน Error เก่าก่อนส่ง
    errorMessage.textContent = ''; 

    const username = usernameInput.value;
    const password = passwordInput.value;

    // ส่งข้อมูลไปให้ index.js (ผ่าน preload.js)
    window.electronAPI.sendLoginRequest(username, password);
  });

  // --- 2. แก้ไข onLoginFail ---
  // ดักฟังว่า index.js ส่งสัญญาณ 'login-fail' กลับมาหรือไม่
  window.electronAPI.onLoginFail(() => {
    // เปลี่ยนจาก 'alert' มาเป็นแสดงผลใน HTML
    errorMessage.textContent = 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง!'; // <-- แก้ไขบรรทัดนี้
  });

  // --- 3. (Bonus) ซ่อน Error เมื่อ user พิมพ์ใหม่ ---
  usernameInput.addEventListener('input', () => {
    errorMessage.textContent = '';
  });
  passwordInput.addEventListener('input', () => {
    errorMessage.textContent = '';
  });

});