<template>
  <div>
    <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống ký túc xá" />

    <!-- KPI Cards -->
    <v-row class="mb-6">
      <v-col v-for="kpi in kpis" :key="kpi.label" cols="12" sm="6" lg="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-avatar :color="kpi.color" size="48" class="mr-4">
              <v-icon color="white">{{ kpi.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ kpi.value }}</div>
              <div class="text-caption text-grey">{{ kpi.label }}</div>
              <div v-if="kpi.sub" class="text-caption" :class="kpi.subColor">{{ kpi.sub }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Doanh thu 12 tháng</h3>
          <div style="position: relative; height: 300px;">
            <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Trạng thái phiếu thu</h3>
          <div style="position: relative; height: 300px;">
            <Doughnut :data="donutData" :options="donutOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mini Tables -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">HĐ sắp hết hạn (30 ngày)</h3>
          <v-table density="compact">
            <thead><tr><th>Sinh viên</th><th>Phòng</th><th>Còn</th></tr></thead>
            <tbody>
              <tr v-for="ct in expiring" :key="ct.contractId">
                <td>{{ ct.studentName }}</td>
                <td>{{ ct.roomNumberSnapshot }}</td>
                <td><v-chip size="x-small" color="warning">{{ ct.daysRemaining }} ngày</v-chip></td>
              </tr>
              <tr v-if="!expiring.length"><td colspan="3" class="text-center text-grey py-4">Không có HĐ sắp hết hạn</td></tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Sự cố chưa xử lý</h3>
          <v-table density="compact">
            <thead><tr><th>Phòng</th><th>Loại</th><th>Thời gian</th></tr></thead>
            <tbody>
              <tr v-for="mt in newMaintenance" :key="mt.id">
                <td>{{ mt.roomNumber }}</td>
                <td>{{ mt.type }}</td>
                <td class="text-caption">{{ formatRelativeTime(mt.createdAt) }}</td>
              </tr>
              <tr v-if="!newMaintenance.length"><td colspan="3" class="text-center text-grey py-4">Không có sự cố mới</td></tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatCurrency, formatRelativeTime } from '@/shared/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const overview = ref<any>({})
const revenueData = ref<any>(null)
const expiring = ref<any[]>([])
const newMaintenance = ref<any[]>([])
const chartData = ref<any>(null)

const kpis = computed(() => [
  { icon: 'mdi-cash-multiple', label: 'Doanh thu tháng', value: formatCurrency(overview.value.totalRevenue || 0), color: 'primary', sub: `↑+${overview.value.revenueGrowth || 0}% tháng`, subColor: 'text-success' },
  { icon: 'mdi-receipt-text', label: 'Phiếu thu', value: `${overview.value.totalInvoices || 0} phiếu`, color: 'secondary', sub: `${overview.value.paidInvoices || 0} đã TT` },
  { icon: 'mdi-alert-circle', label: 'Công nợ', value: formatCurrency(overview.value.totalDebt || 0), color: 'warning', sub: `${overview.value.debtStudents || 0} sinh viên` },
  { icon: 'mdi-wrench', label: 'Sự cố', value: `${overview.value.maintenanceActive || 0} đang xử lý`, color: 'error', sub: `${overview.value.maintenanceNew || 0} mới` },
])

const donutData = {
  labels: ['Đã TT', 'Chưa TT', 'Quá hạn', 'Đã hủy'],
  datasets: [{ data: [287, 18, 5, 2], backgroundColor: ['#388E3C', '#D32F2F', '#F57C00', '#9E9E9E'] }],
}
const donutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v: any) => formatCurrency(v) } } } }

onMounted(async () => {
  try {
    const [ovRes, revRes, expRes, mtRes] = await Promise.all([
      http.get('/api/dashboard/overview'),
      http.get('/api/dashboard/revenue'),
      http.get('/api/contract-statistics/expiring-soon'),
      http.get('/api/maintenance-requests', { params: { status: 'NEW' } }),
    ])
    overview.value = ovRes.data
    revenueData.value = revRes.data
    expiring.value = expRes.data
    newMaintenance.value = mtRes.data.items || []
    chartData.value = {
      labels: revRes.data.labels,
      datasets: [{ label: 'Doanh thu', data: revRes.data.data, backgroundColor: '#3949AB', borderRadius: 6 }],
    }
  } catch (e) { console.error(e) }
})
</script>
