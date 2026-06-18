window.loadDebtsData = async function() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const role = user.role || user.Role;
    const isAdminOrStaff = (role === 'Admin' || role === 'Staff' || role === 'MaintenanceStaff');

    const adminSection = document.getElementById('debts-admin-section');
    const studentSection = document.getElementById('debts-student-section');

    if (isAdminOrStaff) {
        if (adminSection) adminSection.style.display = 'block';
        if (studentSection) studentSection.style.display = 'none';

        try {
            const debts = await apiRequest('Debts');
            renderDebtsList(debts);
        } catch (error) {
            showToast('Lỗi tải danh sách công nợ: ' + error.message, 'error');
        }
    } else {
        if (adminSection) adminSection.style.display = 'none';
        if (studentSection) studentSection.style.display = 'block';

        try {
            const studentId = user.id || user.Id;
            const debt = await apiRequest(`Debts/student/${studentId}`);
            renderStudentDebtDetail(debt, 'debts-student-detail-container');
        } catch (error) {
            showToast('Lỗi tải công nợ cá nhân: ' + error.message, 'error');
        }
    }
}

function renderDebtsList(debts) {
    const tableBody = document.getElementById('debts-table-body');
    if (!tableBody) return;

    if (!debts || debts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center-empty">Không có dữ liệu công nợ sinh viên.</td></tr>`;
        return;
    }

    tableBody.innerHTML = debts.map(debt => {
        return `
            <tr>
                <td><strong>#${debt.userId}</strong></td>
                <td>
                    <div class="student-name-main">${escapeHtml(debt.fullName)}</div>
                    <small class="text-muted-desc">${escapeHtml(debt.username)}</small>
                </td>
                <td>${escapeHtml(debt.email || 'N/A')}</td>
                <td class="text-right">${formatCurrency(debt.totalInvoiceAmount)}</td>
                <td class="text-right text-success">+ ${formatCurrency(debt.totalPaidAmount)}</td>
                <td class="text-right text-danger fw-semibold">${formatCurrency(debt.remainingDebt)}</td>
                <td>
                    <button class="btn btn-xs btn-outline-primary" onclick="viewStudentDebtDetail(${debt.userId})">
                        <i class="fas fa-info-circle"></i> Xem chi tiết
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

window.viewStudentDebtDetail = async function(studentId) {
    try {
        // Calls GET /api/Debts/student/{studentId}
        const debt = await apiRequest(`Debts/student/${studentId}`);
        renderStudentDebtDetail(debt, 'debts-detail-modal-body');
        const modal = document.getElementById('modal-debt-detail');
        if (modal) modal.classList.add('active');
    } catch (error) {
        showToast('Không tìm thấy sinh viên hoặc lỗi: ' + error.message, 'error');
    }
}

function renderStudentDebtDetail(debt, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const unpaidInvoices = debt.unpaidInvoices || [];
    let unpaidRows = '';

    if (unpaidInvoices.length === 0) {
        unpaidRows = `<tr><td colspan="5" class="text-center-empty">Không có hóa đơn chưa thanh toán nào.</td></tr>`;
    } else {
        unpaidRows = unpaidInvoices.map(inv => {
            const statusBadge = getInvoiceStatusBadge(inv.status);
            return `
                <tr>
                    <td><strong>#${inv.id}</strong></td>
                    <td>
                        <div class="invoice-title-cell">${escapeHtml(inv.title)}</div>
                        <small class="text-muted-desc">${escapeHtml(inv.description || 'Không có mô tả')}</small>
                    </td>
                    <td class="text-right amount-cell">${formatCurrency(inv.amount)}</td>
                    <td>${formatDate(inv.dueDate)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }

    container.innerHTML = `
        <div class="debt-profile-header">
            <div class="profile-meta">
                <h3>${escapeHtml(debt.fullName)}</h3>
                <div class="meta-row">
                    <span><i class="fas fa-user-circle"></i> Mã SV: <strong>#${debt.userId}</strong></span>
                    <span><i class="fas fa-envelope"></i> Email: ${escapeHtml(debt.email || 'N/A')}</span>
                </div>
            </div>
            
            <div class="debt-stats-summary">
                <div class="stat-box stat-box-blue">
                    <span class="stat-label">Tổng hóa đơn</span>
                    <span class="stat-value">${formatCurrency(debt.totalInvoiceAmount)}</span>
                </div>
                <div class="stat-box stat-box-green">
                    <span class="stat-label">Tổng đã thanh toán</span>
                    <span class="stat-value text-success">${formatCurrency(debt.totalPaidAmount)}</span>
                </div>
                <div class="stat-box stat-box-red">
                    <span class="stat-label">Số tiền còn nợ</span>
                    <span class="stat-value text-danger fw-bold">${formatCurrency(debt.remainingDebt)}</span>
                </div>
            </div>
        </div>
        
        <div class="unpaid-invoices-section">
            <h4 class="section-title"><i class="fas fa-clock text-warning"></i> Danh sách hóa đơn chưa thanh toán</h4>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th style="width: 80px">Mã HĐ</th>
                            <th>Nội dung hóa đơn</th>
                            <th class="text-right" style="width: 140px">Số tiền</th>
                            <th style="width: 140px">Hạn thanh toán</th>
                            <th style="width: 140px">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${unpaidRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const debtSearchForm = document.getElementById('debt-search-form');
    if (debtSearchForm) {
        debtSearchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentIdInput = document.getElementById('debt-student-id-input');
            const studentId = parseInt(studentIdInput.value.trim());

            if (isNaN(studentId)) {
                showToast('Mã sinh viên phải là dạng số nguyên.', 'warning');
                return;
            }

            await viewStudentDebtDetail(studentId);
        });
    }
});
