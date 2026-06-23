const modalInvoice = document.getElementById('modal-invoice');
const btnAddInvoice = document.getElementById('btn-add-invoice');
const statusFilter = document.getElementById('invoice-filter-status');

if (btnAddInvoice) {
    btnAddInvoice.addEventListener('click', async () => {
        await populateStudentDropdowns();
        
        // Preset month and year
        const now = new Date();
        document.getElementById('invoice-month').value = now.getMonth() + 1;
        document.getElementById('invoice-year').value = now.getFullYear();
        
        // Preset due date (15 days from now)
        const due = new Date();
        due.setDate(due.getDate() + 15);
        document.getElementById('invoice-duedate').value = due.toISOString().split('T')[0];

        modalInvoice.classList.remove('hidden');
    });
}

if (statusFilter) {
    statusFilter.addEventListener('change', () => {
        loadInvoicesData();
    });
}

// Auto calculate sum
const roomInput = document.getElementById('invoice-room-fee');
const elecInput = document.getElementById('invoice-electricity-fee');
const waterInput = document.getElementById('invoice-water-fee');
const serviceInput = document.getElementById('invoice-service-fee');
const amountInput = document.getElementById('invoice-amount');

function calculateTotal() {
    const room = parseFloat(roomInput.value) || 0;
    const elec = parseFloat(elecInput.value) || 0;
    const water = parseFloat(waterInput.value) || 0;
    const service = parseFloat(serviceInput.value) || 0;
    amountInput.value = room + elec + water + service;
}

if (roomInput) {
    roomInput.addEventListener('input', calculateTotal);
    elecInput.addEventListener('input', calculateTotal);
    waterInput.addEventListener('input', calculateTotal);
    serviceInput.addEventListener('input', calculateTotal);
}

// Handle invoice form submission
document.getElementById('invoice-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('invoice-student-id').value;
    const title = document.getElementById('invoice-title').value.trim();
    const description = document.getElementById('invoice-description').value.trim();
    const amount = document.getElementById('invoice-amount').value;
    const roomFee = roomInput.value || 0;
    const electricityFee = elecInput.value || 0;
    const waterFee = waterInput.value || 0;
    const serviceFee = serviceInput.value || 0;
    const month = document.getElementById('invoice-month').value;
    const year = document.getElementById('invoice-year').value;
    const duedate = document.getElementById('invoice-duedate').value;

    showLoading(true);
    try {
        await api.post('/invoices', {
            userId: parseInt(userId),
            title,
            description,
            amount: parseFloat(amount),
            roomFee: parseFloat(roomFee),
            electricityFee: parseFloat(electricityFee),
            waterFee: parseFloat(waterFee),
            serviceFee: parseFloat(serviceFee),
            month: parseInt(month),
            year: parseInt(year),
            dueDate: new Date(duedate).toISOString(),
            status: "Unpaid"
        });

        showToast('Hóa đơn đã được tạo thành công.', 'success');
        modalInvoice.classList.add('hidden');
        document.getElementById('invoice-form').reset();
        await loadInvoicesData();
    } catch (err) {
        // Handled
    } finally {
        showLoading(false);
    }
});

