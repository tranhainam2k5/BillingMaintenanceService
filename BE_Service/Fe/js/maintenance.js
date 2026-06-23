const modalMaintenance = document.getElementById('modal-maintenance');
const btnAddMaintenance = document.getElementById('btn-add-maintenance');
const modalMDetail = document.getElementById('modal-maintenance-detail');
const uploadInput = document.getElementById('upload-image-input');
const processForm = document.getElementById('maintenance-process-form');

if (btnAddMaintenance) {
    btnAddMaintenance.addEventListener('click', () => {
        modalMaintenance.classList.remove('hidden');
    });
}

// Create Maintenance Submit
document.getElementById('maintenance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('maintenance-description').value.trim();

    showLoading(true);
    try {
        await api.post('/maintenance-requests', { description });
        showToast('Gửi yêu cầu sửa chữa thành công.', 'success');
        modalMaintenance.classList.add('hidden');
        document.getElementById('maintenance-form').reset();
        await loadMaintenanceData();
    } catch (err) {
        // Handled in api.js
    } finally {
        showLoading(false);
    }
});

async function loadMaintenanceData() {
    const user = getCurrentUser();
    if (!user) return;

    showLoading(true);
    try {
        const requests = await api.get('/maintenance-requests');
        const container = document.getElementById('maintenance-cards-container');
        container.innerHTML = '';

        if (requests.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Không có yêu cầu sửa chữa nào</div>';
            return;
        }

        requests.forEach(req => {
            const card = document.createElement('div');
            card.className = 'm-card';
            
            const dateStr = formatDate(req.createdAt);
            const statusClass = req.status.toLowerCase();
            const statusLabel = req.status === 'Pending' ? 'Chờ xử lý' : (req.status === 'InProgress' ? 'Đang tiến hành' : 'Đã hoàn thành');
            
            let images = [];
            try {
                images = JSON.parse(req.imageUrls || "[]");
            } catch {
                images = [];
            }

            card.innerHTML = `
                <div class="m-header">
                    <span class="m-id">#SC${req.id}</span>
                    <span class="badge-status ${statusClass}">${statusLabel}</span>
                </div>
                <div class="m-body">
                    <p style="font-weight: 500; margin-bottom: 6px;">${req.description}</p>
                    ${images.length > 0 ? `
                        <div style="font-size: 13px; color: var(--primary); display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-image"></i> Đã đính kèm ${images.length} ảnh hiện trường
                        </div>
                    ` : ''}
                </div>
                <div class="m-meta">
                    <span><i class="fa-solid fa-door-open"></i> Phòng: <strong>${req.user ? (req.user.roomNumber || 'Chưa nhận phòng') : 'N/A'}</strong></span>
                    <span><i class="fa-regular fa-user"></i> Người gửi: ${req.user ? req.user.fullName : 'N/A'}</span>
                    <span><i class="fa-regular fa-calendar"></i> Ngày gửi: ${dateStr}</span>
                </div>
                <div class="m-footer">
                    <button class="btn btn-primary btn-sm" onclick="openMaintenanceDetail(${req.id})">
                        <i class="fa-solid fa-eye"></i> Chi tiết & Xử lý
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Current open maintenance request ID
let currentMRequestId = null;

async function openMaintenanceDetail(id) {
    currentMRequestId = id;
    document.getElementById('process-m-id').value = id;
    document.getElementById('detail-m-id').textContent = id;

    showLoading(true);
    try {
        const req = await api.get(`/maintenance-requests/${id}`);
        const user = getCurrentUser();

        // Update basic info
        document.getElementById('detail-m-user').textContent = req.user ? `${req.user.fullName} (${req.user.username})` : 'N/A';
        document.getElementById('detail-m-room').textContent = req.user ? (req.user.roomNumber || 'Chưa nhận phòng') : 'N/A';
        document.getElementById('detail-m-description').textContent = req.description;
        document.getElementById('detail-m-date').textContent = formatDate(req.createdAt) + ' ' + new Date(req.createdAt).toLocaleTimeString('vi-VN');

        const statusClass = req.status.toLowerCase();
        const statusLabel = req.status === 'Pending' ? 'Chờ xử lý' : (req.status === 'InProgress' ? 'Đang tiến hành' : 'Đã hoàn thành');
        document.getElementById('detail-m-status').className = `badge-status ${statusClass}`;
        document.getElementById('detail-m-status').textContent = statusLabel;

        // Render images
        const imgGallery = document.getElementById('detail-m-images');
        imgGallery.innerHTML = '';
        
        let images = [];
        try {
            images = JSON.parse(req.imageUrls || "[]");
        } catch {
            images = [];
        }

        if (images.length === 0) {
            imgGallery.innerHTML = '<span style="color: var(--text-muted); font-size: 13px;">Chưa có hình ảnh nào</span>';
        } else {
            images.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.className = 'detail-img';
                img.alt = 'Hiện trường';
                img.onclick = () => window.open(url, '_blank');
                imgGallery.appendChild(img);
            });
        }

        // Show/Hide admin process section vs student notes section
        const adminSection = document.querySelector('.admin-process-section');
        const notesSection = document.getElementById('detail-m-notes-section');

        if (user.role !== 'Student') {
            // Load technicians and populate select
            const techs = await api.get('/maintenance-requests/technicians');
            const select = document.getElementById('process-m-tech-select');
            select.innerHTML = '<option value="">-- Chưa giao ai --</option>';
            techs.forEach(t => {
                const selected = req.technicianId === t.id ? 'selected' : '';
                select.innerHTML += `<option value="${t.id}" ${selected}>${t.name} (${t.notes || ''})</option>`;
            });

            document.getElementById('process-m-status-select').value = req.status;
            document.getElementById('process-m-notes').value = req.notes || '';
            
            adminSection.classList.remove('hidden');
            notesSection.classList.add('hidden');
        } else {
            // Show notes to student
            document.getElementById('detail-m-notes-box').textContent = req.notes || 'Hệ thống ký túc xá đang tiếp nhận yêu cầu của bạn.';
            document.getElementById('detail-m-tech-name').textContent = req.technician ? `${req.technician.name} (${req.technician.phoneNumber})` : 'Chưa phân công';

            adminSection.classList.add('hidden');
            notesSection.classList.remove('hidden');
        }

        modalMDetail.classList.remove('hidden');
    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Handle image upload change
if (uploadInput) {
    uploadInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        showLoading(true);
        try {
            await api.upload(`/maintenance-requests/${currentMRequestId}/images`, formData);
            showToast('Tải ảnh hiện trường thành công.', 'success');
            await openMaintenanceDetail(currentMRequestId);
            await loadMaintenanceData();
        } catch (err) {
            showToast(err.message || 'Lỗi tải ảnh lên', 'error');
        } finally {
            showLoading(false);
            uploadInput.value = ''; // Reset file input
        }
    });
}

// Handle Admin Update Progress
if (processForm) {
    processForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('process-m-status-select').value;
        const notes = document.getElementById('process-m-notes').value.trim();
        const techId = document.getElementById('process-m-tech-select').value;

        showLoading(true);
        try {
            await api.put(`/maintenance-requests/${currentMRequestId}/status`, {
                status,
                notes: notes || null,
                technicianId: techId ? parseInt(techId) : null
            });

            showToast('Cập nhật tiến độ xử lý thành công.', 'success');
            modalMDetail.classList.add('hidden');
            await loadMaintenanceData();
        } catch (err) {
            // Handled in api.js
        } finally {
            showLoading(false);
        }
    });
}

window.loadMaintenanceData = loadMaintenanceData;
window.openMaintenanceDetail = openMaintenanceDetail;
