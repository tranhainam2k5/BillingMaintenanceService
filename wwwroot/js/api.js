const API_BASE_URL = 'http://localhost:5220'; // Base URL

// Loading Spinner Management
let activeRequestsCount = 0;
function showLoader() {
    activeRequestsCount++;
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.add('active');
    }
}

function hideLoader() {
    activeRequestsCount--;
    if (activeRequestsCount <= 0) {
        activeRequestsCount = 0;
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.remove('active');
        }
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">${message}</div>
        <span class="toast-close">&times;</span>
    `;

    container.appendChild(toast);

    // Click to close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Centralized API Request Handler
async function apiRequest(endpoint, options = {}) {
    showLoader();
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Automatically send Authorization header if token exists
    }

    const url = `${API_BASE_URL}/api/${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            localStorage.clear();
            showToast('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', 'error');
            setTimeout(() => {
                showScreen('login-screen');
            }, 1500);
            throw new Error('Chưa đăng nhập hoặc phiên làm việc hết hạn.');
        }

        if (response.status === 403) {
            showToast('Bạn không có quyền thực hiện thao tác này.', 'error');
            throw new Error('Không có quyền truy cập.');
        }

        if (!response.ok) {
            let errorMessage = 'Đã xảy ra lỗi hệ thống.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.Message || JSON.stringify(errorData) || errorMessage;
            } catch (e) {
                try {
                    errorMessage = await response.text() || errorMessage;
                } catch (e2) {}
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    } catch (error) {
        console.error(`Error requesting endpoint [${endpoint}]:`, error);
        throw error;
    } finally {
        hideLoader();
    }
}

