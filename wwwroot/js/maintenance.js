window.loadMaintenanceData = async function() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const role = user.role || user.Role;
    const isAdminOrStaff = (role === 'Admin' || role === 'Staff' || role === 'MaintenanceStaff');

    const adminSection = document.getElementById('maintenance-admin-section');
    const studentSection = document.getElementById('maintenance-student-section');

    const userIdGroup = document.getElementById('maintenance-user-id-group');
    const roomInput = document.getElementById('maintenance-room');

    if (isAdminOrStaff) {
        if (adminSection) adminSection.style.display = 'block';
        if (studentSection) studentSection.style.display = 'none';

        if (userIdGroup) userIdGroup.style.display = 'block';
        await populateMaintenanceUserDropdown();

        try {
            // calls GET /api/MaintenanceRequests
            const requests = await apiRequest('MaintenanceRequests');
            renderMaintenanceRequests(requests);
        } catch (error) {
            showToast('Không thể tải danh sách yêu cầu: ' + error.message, 'error');
        }
    } else {
        if (adminSection) adminSection.style.display = 'none';
        if (studentSection) studentSection.style.display = 'block';

        if (userIdGroup) userIdGroup.style.display = 'none';
        if (roomInput && (user.roomNumber || user.RoomNumber)) {
            roomInput.value = user.roomNumber || user.RoomNumber;
        }
    }
}

async function populateMaintenanceUserDropdown() {
    const userSelect = document.getElementById('maintenance-user-select');
    if (!userSelect) return;

    try {
        const debts = await apiRequest('Debts');
        if (debts) {
            const originalVal = userSelect.value;
            userSelect.innerHTML = '<option value="">-- Chọn sinh viên --</option>';
            debts.forEach(student => {
                const option = document.createElement('option');
                option.value = student.userId;
                const roomInfo = student.roomNumber ? ` - Phòng ${student.roomNumber}` : '';
                option.textContent = `${student.fullName} (${student.username})${roomInfo}`;
                userSelect.appendChild(option);
            });
            if (originalVal) userSelect.value = originalVal;
        }
    } catch (error) {
        console.error('Lỗi nạp danh sách sinh viên vào dropdown sửa chữa:', error);
    }
}

