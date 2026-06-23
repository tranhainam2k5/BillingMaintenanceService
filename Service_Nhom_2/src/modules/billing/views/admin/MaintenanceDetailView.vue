<template>
  <div>
    <PageHeader title="Chi tiết sự cố" back />
    <v-card class="pa-6" v-if="item">
      <v-row>
        <v-col cols="12" md="6">
          <div class="d-flex align-center mb-4"><span class="ml-3 text-body-2 text-grey">{{ formatRelativeTime(item.createdAt) }}</span></div>
          <v-table density="compact">
            <tbody>
              <tr><td class="text-grey" width="140">Phòng</td><td>{{ item.roomNumber }}</td></tr>
              <tr><td class="text-grey">Sinh viên</td><td>{{ item.studentName }} ({{ item.studentCode }})</td></tr>
              <tr><td class="text-grey">Loại sự cố</td><td>{{ formatEnum(item.type) }}</td></tr>
              <tr><td class="text-grey">Ưu tiên</td><td><v-chip :color="item.priority==='URGENT'?'error':'info'" size="small">{{ item.priority==='URGENT'?'Khẩn cấp':'Bình thường' }}</v-chip></td></tr>
              <tr><td class="text-grey">Mô tả</td><td>{{ item.description }}</td></tr>
              <tr v-if="item.assignee"><td class="text-grey">KTV phụ trách</td><td>{{ item.assignee }}</td></tr>
              <tr v-if="item.cost"><td class="text-grey">Chi phí</td><td>{{ formatCurrency(item.cost) }}</td></tr>
            </tbody>
          </v-table>
        </v-col>
        <v-col cols="12" md="6">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Cập nhật trạng thái</h3>
          <v-select v-model="newStatus" :items="availableStatuses" label="Trạng thái" class="mb-3" />
          <v-text-field v-if="newStatus==='IN_PROGRESS'" v-model="assignee" label="Kỹ thuật viên phụ trách" class="mb-3" />
          <v-text-field v-if="newStatus==='COMPLETED'" v-model="cost" label="Chi phí sửa chữa" type="number" class="mb-3" />
          <v-textarea v-model="note" label="Ghi chú xử lý" rows="3" class="mb-3" />
          <v-btn color="primary" :loading="saving" @click="updateStatus" :disabled="!newStatus">Cập nhật</v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-skeleton-loader v-else type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatRelativeTime, formatEnum, formatCurrency } from '@/shared/utils/formatters'
import { useNotify } from '@/shared/composables/useNotify'

const route = useRoute()
const router = useRouter()
const { success } = useNotify()
const item = ref<any>(null)
const newStatus = ref('')
const assignee = ref('')
const cost = ref<number | null>(null)
const note = ref('')
const saving = ref(false)

const availableStatuses = computed(() => {
  if (!item.value) return []
  const s = item.value.status
  if (s === 'NEW') return [{ title: 'Đang xử lý', value: 'IN_PROGRESS' }, { title: 'Đã hủy', value: 'CANCELLED' }]
  if (s === 'IN_PROGRESS') return [{ title: 'Hoàn thành', value: 'COMPLETED' }, { title: 'Đã hủy', value: 'CANCELLED' }]
  return []
})

async function updateStatus() {
  saving.value = true
  try {
    await http.put(`/api/maintenance/${route.params.id}/status`, { status: newStatus.value, technicianId: assignee.value ? parseInt(assignee.value) : null, repairCost: cost.value || 0 })
    success('Đã cập nhật trạng thái')
    router.push('/billing/maintenance')
  } catch(e) { console.error(e) } finally { saving.value = false }
}

onMounted(async () => {
  try { const { data } = await http.get(`/api/maintenance/${route.params.id}`); item.value = data } catch(e) { console.error(e) }
})
</script>
