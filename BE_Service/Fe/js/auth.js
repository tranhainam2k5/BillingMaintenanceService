// Switch between Login and Register screens in Auth mode
document.getElementById('go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
});

document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('register-screen').classList.add('hidden');
});

// Handle Login Form Submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value;

    showLoading(true);
    try {
        const response = await api.post('/auth/login', {
            username: usernameInput,
            password: passwordInput
        });

        if (response && response.token) {
            setToken(response.token);
            showToast('Đăng nhập thành công!', 'success');
            appInit();
        } else {
            showToast('Đăng nhập thất bại. Vui lòng thử lại.', 'error');
        }
    } catch (err) {
        // Errors are already toasted in api.js
    } finally {
        showLoading(false);
    }
});

// Handle Register Form Submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const fullname = document.getElementById('register-fullname').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const role = document.getElementById('register-role').value;

    if (password.length < 6) {
        showToast('Mật khẩu phải tối thiểu 6 ký tự!', 'error');
        return;
    }

    showLoading(true);
    try {
        await api.post('/auth/register', {
            username,
            password,
            email,
            fullName: fullname,
            phoneNumber: phone,
            role
        });

        showToast('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
        
        // Clear form and switch to login view
        document.getElementById('register-form').reset();
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('register-screen').classList.add('hidden');
    } catch (err) {
        // Handled in api.js
    } finally {
        showLoading(false);
    }
});

// Handle Logout Button
document.getElementById('btn-logout').addEventListener('click', () => {
    setToken(null);
    showToast('Đã đăng xuất tài khoản.', 'info');
    appInit();
});