// Screen management for Single Page Application
function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    // Update user profile display in sidebar if logged in
    if (token && userJson) {
        const user = JSON.parse(userJson);
        const role = user.role || user.Role;
        updateSidebarForRole(role);
        
        // Show/hide Auth menu links
        const menuLogin = document.getElementById('menu-login');
        const menuRegister = document.getElementById('menu-register');
        if (menuLogin) menuLogin.style.display = 'none';
        if (menuRegister) menuRegister.style.display = 'none';

        const userDisplayName = document.getElementById('sidebar-user-name');
        if (userDisplayName) {
            userDisplayName.textContent = user.fullName || user.FullName || user.username || user.Username;
        }
        const userDisplayRole = document.getElementById('sidebar-user-role');
        if (userDisplayRole) {
            let roleText = 'Sinh viên';
            if (role === 'Admin') roleText = 'Quản trị viên';
            if (role === 'Staff') roleText = 'Nhân viên';
            if (role === 'MaintenanceStaff') roleText = 'Nhân viên Sửa chữa';
            userDisplayRole.textContent = roleText;
        }
        
        const sidebarUserBlock = document.getElementById('sidebar-user-block');
        if (sidebarUserBlock) sidebarUserBlock.style.display = 'flex';
        const sidebarFooterBlock = document.getElementById('sidebar-footer-block');
        if (sidebarFooterBlock) sidebarFooterBlock.style.display = 'block';
    } else {
        // Not logged in
        const menuLogin = document.getElementById('menu-login');
        const menuRegister = document.getElementById('menu-register');
        if (menuLogin) menuLogin.style.display = 'flex';
        if (menuRegister) menuRegister.style.display = 'flex';

        // Hide administrative/dashboard pages from guest
        const menuDashboard = document.getElementById('menu-dashboard');
        const menuInvoices = document.getElementById('menu-invoices');
        const menuPayments = document.getElementById('menu-payments');
        const menuDebts = document.getElementById('menu-debts');
        const menuMaintenance = document.getElementById('menu-maintenance');

        if (menuDashboard) menuDashboard.style.display = 'none';
        if (menuInvoices) menuInvoices.style.display = 'none';
        if (menuPayments) menuPayments.style.display = 'none';
        if (menuDebts) menuDebts.style.display = 'none';
        if (menuMaintenance) menuMaintenance.style.display = 'none';

        const sidebarUserBlock = document.getElementById('sidebar-user-block');
        if (sidebarUserBlock) sidebarUserBlock.style.display = 'none';
        const sidebarFooterBlock = document.getElementById('sidebar-footer-block');
        if (sidebarFooterBlock) sidebarFooterBlock.style.display = 'none';
    }

    // Highlight active menu link
    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(link => {
        if (link.getAttribute('data-screen') === screenId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Execute load functions for target screens
    if (token) {
        if (screenId === 'dashboard-screen' && typeof window.loadDashboardData === 'function') {
            window.loadDashboardData();
        } else if (screenId === 'invoices-screen' && typeof window.loadInvoicesData === 'function') {
            window.loadInvoicesData();
        } else if (screenId === 'payments-screen' && typeof window.loadPaymentsData === 'function') {
            window.loadPaymentsData();
        } else if (screenId === 'debts-screen' && typeof window.loadDebtsData === 'function') {
            window.loadDebtsData();
        } else if (screenId === 'maintenance-screen' && typeof window.loadMaintenanceData === 'function') {
            window.loadMaintenanceData();
        }
    }
}

// Show/Hide sidebar links based on User Role when logged in
function updateSidebarForRole(role) {
    const isAdminOrStaff = (role === 'Admin' || role === 'Staff' || role === 'MaintenanceStaff');
    
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuInvoices = document.getElementById('menu-invoices');
    const menuPayments = document.getElementById('menu-payments');
    const menuDebts = document.getElementById('menu-debts');
    const menuMaintenance = document.getElementById('menu-maintenance');
    
    if (menuDashboard) menuDashboard.style.display = 'flex';
    if (menuMaintenance) menuMaintenance.style.display = 'flex';
    
    if (isAdminOrStaff) {
        if (menuInvoices) menuInvoices.style.display = 'flex';
        if (menuPayments) menuPayments.style.display = 'flex';
        if (menuDebts) menuDebts.style.display = 'flex';
    } else {
        // Students don't need invoices, payments manager and debt search list (they see their own debt on dashboard)
        if (menuInvoices) menuInvoices.style.display = 'none';
        if (menuPayments) menuPayments.style.display = 'none';
        if (menuDebts) menuDebts.style.display = 'none';
    }
}

// Currency Formatting Helper
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Date Formatting Helper
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Global HTML Escaping Helper
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Global Badges Helpers
function getInvoiceStatusBadge(status) {
    let text = 'Chưa thanh toán';
    let className = 'status-unpaid';

    if (status === 'Paid') {
        text = 'Đã thanh toán';
        className = 'status-paid';
    } else if (status === 'Partial') {
        text = 'Thanh toán một phần';
        className = 'status-partial';
    }

    return `<span class="badge ${className}">${text}</span>`;
}

function getMaintenanceStatusBadge(status) {
    let text = 'Mới';
    let className = 'status-new';

    if (status === 'Đang xử lý' || status === 'InProgress') {
        text = 'Đang xử lý';
        className = 'status-inprogress';
    } else if (status === 'Hoàn thành' || status === 'Completed') {
        text = 'Hoàn thành';
        className = 'status-completed';
    }

    return `<span class="badge ${className}">${text}</span>`;
}

// Dashboard Data Loader for Admin / Student
window.loadDashboardData = async function() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const role = user.role || user.Role;
    const isAdminOrStaff = (role === 'Admin' || role === 'Staff' || role === 'MaintenanceStaff');

    const adminDashboard = document.getElementById('dashboard-admin-view');
    const studentDashboard = document.getElementById('dashboard-student-view');

    if (isAdminOrStaff) {
        if (adminDashboard) adminDashboard.style.display = 'block';
        if (studentDashboard) studentDashboard.style.display = 'none';

        try {
            // Fetch stats in parallel
            const [invoices, payments, debts, requests] = await Promise.all([
                apiRequest('Invoices').catch(() => []),
                apiRequest('Payments').catch(() => []),
                apiRequest('Debts').catch(() => []),
                apiRequest('MaintenanceRequests').catch(() => [])
            ]);

            // Calculate stats
            const totalInvoices = invoices.length;
            const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
            const totalDebts = debts.reduce((sum, d) => sum + d.remainingDebt, 0);
            const totalRequests = requests.length;
            const inProgressRequests = requests.filter(r => r.status === 'Đang xử lý' || r.status === 'InProgress').length;
            const completedRequests = requests.filter(r => r.status === 'Hoàn thành' || r.status === 'Completed').length;

            // Render to DOM
            document.getElementById('stat-total-invoices').textContent = totalInvoices;
            document.getElementById('stat-total-collected').textContent = formatCurrency(totalCollected);
            document.getElementById('stat-total-debts').textContent = formatCurrency(totalDebts);
            document.getElementById('stat-total-requests').textContent = totalRequests;
            document.getElementById('stat-requests-inprogress').textContent = inProgressRequests;
            document.getElementById('stat-requests-completed').textContent = completedRequests;

            // Render recent items
            renderRecentInvoices(invoices.slice(-5).reverse());
            renderRecentRequests(requests.slice(-5).reverse());
        } catch (error) {
            showToast('Lỗi tải dữ liệu thống kê: ' + error.message, 'error');
        }
    } else {
        if (adminDashboard) adminDashboard.style.display = 'none';
        if (studentDashboard) studentDashboard.style.display = 'block';

        try {
            const studentId = user.id || user.Id;
            const debt = await apiRequest(`Debts/student/${studentId}`);

            document.getElementById('student-remaining-debt').textContent = formatCurrency(debt.remainingDebt);
            document.getElementById('student-total-invoices').textContent = formatCurrency(debt.totalInvoiceAmount);
            document.getElementById('student-total-paid').textContent = formatCurrency(debt.totalPaidAmount);

            // Render unpaid invoices for the student
            const unpaidList = document.getElementById('student-unpaid-invoices-body');
            if (unpaidList) {
                const unpaid = debt.unpaidInvoices || [];
                if (unpaid.length === 0) {
                    unpaidList.innerHTML = '<tr><td colspan="4" class="text-center-empty"><i class="fas fa-check-circle text-success"></i> Bạn đã hoàn thành tất cả hóa đơn!</td></tr>';
                } else {
                    unpaidList.innerHTML = unpaid.map(inv => `
                        <tr>
                            <td><strong>#${inv.id}</strong></td>
                            <td>
                                <div class="invoice-title-cell">${escapeHtml(inv.title)}</div>
                                <small class="text-muted-desc">${escapeHtml(inv.description || 'Không có mô tả')}</small>
                            </td>
                            <td class="text-right amount-cell text-danger fw-semibold">${formatCurrency(inv.amount)}</td>
                            <td>${formatDate(inv.dueDate)}</td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            showToast('Lỗi tải thống kê cá nhân: ' + error.message, 'error');
        }
    }
}

function renderRecentInvoices(invoices) {
    const el = document.getElementById('recent-invoices-list');
    if (!el) return;
    if (invoices.length === 0) {
        el.innerHTML = '<div class="list-empty">Không có hóa đơn gần đây.</div>';
        return;
    }
    el.innerHTML = invoices.map(inv => `
        <div class="activity-item">
            <div class="activity-icon bg-blue-light"><i class="fas fa-file-invoice-dollar"></i></div>
            <div class="activity-details">
                <div class="activity-title">${escapeHtml(inv.title)}</div>
                <div class="activity-meta">Mã SV #${inv.userId} | ${formatCurrency(inv.amount)} | ${getInvoiceStatusBadge(inv.status)}</div>
            </div>
        </div>
    `).join('');
}

function renderRecentRequests(requests) {
    const el = document.getElementById('recent-requests-list');
    if (!el) return;
    if (requests.length === 0) {
        el.innerHTML = '<div class="list-empty">Không có yêu cầu sửa chữa gần đây.</div>';
        return;
    }
    el.innerHTML = requests.map(req => `
        <div class="activity-item">
            <div class="activity-icon bg-yellow-light"><i class="fas fa-tools"></i></div>
            <div class="activity-details">
                <div class="activity-title">${escapeHtml(req.title)} (${escapeHtml(req.roomNumber)})</div>
                <div class="activity-meta">Trạng thái: ${getMaintenanceStatusBadge(req.status)}</div>
            </div>
        </div>
    `).join('');
}

function getInvoiceStatusBadge(status) {
    let text = 'Chưa thanh toán';
    let className = 'status-unpaid';

    if (status === 'Paid') {
        text = 'Đã thanh toán';
        className = 'status-paid';
    } else if (status === 'Partial') {
        text = 'Thanh toán một phần';
        className = 'status-partial';
    }

    return `<span class="badge ${className}">${text}</span>`;
}

function getMainMaintenanceStatusBadge(status) {
    return getMaintenanceStatusBadge(status);
}