async function loadInvoicesData() {
    const user = getCurrentUser();
    if (!user) return;

    const statusVal = statusFilter ? statusFilter.value : '';
    let endpoint = `/invoices?status=${statusVal}`;

    showLoading(true);
    try {
        const invoices = await api.get(endpoint);
        const tbody = document.getElementById('invoices-table-body');
        tbody.innerHTML = '';

        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Không có hóa đơn nào</td></tr>';
            return;
        }

        invoices.forEach(inv => {
            const tr = document.createElement('tr');
            const totalStr = formatCurrency(inv.amount);
            const dueStr = formatDate(inv.dueDate);
            const statusClass = inv.status.toLowerCase();
            
            let statusLabel = 'Chưa thanh toán';
            if (inv.status === 'Paid') statusLabel = 'Đã thanh toán';
            if (inv.status === 'Partial') statusLabel = 'Thanh toán một phần';
            if (inv.status === 'Overdue') statusLabel = 'Quá hạn';

            let actionsHtml = '';
            
            // Student: Can pay unpaid/partial/overdue bills
            if (user.role === 'Student') {
                if (inv.status !== 'Paid') {
                    actionsHtml = `<button class="btn btn-success btn-sm" onclick="openPayModal(${inv.id}, '${inv.title}', ${inv.amount}, '${inv.status}')"><i class="fa-solid fa-credit-card"></i> Trả tiền</button>`;
                } else {
                    actionsHtml = `<span style="color: var(--success); font-size: 13px;"><i class="fa-solid fa-circle-check"></i> Đã hoàn thành</span>`;
                }
            } else {
                // Admin/Staff: Can delete
                actionsHtml = `<button class="btn btn-danger btn-sm" onclick="deleteInvoice(${inv.id})"><i class="fa-solid fa-trash"></i> Xóa</button>`;
            }

            tr.innerHTML = `
                <td><strong>#HĐ${inv.id}</strong></td>
                <td>${inv.user ? inv.user.fullName : 'N/A'}</td>
                <td>
                    <div style="font-weight: 600;">${inv.title}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${inv.description || ''}</div>
                </td>
                <td><strong>${totalStr}</strong></td>
                <td>Tháng ${inv.month}/${inv.year}</td>
                <td class="${inv.status === 'Overdue' ? 'text-danger font-weight-bold' : ''}">${dueStr}</td>
                <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
                <td>${actionsHtml}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Payment modal management
const modalPay = document.getElementById('modal-pay');

async function openPayModal(invoiceId, title, amount, status) {
    document.getElementById('pay-invoice-id').value = invoiceId;
    document.getElementById('pay-title').textContent = title;
    document.getElementById('pay-total-amount').textContent = formatCurrency(amount);

    showLoading(true);
    try {
        // Query payments of this invoice to check remaining debt
        const invoice = await api.get(`/invoices/${invoiceId}`);
        const totalPaid = (invoice.payments || [])
            .filter(p => p.status === 'Completed')
            .reduce((sum, p) => sum + p.amountPaid, 0);

        const remaining = amount - totalPaid;
        document.getElementById('pay-remaining-amount').textContent = formatCurrency(remaining);
        document.getElementById('pay-amount').value = remaining;
        document.getElementById('pay-amount').max = remaining;

        modalPay.classList.remove('hidden');
    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Submit payment
document.getElementById('pay-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const invoiceId = document.getElementById('pay-invoice-id').value;
    const amountPaid = document.getElementById('pay-amount').value;
    const paymentMethod = document.getElementById('pay-method').value;
    const transactionReference = document.getElementById('pay-ref').value.trim();

    showLoading(true);
    try {
        await api.post('/payments', {
            invoiceId: parseInt(invoiceId),
            amountPaid: parseFloat(amountPaid),
            paymentMethod,
            transactionReference: transactionReference || null
        });

        showToast('Ghi nhận thanh toán thành công! Trạng thái hóa đơn đã được cập nhật.', 'success');
        modalPay.classList.add('hidden');
        document.getElementById('pay-form').reset();
        await loadInvoicesData();
    } catch (err) {
        // Handled
    } finally {
        showLoading(false);
    }
});

async function deleteInvoice(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này? Thao tác này sẽ xóa vĩnh viễn hóa đơn và các lịch sử giao dịch liên quan.')) return;
    
    showLoading(true);
    try {
        await api.delete(`/invoices/${id}`);
        showToast('Xóa hóa đơn thành công.', 'success');
        await loadInvoicesData();
    } catch (err) {
        // Handled
    } finally {
        showLoading(false);
    }
}

window.loadInvoicesData = loadInvoicesData;
window.deleteInvoice = deleteInvoice;
window.openPayModal = openPayModal;
