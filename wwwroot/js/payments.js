window.loadPaymentsData = async function() {
    try {
        const payments = await apiRequest('Payments');
        renderPayments(payments);
        await populatePaymentInvoiceDropdown();
    } catch (error) {
        showToast('Không thể tải danh sách thanh toán: ' + error.message, 'error');
    }
}

function renderPayments(payments) {
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;

    if (!payments || payments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center-empty">Không tìm thấy giao dịch thanh toán nào.</td></tr>`;
        return;
    }

    tableBody.innerHTML = payments.map(pay => {
        const invoiceTitle = pay.invoice ? pay.invoice.title : `Hóa đơn #${pay.invoiceId}`;
        const studentName = pay.invoice && pay.invoice.user ? pay.invoice.user.fullName : '-';
        const methodBadge = getPaymentMethodBadge(pay.paymentMethod);
        
        return `
            <tr>
                <td><strong>#${pay.id}</strong></td>
                <td>
                    <div class="invoice-link-cell"><strong>#${pay.invoiceId}</strong> - ${escapeHtml(invoiceTitle)}</div>
                </td>
                <td>${escapeHtml(studentName)}</td>
                <td class="text-right text-success amount-cell fw-semibold">+ ${formatCurrency(pay.amount)}</td>
                <td>${methodBadge}</td>
                <td><code>${escapeHtml(pay.transactionId || 'N/A')}</code></td>
                <td>${formatDate(pay.paymentDate)}</td>
            </tr>
        `;
    }).join('');
}

function getPaymentMethodBadge(method) {
    let className = 'method-other';
    let text = method || 'Khác';

    if (method === 'Cash' || method === 'Tiền mặt') {
        className = 'method-cash';
        text = 'Tiền mặt';
    } else if (method === 'Transfer' || method === 'Chuyển khoản') {
        className = 'method-transfer';
        text = 'Chuyển khoản';
    } else if (method === 'E-Wallet' || method === 'Ví điện tử') {
        className = 'method-wallet';
        text = 'Ví điện tử';
    }

    return `<span class="badge ${className}">${text}</span>`;
}

async function populatePaymentInvoiceDropdown() {
    const invoiceSelect = document.getElementById('payment-invoice-id');
    if (!invoiceSelect) return;

    try {
        const invoices = await apiRequest('Invoices');
        if (invoices) {
            // Select only unpaid/partial invoices
            const activeInvoices = invoices.filter(inv => inv.status !== 'Paid');
            
            const originalVal = invoiceSelect.value;
            invoiceSelect.innerHTML = '<option value="">-- Chọn hóa đơn thanh toán --</option>';
            
            activeInvoices.forEach(inv => {
                const option = document.createElement('option');
                option.value = inv.id;
                const studentName = inv.user ? inv.user.fullName : `UserId #${inv.userId}`;
                const roomInfo = inv.user && inv.user.roomNumber ? ` - Phòng ${inv.roomNumber}` : '';
                option.textContent = `#${inv.id} - ${inv.title} (${formatCurrency(inv.amount)}) - ${studentName}${roomInfo}`;
                invoiceSelect.appendChild(option);
            });
            
            if (originalVal) invoiceSelect.value = originalVal;
        }
    } catch (error) {
        console.error('Lỗi nạp hóa đơn vào dropdown thanh toán:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const recordPaymentForm = document.getElementById('record-payment-form');
    if (recordPaymentForm) {
        recordPaymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const invoiceIdVal = document.getElementById('payment-invoice-id').value;
            const amountVal = document.getElementById('payment-amount').value;
            const paymentMethod = document.getElementById('payment-method').value;
            const transactionId = document.getElementById('payment-transaction-id').value.trim();
            const status = document.getElementById('payment-status').value;

            if (!invoiceIdVal || !amountVal || !paymentMethod) {
                showToast('Vui lòng nhập đầy đủ các thông tin bắt buộc.', 'warning');
                return;
            }

            const invoiceId = parseInt(invoiceIdVal);
            const amount = parseFloat(amountVal);

            try {
                // Call POST /api/Payments
                await apiRequest('Payments', {
                    method: 'POST',
                    body: JSON.stringify({
                        invoiceId,
                        amount,
                        paymentMethod,
                        transactionId: transactionId || `TX-${Date.now()}`,
                        status: status || 'Paid'
                    })
                });

                showToast('Ghi nhận thanh toán hóa đơn thành công!', 'success');
                recordPaymentForm.reset();
                
                // Close modal
                const modal = document.getElementById('modal-payment');
                if (modal) modal.classList.remove('active');

                // Reload data
                await loadPaymentsData();
                if (typeof window.loadInvoicesData === 'function') {
                    await window.loadInvoicesData();
                }
            } catch (error) {
                showToast('Lỗi ghi nhận thanh toán: ' + error.message, 'error');
            }
        });
    }
});
