<template>
  <div>
    <PageHeader title="Phiếu thu tiền phòng" />
    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="unpaid">Chưa thanh toán <v-badge v-if="unpaidCount" :content="unpaidCount" color="error" class="ml-1" /></v-tab>
      <v-tab value="paid">Đã thanh toán</v-tab>
      <v-tab value="all">Tất cả</v-tab>
    </v-tabs>

    <div v-if="loading" class="d-flex justify-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="!filtered.length"><EmptyState title="Không có phiếu thu" description="Chưa có phiếu thu nào." /></div>
    <v-row v-else>
      <v-col v-for="inv in filtered" :key="inv.id" cols="12" md="6">
        <v-card :class="inv.status==='OVERDUE'?'border-error':''" class="pa-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-h6 font-weight-bold">{{ inv.period }}</span>
            
          </div>
          <div class="text-body-2 text-grey mb-1">Phòng {{ inv.roomNumber }}</div>
          <div class="text-h5 font-weight-bold text-primary mb-2">{{ formatCurrency(inv.amount) }}</div>
          <div class="text-body-2 text-grey">Hạn nộp: {{ formatDate(inv.dueDate) }}</div>
          <div v-if="inv.status==='OVERDUE'" class="text-caption text-error mt-1">⚠ Quá hạn</div>
          <v-btn variant="text" color="primary" class="mt-3" size="small" @click="detail=inv;showDetail=true">Chi tiết</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDetail" max-width="480">
      <v-card v-if="detail" class="pa-6">
        <v-card-title>Phiếu thu — {{ detail.period }}</v-card-title>
        <v-card-text>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey">Phòng</td><td>{{ detail.roomNumber }}</td></tr>
            <tr><td class="text-grey">Số tiền</td><td class="font-weight-bold">{{ formatCurrency(detail.amount) }}</td></tr>
            <tr><td class="text-grey">Hạn nộp</td><td>{{ formatDate(detail.dueDate) }}</td></tr>
                        <tr v-if="detail.paidDate"><td class="text-grey">Ngày nộp</td><td>{{ formatDate(detail.paidDate) }}</td></tr>
          </tbody></v-table>
          <v-alert v-if="detail.status!=='PAID'" type="info" variant="tonal" class="mt-4">Vui lòng đến phòng quản lý KTX hoặc chuyển khoản theo thông tin bên dưới để thanh toán.</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="showDetail=false">Đóng</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { http } from '@/shared/http'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { useAuthStore } from '@/shared/stores/authStore'

const auth = useAuthStore()
const tab = ref('unpaid')
const items = ref<any[]>([])
const loading = ref(false)
const showDetail = ref(false)
const detail = ref<any>(null)

const filtered = computed(() => {
  if (tab.value === 'unpaid') return items.value.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE')
  if (tab.value === 'paid') return items.value.filter(i => i.status === 'PAID')
  return items.value
})

const unpaidCount = computed(() => items.value.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await http.get('/api/invoices/my')
    items.value = data.items
  } catch(e) { console.error(e) } finally { loading.value = false }
})
</script>

<style scoped>
.border-error { border-color: #D32F2F !important; border-width: 2px !important; }
</style>
