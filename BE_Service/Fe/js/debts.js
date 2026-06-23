const modalStudentDebt = document.getElementById('modal-student-debt');

async function loadDebtsData() {
    const user = getCurrentUser();
    if (!user || user.role === 'Student') return; // Admin/Staff only

    showLoading(true);
    try {
        const debts = await api.get('/debts');
        const tbody = document.getElementById('debts-table-body');
        tbody.innerHTML = '';

        if (debts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Không có sinh viên nào trong hệ thống</td></tr>';
            return;
        }

        debts.forEach(student => {
            const tr = document.createElement('tr');
            const totalDebtStr = formatCurrency(student.totalDebt);
            const hasDebtClass = student.totalDebt > 0 ? 'text-danger font-weight-bold' : 'text-muted';

            tr.innerHTML = `
                <td><strong>#SV${student.id}</strong></td>
                <td><strong>${student.fullName}</strong> (${student.username})</td>
                <td><span class="user-room-indicator"><i class="fa-solid fa-door-open"></i> ${student.roomNumber || 'Chưa nhận phòng'}</span></td>
                <td class="${hasDebtClass}">${totalDebtStr}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewStudentDebtDetails(${student.id}, '${student.fullName}')">
                        <i class="fa-solid fa-circle-info"></i> Chi tiết nợ
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

async function viewStudentDebtDetails(studentId, fullName) {
    document.getElementById('debt-student-name').textContent = fullName;
    const detailsTable = document.getElementById('student-debt-details-table');
    detailsTable.innerHTML = '';

    showLoading(true);
    try {
        const invoices = await api.get(`/debts/student/${studentId}`);
        
        if (invoices.length === 0) {
            detailsTable.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Sinh viên không có khoản nợ nào</td></tr>';
        } else {
            invoices.forEach(inv => {
                const tr = document.createElement('tr');
                const dueStr = formatDate(inv.dueDate);
                
                tr.innerHTML = `
                    <td><strong>#HĐ${inv.id}</strong></td>
                    <td>${inv.title}</td>
                    <td class="text-danger">${dueStr}</td>
                    <td>Tháng ${inv.month}/${inv.year}</td>
                    <td>${formatCurrency(inv.amount)}</td>
                    <td style="color: var(--success);">${formatCurrency(inv.amountPaid)}</td>
                    <td style="color: var(--danger); font-weight: 700;">${formatCurrency(inv.remainingDebt)}</td>
                `;
                detailsTable.appendChild(tr);
            });
        }

        modalStudentDebt.classList.remove('hidden');
    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

window.loadDebtsData = loadDebtsData;
window.viewStudentDebtDetails = viewStudentDebtDetails;
