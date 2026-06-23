// Modal elements
const modalContract = document.getElementById('modal-contract');
const btnAddContract = document.getElementById('btn-add-contract');

if (btnAddContract) {
    btnAddContract.addEventListener('click', async () => {
        await populateStudentDropdowns();
        await populateBuildingsAndRooms();
        modalContract.classList.remove('hidden');
    });
}

// Close modals utility (covers all close clicks)
document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    });
});

let allBuildings = [];
let allRooms = [];

async function populateBuildingsAndRooms() {
    const buildingSelect = document.getElementById('contract-building-select');
    const roomSelect = document.getElementById('contract-room-select');
    const contractRoomHidden = document.getElementById('contract-room');

    if (!buildingSelect || !roomSelect) return;

    try {
        buildingSelect.innerHTML = '<option value="">-- Đang tải tòa nhà... --</option>';
        roomSelect.innerHTML = '<option value="">-- Vui lòng chọn tòa nhà trước --</option>';
        if (contractRoomHidden) contractRoomHidden.value = '';

        // Fetch buildings and rooms via proxy API
        allBuildings = await api.get('/externalrooms/buildings');
        allRooms = await api.get('/externalrooms/rooms');

        // Render buildings
        const buildingOptions = allBuildings.map(b => `<option value="${b.id}">${b.name} (${b.genderType})</option>`);
        buildingSelect.innerHTML = '<option value="">-- Chọn tòa nhà --</option>' + buildingOptions.join('');
    } catch (err) {
        console.error('Error loading buildings/rooms from Group 1', err);
        buildingSelect.innerHTML = '<option value="">Lỗi tải dữ liệu tòa nhà</option>';
    }
}

// Setup event listeners for building & room selects
document.addEventListener('DOMContentLoaded', () => {
    const buildingSelect = document.getElementById('contract-building-select');
    const roomSelect = document.getElementById('contract-room-select');
    const contractRoomHidden = document.getElementById('contract-room');
    const contractFee = document.getElementById('contract-fee');

    if (buildingSelect) {
        buildingSelect.addEventListener('change', () => {
            const buildingId = buildingSelect.value;
            if (!buildingId) {
                roomSelect.innerHTML = '<option value="">-- Vui lòng chọn tòa nhà trước --</option>';
                if (contractRoomHidden) contractRoomHidden.value = '';
                return;
            }

            // Filter rooms belonging to building
            const filteredRooms = allRooms.filter(r => r.buildingId === buildingId);
            
            if (filteredRooms.length === 0) {
                roomSelect.innerHTML = '<option value="">-- Không có phòng nào --</option>';
                if (contractRoomHidden) contractRoomHidden.value = '';
                return;
            }

            const roomOptions = filteredRooms.map(r => {
                const price = r.roomType ? r.roomType.basePrice : 0;
                return `<option value="${r.roomNumber}" data-price="${price}">${r.roomNumber} (Trống: ${r.availableSlots}/${r.roomType ? r.roomType.capacity : 0} | ${r.status})</option>`;
            });

            roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>' + roomOptions.join('');
            if (contractRoomHidden) contractRoomHidden.value = '';
        });
    }

    if (roomSelect) {
        roomSelect.addEventListener('change', () => {
            const selectedOption = roomSelect.options[roomSelect.selectedIndex];
            if (selectedOption && selectedOption.value) {
                if (contractRoomHidden) contractRoomHidden.value = selectedOption.value;
                const price = selectedOption.getAttribute('data-price');
                if (price && contractFee) {
                    contractFee.value = price;
                }
            } else {
                if (contractRoomHidden) contractRoomHidden.value = '';
            }
        });
    }
});

// Dropdown population helper
async function populateStudentDropdowns() {
    try {
        const students = await api.get('/debts');
        const contractSelect = document.getElementById('contract-student-id');
        const invoiceSelect = document.getElementById('invoice-student-id');
        
        const optionsHtml = students.map(s => `<option value="${s.id}">${s.fullName} (${s.username})</option>`).join('');
        
        if (contractSelect) contractSelect.innerHTML = optionsHtml;
        if (invoiceSelect) invoiceSelect.innerHTML = optionsHtml;
    } catch (err) {
        console.error('Error fetching students', err);
    }
}

// Handle contract form submit
document.getElementById('contract-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('contract-student-id').value;
    const roomNumber = document.getElementById('contract-room').value.trim();
    const startDate = document.getElementById('contract-start').value;
    const endDate = document.getElementById('contract-end').value;
    const roomFee = document.getElementById('contract-fee').value;

    showLoading(true);
    try {
        await api.post('/contracts', {
            userId: parseInt(userId),
            roomNumber,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            roomFee: parseFloat(roomFee)
        });

        showToast('Tạo hợp đồng thành công! Hóa đơn tháng đầu tiên đã được tự động tạo.', 'success');
        modalContract.classList.add('hidden');
        document.getElementById('contract-form').reset();
        await loadContractsData();
    } catch (err) {
        // Handled in api.js
    } finally {
        showLoading(false);
    }
});

async function loadContractsData() {
    const user = getCurrentUser();
    if (!user) return;

    showLoading(true);
    try {
        const contracts = await api.get('/contracts');
        const tbody = document.getElementById('contracts-table-body');
        tbody.innerHTML = '';

        if (contracts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${user.role !== 'Student' ? 8 : 7}" style="text-align: center; color: var(--text-muted);">Không có hợp đồng nào</td></tr>`;
            return;
        }

        contracts.forEach(c => {
            const tr = document.createElement('tr');
            
            const startDateStr = formatDate(c.startDate);
            const endDateStr = formatDate(c.endDate);
            const feeStr = formatCurrency(c.roomFee);
            const statusClass = c.status.toLowerCase();
            const statusLabel = c.status === 'Active' ? 'Đang hoạt động' : (c.status === 'Completed' ? 'Hoàn thành' : 'Đã hủy');

            let actionHtml = '';
            if (user.role !== 'Student') {
                if (c.status === 'Active') {
                    actionHtml = `<button class="btn btn-danger btn-sm" onclick="cancelContract(${c.id})"><i class="fa-solid fa-ban"></i> Hủy</button>`;
                } else {
                    actionHtml = `<span style="color: var(--text-muted); font-size: 13px;">Không thể thao tác</span>`;
                }
            }

            tr.innerHTML = `
                <td><strong>#HĐ${c.id}</strong></td>
                <td>${c.user ? c.user.fullName : 'N/A'} (${c.user ? c.user.username : 'N/A'})</td>
                <td><span class="user-room-indicator"><i class="fa-solid fa-door-open"></i> ${c.roomNumber}</span></td>
                <td>${startDateStr}</td>
                <td>${endDateStr}</td>
                <td><strong>${feeStr}</strong></td>
                <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
                ${user.role !== 'Student' ? `<td>${actionHtml}</td>` : ''}
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

async function cancelContract(id) {
    if (!confirm('Bạn có chắc chắn muốn hủy hợp đồng này? Trạng thái sẽ được chuyển sang Cancelled.')) return;
    
    showLoading(true);
    try {
        await api.delete(`/contracts/${id}`);
        showToast('Hủy hợp đồng thành công.', 'success');
        await loadContractsData();
    } catch (err) {
        // Handled
    } finally {
        showLoading(false);
    }
}

window.loadContractsData = loadContractsData;
window.cancelContract = cancelContract;
window.populateStudentDropdowns = populateStudentDropdowns;
window.populateBuildingsAndRooms = populateBuildingsAndRooms;
