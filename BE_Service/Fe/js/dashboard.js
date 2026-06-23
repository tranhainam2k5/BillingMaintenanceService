let revenueChartInstance = null;
let maintenanceChartInstance = null;

async function loadDashboardData() {
    const user = getCurrentUser();
    if (!user) return;

    // Handle student role view (non-management)
    if (user.role === 'Student') {
        const kpiGrid = document.querySelector('.kpi-grid');
        if (kpiGrid) kpiGrid.style.display = 'none';
        document.querySelectorAll('.dashboard-charts').forEach(el => el.style.display = 'none');
        
        let studentWelcome = document.getElementById('student-welcome-card');
        if (!studentWelcome) {
            studentWelcome = document.createElement('div');
            studentWelcome.id = 'student-welcome-card';
            studentWelcome.className = 'card text-center mt-4';
            studentWelcome.style.padding = '40px';
            studentWelcome.style.textAlign = 'center';
            studentWelcome.innerHTML = `
                <div style="font-size: 50px; color: var(--primary); margin-bottom: 20px;">
                    <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <h2 style="margin-bottom: 12px;">Xin chào, ${user.username}!</h2>
                <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Chào mừng bạn đến với Cổng thông tin Sinh viên Ký túc xá. Tại đây bạn có thể xem các hóa đơn, tiến hành thanh toán tiền phòng dịch vụ trực tuyến và gửi các yêu cầu sửa chữa thiết bị phòng ở khi gặp sự cố.
                </p>
                <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="switchScreen('invoices')">
                        <i class="fa-solid fa-file-invoice-dollar"></i> Xem Hóa đơn của tôi
                    </button>
                    <button class="btn btn-info" onclick="switchScreen('maintenance')">
                        <i class="fa-solid fa-wrench"></i> Gửi yêu cầu sửa chữa
                    </button>
                </div>
            `;
            document.getElementById('screen-dashboard').appendChild(studentWelcome);
        } else {
            studentWelcome.classList.remove('hidden');
        }
        return;
    }

    // Hide student welcome and show admin dashboard widgets
    const studentWelcome = document.getElementById('student-welcome-card');
    if (studentWelcome) studentWelcome.classList.add('hidden');
    
    const kpiGrid = document.querySelector('.kpi-grid');
    if (kpiGrid) kpiGrid.style.display = 'grid';
    document.querySelectorAll('.dashboard-charts').forEach(el => el.style.display = 'grid');

    showLoading(true);
    try {
        // Fetch Overview
        const overview = await api.get('/dashboard/overview');
        document.getElementById('kpi-revenue').textContent = formatCurrency(overview.totalRevenue);
        document.getElementById('kpi-debt').textContent = formatCurrency(overview.totalOutstandingDebt);
        document.getElementById('kpi-contracts').textContent = overview.totalActiveContracts;
        document.getElementById('kpi-maintenance').textContent = overview.pendingMaintenance;

        // Fetch Occupancy
        const occupancy = await api.get('/dashboard/occupancy');
        document.getElementById('occupancy-rooms').textContent = occupancy.occupiedRooms;
        document.getElementById('occupancy-total').textContent = occupancy.totalRooms;
        document.getElementById('occupancy-percentage').textContent = `${occupancy.occupancyRate}%`;
        document.getElementById('occupancy-circle').style.setProperty('--percent', `${occupancy.occupancyRate}%`);
        document.getElementById('occupancy-bar').style.width = `${occupancy.occupancyRate}%`;

        // Fetch Revenue Chart Data
        const revData = await api.get('/dashboard/revenue-chart');
        renderRevenueChart(revData);

        // Fetch Maintenance Chart Data
        const maintData = await api.get('/dashboard/maintenance-chart');
        renderMaintenanceChart(maintData);

    } catch (err) {
        console.error('Failed to load dashboard data', err);
    } finally {
        showLoading(false);
    }
}

function renderRevenueChart(data) {
    const ctx = document.getElementById('revenueLineChart').getContext('2d');
    
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    const labels = data.map(d => d.label);
    const revenues = data.map(d => d.revenue);

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: revenues,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('vi-VN') + 'đ';
                        }
                    }
                }
            }
        }
    });
}

function renderMaintenanceChart(data) {
    const ctx = document.getElementById('maintenancePieChart').getContext('2d');

    if (maintenanceChartInstance) {
        maintenanceChartInstance.destroy();
    }

    maintenanceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ xử lý (Pending)', 'Đang tiến hành (InProgress)', 'Đã hoàn thành (Completed)'],
            datasets: [{
                data: [data.pending, data.inProgress, data.completed],
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true
                    }
                }
            },
            cutout: '70%'
        }
    });
}

window.loadDashboardData = loadDashboardData;
