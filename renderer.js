// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  
  const cancelButton = document.getElementById('cancel-button');
  cancelButton.addEventListener('click', () => {
    window.electronAPI.sendCancelClick();
  });

  // === แก้ไขส่วนนี้ ===
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // กันหน้าเว็บโหลดใหม่
    
    const username = usernameInput.value;
    const password = passwordInput.value;

    // ส่งข้อมูลไปให้ index.js (ผ่าน preload.js)
    window.electronAPI.sendLoginRequest(username, password);
  });

  // === เพิ่มส่วนนี้ ===
  // ดักฟังว่า index.js ส่งสัญญาณ 'login-fail' กลับมาหรือไม่
  window.electronAPI.onLoginFail(() => {
    alert('ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง!');
  });

});