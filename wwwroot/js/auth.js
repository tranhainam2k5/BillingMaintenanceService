document.addEventListener('DOMContentLoaded', () => {
    // Initial check: if already logged in, show dashboard
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
        showScreen('dashboard-screen');
    } else {
        showScreen('login-screen');
    }

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameField = document.getElementById('login-username');
            const passwordField = document.getElementById('login-password');

            const username = usernameField.value.trim();
            const password = passwordField.value;

            if (!username || !password) {
                showToast('Vui lòng nhập tên tài khoản và mật khẩu.', 'warning');
                return;
            }

            try {
                // calls POST /api/Auth/login
                const response = await apiRequest('Auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                });

                if (response && response.token) {
                    localStorage.setItem('token', response.token); // Save JWT token into localStorage
                    localStorage.setItem('user', JSON.stringify(response.user));
                    showToast('Đăng nhập thành công!', 'success');
                    
                    // Clear inputs
                    usernameField.value = '';
                    passwordField.value = '';
                    
                    showScreen('dashboard-screen');
                } else {
                    showToast('Không nhận được token từ máy chủ.', 'error');
                }
            } catch (error) {
                showToast(error.message || 'Đăng nhập thất bại.', 'error');
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value;
            const email = document.getElementById('register-email').value.trim();
            const fullName = document.getElementById('register-fullname').value.trim();
            const phoneNumber = document.getElementById('register-phone').value.trim();
            const role = document.getElementById('register-role').value;
            const roomNumber = document.getElementById('register-room').value.trim();

            if (!username || !password) {
                showToast('Tên tài khoản và mật khẩu là bắt buộc.', 'warning');
                return;
            }

            try {
                // calls POST /api/Auth/register
                await apiRequest('Auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        username,
                        password,
                        email: email || '',
                        fullName: fullName || '',
                        phoneNumber: phoneNumber || '',
                        role: role || 'Student',
                        roomNumber: roomNumber || null
                    })
                });

                showToast('Đăng ký thành công! Hãy đăng nhập bằng tài khoản mới.', 'success');
                
                // Clear and switch to login
                registerForm.reset();
                showScreen('login-screen');
                
                const loginUsername = document.getElementById('login-username');
                if (loginUsername) {
                    loginUsername.value = username;
                }
            } catch (error) {
                showToast(error.message || 'Đăng ký thất bại.', 'error');
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            showToast('Đã đăng xuất tài khoản.', 'info');
            showScreen('login-screen');
        });
    }
});
