document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // ตรวจสอบว่าผู้ใช้คือ Admin หรือไม่
    if (email === 'admin@nu.com' && password === '00000') {
        // บันทึกชื่อผู้ใช้สำหรับ Admin และนำไปหน้าแดชบอร์ดของ Admin
        localStorage.setItem('username', 'Admin');
        window.location.href = '/index_admin.html';
    } else {
        alert('Login failed: Invalid credentials for admin.');
    }
});

// ตรวจสอบฟอร์มก่อนส่ง
document.getElementById('customerForm').onsubmit = function () {
    const requiredFields = this.querySelectorAll('[required]');
    for (let field of requiredFields) {
        if (!field.value) {
            alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            field.focus();
            return false; // ยกเลิกการส่งฟอร์ม
        }
    }
    return true; // อนุญาตให้ส่งฟอร์ม
};