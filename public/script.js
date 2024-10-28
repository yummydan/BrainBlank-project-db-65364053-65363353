let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
})

searchBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
})

function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
}

menuBtnChange();

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (username) {
        // สร้างแท็ก <p> สำหรับแสดงข้อความต้อนรับ
        const welcomeMessage = document.createElement('p');
        welcomeMessage.textContent = `Hello, ${username}! Welcome to your page.`;

        // ค้นหา logout-button และแทรกข้อความต้อนรับไว้ด้านบน
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            // แทรกข้อความต้อนรับด้านบนปุ่ม logout-button
            logoutButton.parentNode.insertBefore(welcomeMessage, logoutButton);
        } else {
            console.error('ไม่พบ logout-button ในหน้าเว็บ');
        }
    }
});
