const API_BASE = '/api';

// Loading overlay control
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) overlay.classList.remove('hidden');
        else overlay.classList.add('hidden');
    }
}

// Toast Notifications helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'info') icon = 'fa-circle-info';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Parse JWT Token helper
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Token operations
function getToken() {
    return localStorage.getItem('jwt_token');
}

function setToken(token) {
    if (token) {
        localStorage.setItem('jwt_token', token);
        const payload = parseJwt(token);
        if (payload) {
            localStorage.setItem('user_profile', JSON.stringify(payload));
        }
    } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_profile');
    }
}

function getCurrentUser() {
    const profile = localStorage.getItem('user_profile');
    if (!profile) return null;
    try {
        const parsed = JSON.parse(profile);
        // Map JWT claims to readable properties
        return {
            id: parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || parsed.nameid,
            username: parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || parsed.unique_name,
            email: parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || parsed.email,
            role: parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || parsed.role
        };
    } catch {
        return null;
    }
}

// Format utilities
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Base fetch request wrapper
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        if (response.status === 401) {
            // Auto logout on unauthorized
            setToken(null);
            appInit();
            showToast('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 'error');
            throw new Error('Unauthorized');
        }
        
        if (response.status === 403) {
            showToast('Bạn không có quyền thực hiện thao tác này.', 'error');
            throw new Error('Forbidden');
        }
        
        // Handle empty bodies (e.g. DELETE requests)
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            let errMsg = 'Đã xảy ra lỗi hệ thống';
            if (contentType && contentType.includes('application/json')) {
                const errData = await response.json();
                errMsg = errData.message || errMsg;
            }
            showToast(errMsg, 'error');
            throw new Error(errMsg);
        }
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return null;
    } catch (err) {
        if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
            console.error('API Error:', err);
        }
        throw err;
    }
}

// HTTP helper shortcuts
const api = {
    get: (url) => apiCall(url, { method: 'GET' }),
    post: (url, data) => apiCall(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url, data) => apiCall(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url) => apiCall(url, { method: 'DELETE' }),
    
    // File upload support
    upload: async (url, formData) => {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE}${url}`, {
            method: 'POST',
            headers,
            body: formData
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Lỗi tải ảnh lên');
        }
        return await response.json();
    }
};

// Screen navigation management
function switchScreen(screenName) {
    // Toggle active classes on sidebar links
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-screen') === screenName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Toggle active classes on section views
    document.querySelectorAll('.screen-view').forEach(view => {
        if (view.id === `screen-${screenName}`) {
            view.classList.remove('hidden');
            view.classList.add('active');
        } else {
            view.classList.add('hidden');
            view.classList.remove('active');
        }
    });

    // Update Header title
    const titles = {
        dashboard: 'Dashboard Tổng Quan',
        contracts: 'Hợp Đồng Ký Túc Xá',
        invoices: 'Danh Sách Hóa Đơn',
        payments: 'Lịch Sử Giao Dịch',
        debts: 'Quản Lý Công Nợ Sinh Viên',
        maintenance: 'Yêu Cầu Sửa Chữa'
    };
    document.getElementById('screen-title').textContent = titles[screenName] || 'Hệ thống';

    // Trigger load functions for each screen if defined
    if (screenName === 'dashboard' && window.loadDashboardData) window.loadDashboardData();
    if (screenName === 'contracts' && window.loadContractsData) window.loadContractsData();
    if (screenName === 'invoices' && window.loadInvoicesData) window.loadInvoicesData();
    if (screenName === 'payments' && window.loadPaymentsData) window.loadPaymentsData();
    if (screenName === 'debts' && window.loadDebtsData) window.loadDebtsData();
    if (screenName === 'maintenance' && window.loadMaintenanceData) window.loadMaintenanceData();
}

// Global initialization check
function appInit() {
    const user = getCurrentUser();
    
    if (user) {
        // Show Portal, Hide Auth
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('portal-container').classList.remove('hidden');
        
        // Set user badge details
        document.getElementById('user-display-name').textContent = user.username;
        document.getElementById('user-display-role').textContent = user.role === 'Admin' ? 'Quản trị viên' : (user.role === 'Staff' ? 'Nhân viên' : 'Sinh viên');
        
        // Add class to body to control role-based displays (e.g. hiding items)
        document.body.className = '';
        document.body.classList.add(`role-${user.role}`);
        
        // Hide room indicator if not student
        const roomInd = document.querySelector('.user-room-indicator');
        if (user.role === 'Student') {
            roomInd.classList.remove('hidden');
            // Fetch contracts to find room
            api.get('/contracts').then(contracts => {
                if (contracts && contracts.length > 0) {
                    const active = contracts.find(c => c.status === 'Active');
                    if (active) {
                        document.getElementById('user-display-room').textContent = active.roomNumber;
                    }
                }
            }).catch(() => {});
        } else {
            roomInd.classList.add('hidden');
        }

        // Setup routing sidebar clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            // Remove previous listener to avoid stack duplicate
            item.onclick = (e) => {
                e.preventDefault();
                const screen = item.getAttribute('data-screen');
                switchScreen(screen);
            };
        });

        // Initialize default screen
        switchScreen('dashboard');
    } else {
        // Show Auth, Hide Portal
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('portal-container').classList.add('hidden');
        
        // Default login screen
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('register-screen').classList.add('hidden');
    }
}
