<template>
  <div>
    <PageHeader title="Duyệt đơn đăng ký" back />

    <v-row v-if="app">
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Thông tin đơn</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">Sinh viên</td><td>{{ app.studentName }} ({{ app.studentCode }})</td></tr>
            <tr><td class="text-grey">Ngày gửi</td><td>{{ formatDate(app.submittedAt) }}</td></tr>
            <tr><td class="text-grey">Tầng mong muốn</td><td>{{ app.preferredFloor || 'Không' }}</td></tr>
            <tr><td class="text-grey">Thời gian</td><td>{{ formatDate(app.expectedStartDate) }} — {{ formatDate(app.expectedEndDate) }}</td></tr>
            <tr><td class="text-grey">Ghi chú</td><td>{{ app.note || '—' }}</td></tr>
          </tbody></v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Tạo hợp đồng</h3>
          <v-select v-model="form.roomId" :items="availableRooms" label="Chọn phòng *" class="mb-2" :readonly="!!app.roomId" :hint="app.roomId ? 'Sinh viên đã chọn phòng này' : ''" persistent-hint />
          <v-select v-model="form.bedId" :items="availableBeds" label="Chọn giường *" class="mb-2" />
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="form.contractStartDate" label="Bắt đầu" type="date" /></v-col>
            <v-col cols="6"><v-text-field v-model="form.contractEndDate" label="Kết thúc" type="date" /></v-col>
          </v-row>
          <v-text-field v-model.number="form.monthlyPrice" label="Giá/tháng" type="number" suffix="₫" class="mt-2 mb-2" />
          <v-text-field v-model.number="form.depositAmount" label="Đặt cọc" type="number" suffix="₫" class="mb-2" />
          <v-select v-model="form.paymentCycle" :items="PAYMENT_CYCLE_OPTIONS" label="Chu kỳ TT" class="mb-4" />
          <v-btn color="success" size="large" block variant="flat" :loading="approving" @click="approve" prepend-icon="mdi-check-all">Duyệt & Tạo hợp đồng</v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-skeleton-loader v-else type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatDate } from '@/shared/utils/formatters'
import { PAYMENT_CYCLE_OPTIONS } from '@/shared/utils/constants'
import { useNotify } from '@/shared/composables/useNotify'

const route = useRoute(); const router = useRouter(); const { success } = useNotify()
const app = ref<any>(null); const approving = ref(false)
const availableRooms = ref<any[]>([]); const availableBeds = ref<any[]>([])
const form = ref({ roomId: '', bedId: '', contractStartDate: '', contractEndDate: '', monthlyPrice: 1200000, depositAmount: 500000, paymentCycle: 'MONTHLY' })

watch(() => form.value.roomId, async (rid) => {
  if (!rid) return
  try { const { data } = await http.get('/api/beds', { params: { roomId: rid } }); availableBeds.value = data.filter((b:any) => b.status === 'AVAILABLE').map((b:any) => ({ title: b.bedNumber, value: b.id })) } catch(e) { console.error(e) }
})

async function approve() {
  approving.value = true
  try {
    await http.patch(`/api/room-applications/${route.params.id}/approve`, { ...form.value, approvedBy: 'admin-001' })
    
    // Fetch and auto-reject other pending applications for this student
    try {
      const { data } = await http.get('/api/room-applications', { params: { studentId: app.value.studentId, status: 'SUBMITTED', pageSize: 100 } })
      const otherApps = data.items?.filter((a: any) => a.id !== app.value.id && a.status === 'SUBMITTED') || []
      for (const otherApp of otherApps) {
        await http.patch(`/api/room-applications/${otherApp.id}/reject`, { rejectReason: 'Hủy tự động: Sinh viên đã được duyệt một đơn khác' })
      }
    } catch (err) {
      console.error('Failed to auto-reject other applications', err)
    }

    success('Đã duyệt đơn và tạo hợp đồng')
    router.push('/contract/applications')
  } catch(e) { console.error(e) } finally { approving.value = false }
}

onMounted(async () => {
  try {
    const [appRes, roomsRes] = await Promise.all([http.get(`/api/room-applications/${route.params.id}`), http.get('/api/rooms/available')])
    app.value = appRes.data
    availableRooms.value = roomsRes.data.map((r:any) => ({ title: `${r.roomNumber} — ${r.roomType?.typeName || 'Phòng'} (${r.availableSlots} chỗ trống)`, value: r.id }))
    form.value.contractStartDate = app.value.expectedStartDate
    form.value.contractEndDate = app.value.expectedEndDate
    if (app.value.roomId) {
      form.value.roomId = app.value.roomId
    }
  } catch(e) { console.error(e) }
})
</script>
