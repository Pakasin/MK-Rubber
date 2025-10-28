// renderer.js (ทำงานในหน้า login.html)

// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', () => {
  
  // หาปุ่ม "ยกเลิก"
  const cancelButton = document.getElementById('cancel-button');

  // ดักฟังเหตุการณ์เมื่อปุ่ม "ยกเลิก" ถูกคลิก
  cancelButton.addEventListener('click', () => {
    console.log('ปุ่มยกเลิกถูกคลิก!');
    
    // เรียกใช้ฟังก์ชันที่เราสร้างไว้ใน preload.js
    // เพื่อส่งสัญญาณไปหา Main Process (index.js)
    window.electronAPI.sendCancelClick();
  });

  // (ส่วนของปุ่ม "ตกลง" เราจะทำทีหลัง)
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // กันหน้าเว็บโหลดใหม่
    console.log('ปุ่มตกลงถูกคลิก!');
    // เดี๋ยวเราจะเพิ่มโค้ดเช็ครหัสผ่านตรงนี้
  });

});