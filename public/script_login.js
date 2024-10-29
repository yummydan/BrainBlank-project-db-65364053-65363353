document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    // ตรวจสอบว่าแต่ละอิลิเมนต์มีอยู่หรือไม่
    console.log("Container:", container);
    console.log("Register Button:", registerBtn);
    console.log("Login Button:", loginBtn);

    if (registerBtn && loginBtn) {
        registerBtn.addEventListener('click', () => {
            container.classList.add("active");
        });

        loginBtn.addEventListener('click', () => {
            container.classList.remove("active");
        });
    } else {
        console.error("ไม่พบปุ่ม register หรือ login");
    }
});


// Login form
document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (result.success) {
        // Save user's name to local storage and redirect
        localStorage.setItem('username', result.name);
        window.location.href = '/index_diagram.html';
    } else {
        alert('Login failed: ' + result.message);
    }
});



// ฟอร์ม Register
document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();
    if (result.success) {
        alert('Registration successful!');
    } else {
        alert('Registration failed: ' + result.message);
    }
});


