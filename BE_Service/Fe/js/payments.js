async function loadPaymentsData() {
    const user = getCurrentUser();
    if (!user) return;

    // Students load `/my` payments, management loads all payments
    const endpoint = user.role === 'Student' ? '/payments/my' : '/payments';

    showLoading(true);
    try {
        const payments = await api.get(endpoint);
        const tbody = document.getElementById('payments-table-body');
        tbody.innerHTML = '';

        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Không có giao dịch thanh toán nào</td></tr>';
            return;
        }

        payments.forEach(p => {
            const tr = document.createElement('tr');
            
            const amountStr = formatCurrency(p.amountPaid);
            const dateStr = formatDate(p.paidAt) + ' ' + new Date(p.paidAt).toLocaleTimeString('vi-VN');
            const statusClass = p.status.toLowerCase();
            const statusLabel = p.status === 'Completed' ? 'Thành công' : (p.status === 'Failed' ? 'Thất bại' : 'Đang xử lý');
            
            let methodLabel = p.paymentMethod;
            if (p.paymentMethod === 'Transfer') methodLabel = 'Chuyển khoản (Transfer)';
            if (p.paymentMethod === 'Card') methodLabel = 'Thẻ ATM/Visa (Card)';
            if (p.paymentMethod === 'Cash') methodLabel = 'Tiền mặt (Cash)';

            tr.innerHTML = `
                <td><strong>#GD${p.id}</strong></td>
                <td>${p.invoice && p.invoice.user ? p.invoice.user.fullName : (user.role === 'Student' ? 'Tôi' : 'N/A')}</td>
                <td><a href="#" onclick="event.preventDefault(); switchScreen('invoices');"><strong>#HĐ${p.invoiceId}</strong></a> - ${p.invoice ? p.invoice.title : 'N/A'}</td>
                <td><strong style="color: var(--success);">+${amountStr}</strong></td>
                <td><span class="user-room-indicator" style="background-color: #f1f5f9;"><i class="fa-solid fa-money-bill-transfer"></i> ${methodLabel}</span></td>
                <td><code>${p.transactionReference || 'Không có'}</code></td>
                <td>${dateStr}</td>
                <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

window.loadPaymentsData = loadPaymentsData;
