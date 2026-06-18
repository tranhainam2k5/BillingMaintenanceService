window.loadInvoicesData = async function() {
    try {
        const invoices = await apiRequest('Invoices');
        renderInvoices(invoices);
        await populateInvoiceUserDropdown();
    } catch (error) {
        showToast('Không thể tải danh sách hóa đơn: ' + error.message, 'error');
    }
}

function renderInvoices(invoices) {
    const tableBody = document.getElementById('invoices-table-body');
    if (!tableBody) return;

    if (!invoices || invoices.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center-empty">Không tìm thấy hóa đơn nào.</td></tr>`;
        return;
    }

    tableBody.innerHTML = invoices.map(inv => {
        const statusBadge = getInvoiceStatusBadge(inv.status);
        const studentName = inv.user ? `${inv.user.fullName} (${inv.user.username})` : `Mã sinh viên #${inv.userId}`;
        const room = inv.user && inv.user.roomNumber ? `Phòng ${inv.user.roomNumber}` : 'Chưa xếp phòng';
        
        return `
            <tr>
                <td><strong>#${inv.id}</strong></td>
                <td>
                    <div class="invoice-title-cell">${escapeHtml(inv.title)}</div>
                    <small class="text-muted-desc">${escapeHtml(inv.description || 'Không có mô tả')}</small>
                </td>
                <td>
                    <div class="student-info-cell">
                        <span class="student-name">${escapeHtml(studentName)}</span>
                        <span class="student-room"><i class="fas fa-door-open"></i> ${escapeHtml(room)}</span>
                    </div>
                </td>
                <td class="text-right amount-cell">${formatCurrency(inv.amount)}</td>
                <td>${formatDate(inv.createdAt)}</td>
                <td>${formatDate(inv.dueDate)}</td>
                <td>${statusBadge}</td>
                <td>
                    ${inv.status !== 'Paid' ? `
                        <button class="btn btn-xs btn-primary-action" onclick="openPaymentFormForInvoice(${inv.id}, ${inv.amount}, '${escapeHtml(inv.title)}')">
                            <i class="fas fa-money-bill-wave"></i> Thu tiền
                        </button>
                    ` : `
                        <button class="btn btn-xs btn-disabled" disabled>
                            <i class="fas fa-check"></i> Đã đóng
                        </button>
                    `}
                </td>
            </tr>
        `;
    }).join('');
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

async function populateInvoiceUserDropdown() {
    const userSelects = [
        document.getElementById('invoice-user-id'),
        document.getElementById('debt-search-select') // Optional select for debt filter
    ];

    try {
        const debts = await apiRequest('Debts');
        if (debts) {
            userSelects.forEach(select => {
                if (!select) return;
                
                // Save original value to restore if possible
                const originalVal = select.value;
                select.innerHTML = select.id === 'invoice-user-id' 
                    ? '<option value="">-- Chọn sinh viên --</option>' 
                    : '<option value="">-- Tất cả sinh viên --</option>';
                
                debts.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.userId;
                    const roomInfo = student.roomNumber ? ` - Phòng ${student.roomNumber}` : '';
                    option.textContent = `${student.fullName} (${student.username})${roomInfo}`;
                    select.appendChild(option);
                });
                
                select.value = originalVal;
            });
        }
    } catch (error) {
        console.error('Lỗi nạp danh sách sinh viên vào dropdown:', error);
    }
}

// Redirect and prepopulate Payment form
window.openPaymentFormForInvoice = function(invoiceId, amount, title) {
    showScreen('payments-screen');
    const invoiceSelect = document.getElementById('payment-invoice-id');
    const amountInput = document.getElementById('payment-amount');
    
    if (invoiceSelect) {
        setTimeout(() => {
            invoiceSelect.value = invoiceId;
            if (amountInput) {
                amountInput.value = amount;
            }
        }, 150);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const createInvoiceForm = document.getElementById('create-invoice-form');
    if (createInvoiceForm) {
        createInvoiceForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userIdVal = document.getElementById('invoice-user-id').value;
            const title = document.getElementById('invoice-title').value.trim();
            const amountVal = document.getElementById('invoice-amount').value;
            const description = document.getElementById('invoice-description').value.trim();
            const dueDateVal = document.getElementById('invoice-due-date').value;
            const status = document.getElementById('invoice-status').value;

            if (!userIdVal || !title || !amountVal || !dueDateVal) {
                showToast('Vui lòng nhập đầy đủ các thông tin bắt buộc.', 'warning');
                return;
            }

            const userId = parseInt(userIdVal);
            const amount = parseFloat(amountVal);

            try {
                // Call POST /api/Invoices
                await apiRequest('Invoices', {
                    method: 'POST',
                    body: JSON.stringify({
                        userId,
                        title,
                        amount,
                        description,
                        dueDate: new Date(dueDateVal).toISOString(),
                        status: status || 'Unpaid'
                    })
                });

                showToast('Tạo hóa đơn mới thành công!', 'success');
                createInvoiceForm.reset();
                
                // Close Modal
                const modal = document.getElementById('modal-invoice');
                if (modal) modal.classList.remove('active');
                
                await loadInvoicesData();
            } catch (error) {
                showToast('Lỗi tạo hóa đơn: ' + error.message, 'error');
            }
        });
    }
});