function renderMaintenanceRequests(requests) {
    const tableBody = document.getElementById('maintenance-table-body');
    if (!tableBody) return;

    if (!requests || requests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center-empty">Không tìm thấy yêu cầu sửa chữa nào.</td></tr>`;
        return;
    }

    tableBody.innerHTML = requests.map(req => {
        const statusBadge = getMaintenanceStatusBadge(req.status);
        const studentName = req.user ? `${req.user.fullName} (${req.user.username})` : `Mã SV #${req.userId}`;
        const costText = req.cost ? formatCurrency(req.cost) : '<span class="text-muted-desc">Chưa có phí</span>';
        const technicianText = req.technicianId ? `Kỹ thuật viên #${req.technicianId}` : '<span class="text-muted-desc">Chưa phân công</span>';
        
        return `
            <tr>
                <td><strong>#${req.id}</strong></td>
                <td>
                    <div class="req-title-cell">${escapeHtml(req.title)}</div>
                    <small class="text-muted-desc">${escapeHtml(req.description || 'Không có mô tả')}</small>
                </td>
                <td>${escapeHtml(studentName)}</td>
                <td><span class="room-tag"><i class="fas fa-door-open"></i> ${escapeHtml(req.roomNumber || 'N/A')}</span></td>
                <td>${statusBadge}</td>
                <td class="text-right cost-cell">${costText}</td>
                <td>${technicianText}</td>
                <td>
                    <div class="date-cell">${formatDate(req.createdAt)}</div>
                    ${req.resolvedAt ? `<div class="date-resolved"><i class="fas fa-check-double text-success"></i> ${formatDate(req.resolvedAt)}</div>` : ''}
                </td>
                <td>
                    <button class="btn btn-xs btn-primary-action" onclick="openUpdateStatusModal(${req.id}, '${escapeHtml(req.status)}', ${req.cost || 0}, ${req.technicianId || ''})">
                        <i class="fas fa-sync-alt"></i> Cập nhật
                    </button>
                </td>
            </tr>
        `;
    }).join('');
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

window.openUpdateStatusModal = function(id, currentStatus, cost, technicianId) {
    const modal = document.getElementById('modal-update-maintenance');
    if (!modal) return;

    document.getElementById('update-maintenance-id').value = id;
    document.getElementById('update-maintenance-status').value = currentStatus;
    document.getElementById('update-maintenance-cost').value = cost || '';
    document.getElementById('update-maintenance-tech').value = technicianId || '';

    modal.classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
    // Form submit for Creating Requests
    const createMaintenanceForm = document.getElementById('create-maintenance-form');
    if (createMaintenanceForm) {
        createMaintenanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userJson = localStorage.getItem('user');
            if (!userJson) return;
            const user = JSON.parse(userJson);
            const role = user.role || user.Role;
            const isAdminOrStaff = (role === 'Admin' || role === 'Staff' || role === 'MaintenanceStaff');

            let userId;
            if (isAdminOrStaff) {
                const userSelectVal = document.getElementById('maintenance-user-select').value;
                if (!userSelectVal) {
                    showToast('Vui lòng chọn sinh viên cho yêu cầu sửa chữa.', 'warning');
                    return;
                }
                userId = parseInt(userSelectVal);
            } else {
                userId = user.id || user.Id;
            }

            const title = document.getElementById('maintenance-title').value.trim();
            const description = document.getElementById('maintenance-description').value.trim();
            const roomNumber = document.getElementById('maintenance-room').value.trim();
            const status = document.getElementById('maintenance-status').value;
            const costVal = document.getElementById('maintenance-cost').value;
            const cost = costVal ? parseFloat(costVal) : null;

            if (!title || !roomNumber) {
                showToast('Tiêu đề và Số phòng là bắt buộc.', 'warning');
                return;
            }

            try {
                // calls POST /api/MaintenanceRequests
                await apiRequest('MaintenanceRequests', {
                    method: 'POST',
                    body: JSON.stringify({
                        userId,
                        title,
                        description,
                        roomNumber,
                        status: status || 'Mới',
                        cost
                    })
                });

                showToast('Gửi yêu cầu sửa chữa mới thành công!', 'success');
                createMaintenanceForm.reset();

                // Close modal
                const modal = document.getElementById('modal-maintenance');
                if (modal) modal.classList.remove('active');

                await loadMaintenanceData();
            } catch (error) {
                showToast('Lỗi gửi yêu cầu: ' + error.message, 'error');
            }
        });
    }

    // Form submit for Updating Request Status
    const updateMaintenanceForm = document.getElementById('update-maintenance-form');
    if (updateMaintenanceForm) {
        updateMaintenanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = parseInt(document.getElementById('update-maintenance-id').value);
            const status = document.getElementById('update-maintenance-status').value;
            const costVal = document.getElementById('update-maintenance-cost').value;
            const techVal = document.getElementById('update-maintenance-tech').value;

            const cost = costVal ? parseFloat(costVal) : null;
            const technicianId = techVal ? parseInt(techVal) : null;

            try {
                // calls PUT /api/MaintenanceRequests/{id}/status
                await apiRequest(`MaintenanceRequests/${id}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        status,
                        cost,
                        technicianId
                    })
                });

                showToast('Cập nhật trạng thái sửa chữa thành công!', 'success');
                
                // Close modal
                const modal = document.getElementById('modal-update-maintenance');
                if (modal) modal.classList.remove('active');

                await loadMaintenanceData();
            } catch (error) {
                showToast('Lỗi cập nhật yêu cầu: ' + error.message, 'error');
            }
        });
    }
});
