// === ใช้ 'window.load' event ===
// Script นี้จะทำงานหลังจากที่ทุกอย่าง (รวมถึง lucide.min.js จาก CDN) โหลดเสร็จ 100%
window.addEventListener('load', () => {

    const contentArea = document.getElementById('content-area');
    const sidebar = document.querySelector('.sidebar-nav');
    const logoutButton = document.getElementById('logout-button');

    // --- 0. [FIX] เรียก lucide.createIcons() ที่นี่! ---
    // นี่คือจุดที่ปลอดภัยที่สุด: 'window' โหลดแล้ว, 'lucide' (จาก CDN) ก็โหลดแล้ว
    // นี่จะสร้างไอคอนใน Sidebar
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('Lucide icons created for sidebar.');
        } else {
            // Error นี้ไม่ควรเกิดขึ้นแล้ว ถ้าเน็ตไม่ล่ม
            console.error('Lucide is still not defined even after window.load!');
            contentArea.innerHTML = `<h1 class="error">Critical Error</h1><p>Icon library (lucide) failed to load from CDN. Check internet connection.</p>`;
        }
    } catch (e) {
        console.error('Error creating sidebar icons:', e);
    }

    // --- 1. โหลดหน้าแรก (หน้ากำหนดข้อมูล) ---
    // (จะเรียกฟังก์ชัน loadPage ที่อยู่ข้างล่าง)
    loadPage('setup_menu');

    // --- 2. จัดการการคลิก Sidebar ---
    sidebar.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-button');
        if (!button) return; // ไม่ได้คลิกปุ่ม

        const activeButton = sidebar.querySelector('.nav-button.active');
        if (activeButton) activeButton.classList.remove('active');

        button.classList.add('active');
        const pageName = button.dataset.page;
        loadPage(pageName);
    });

    // --- 3. จัดการการคลิก "ภายใน" Content Area ---
    contentArea.addEventListener('click', (event) => {
        const button = event.target.closest('[data-page]');
        if (button) {
            const pageName = button.dataset.page;
            loadPage(pageName);
        }
    });

    // --- 4. จัดการปุ่ม Logout ---
    logoutButton.addEventListener('click', () => {
        window.electronAPI.sendLogoutRequest();
    });

    // --- 5. ฟังก์ชันโหลดหน้า (ผ่าน Preload) ---
    async function loadPage(pageName) {
        if (!pageName) return;
        
        try {
            // ขอดูหน้าเพจจาก index.js (ผ่าน preload)
            const htmlContent = await window.electronAPI.invokeFetchPage(pageName);
            contentArea.innerHTML = htmlContent;
            
            // เรียกใช้ Lucide Icons อีกครั้งสำหรับไอคอนที่โหลดมาใหม่
            // 'lucide' (จาก CDN) ควรจะพร้อมใช้งาน 100%
            if (typeof lucide !== 'undefined') {
                lucide.createIcons(); 
                console.log(`Lucide icons created for ${pageName}.`);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            contentArea.innerHTML = `<h1 class="error">Error loading page</h1><p>${error.message}</p>`;
        }
    }
}); // <-- ปิด window.addEventListener('load', ...)

