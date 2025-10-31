// page/system_params.js

// ฟังก์ชันนี้จะทำงานหลังจากที่ HTML โหลดเสร็จแล้ว
async function initSystemParams() {
    console.log('system_params.js loaded');
    
    // 1. อ้างอิงถึง Form และ Input ต่างๆ
    const form = document.querySelector('.page-form');
    const companyNameInput = document.getElementById('company-name');
    const companyAddressInput = document.getElementById('company-address');
    const companyPhoneInput = document.getElementById('company-phone');
    const companyTaxIdInput = document.getElementById('company-tax-id');
    const docPrefixInput = document.getElementById('doc-prefix');
    const docNumberInput = document.getElementById('doc-number');
    const systemDateInput = document.getElementById('system-date');
    const purchaseRightsInput = document.getElementById('purchase-rights');

    // 2. ดึงข้อมูลเก่ามาแสดง (GET)
    try {
        console.log('Requesting settings from backend...');
        // เรียก API "ดึง" ข้อมูลจาก Backend (index.js)
        const response = await window.electronAPI.invokeGetSettings();

        if (response.success) {
            console.log('Settings received:', response.settings);
            const settings = response.settings;
            // เอาข้อมูลไปใส่ใน <input>
            companyNameInput.value = settings.company_name;
            companyAddressInput.value = settings.company_address;
            companyPhoneInput.value = settings.company_phone;
            companyTaxIdInput.value = settings.company_tax_id;
            docPrefixInput.value = settings.doc_prefix;
            docNumberInput.value = settings.last_doc_number;
            systemDateInput.value = settings.system_date; // อาจต้องแปลง format วันที่
            purchaseRightsInput.value = settings.purchase_rights_days;
        } else {
            alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + response.message);
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาดรุนแรง (GET): ' + err.message);
    }

    // 3. ตั้งค่าการ "บันทึก" ข้อมูล (POST/PUT)
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // กันหน้าโหลดใหม่
        console.log('Form submitted. Saving settings...');

        // 3.1 รวบรวมข้อมูลจาก <input> กลับมาเป็น Object
        const settingsToSave = {
            company_name: companyNameInput.value,
            company_address: companyAddressInput.value,
            company_phone: companyPhoneInput.value,
            company_tax_id: companyTaxIdInput.value,
            doc_prefix: docPrefixInput.value,
            last_doc_number: docNumberInput.value,
            system_date: systemDateInput.value, // อาจต้องแปลง format วันที่
            purchase_rights_days: purchaseRightsInput.value
        };

        // 3.2 เรียก API "บันทึก" ข้อมูลไปหา Backend (index.js)
        try {
            const response = await window.electronAPI.invokeSaveSettings(settingsToSave);

            if (response.success) {
                alert('บันทึกข้อมูลสำเร็จ!');
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึก: ' + response.message);
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดรุนแรง (SAVE): ' + err.message);
        }
    });
}

// 4. สั่งให้ฟังก์ชันทำงาน
// (เราต้องเช็กให้มั่นใจว่า HTML โหลดเสร็จแล้วจริงๆ)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSystemParams);
} else {
    initSystemParams(); // ถ้า HTML โหลดเสร็จแล้ว
}