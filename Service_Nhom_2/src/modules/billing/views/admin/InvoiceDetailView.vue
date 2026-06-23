<template>
  <div>
    <PageHeader title="Chi tiết phiếu thu" back />
    <v-card class="pa-6" v-if="invoice">
      <v-row>
        <v-col cols="12" md="6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Thông tin phiếu thu</h3>
          <v-table density="compact">
            <tbody>
              <tr><td class="text-grey">Mã phiếu</td><td class="font-weight-medium">{{ invoice.id }}</td></tr>
              <tr><td class="text-grey">Sinh viên</td><td>{{ invoice.studentName }} ({{ invoice.studentCode }})</td></tr>
              <tr><td class="text-grey">Phòng</td><td>{{ invoice.roomNumber }}</td></tr>
              <tr><td class="text-grey">Kỳ</td><td>{{ invoice.period }}</td></tr>
              <tr><td class="text-grey">Số tiền</td><td class="font-weight-bold text-primary">{{ formatCurrency(invoice.amount) }}</td></tr>
              <tr><td class="text-grey">Hạn nộp</td><td>{{ formatDate(invoice.dueDate) }}</td></tr>
                          </tbody>
          </v-table>
        </v-col>
        <v-col cols="12" md="6" v-if="invoice.status==='PAID'">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Thông tin thanh toán</h3>
          <v-table density="compact">
            <tbody>
              <tr><td class="text-grey">Ngày nộp</td><td>{{ formatDate(invoice.paidDate) }}</td></tr>
              <tr><td class="text-grey">Phương thức</td><td>{{ invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản' }}</td></tr>
              <tr><td class="text-grey">Ghi chú</td><td>{{ invoice.note || '—' }}</td></tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
    </v-card>
    <v-skeleton-loader v-else type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'

const route = useRoute()
const invoice = ref<any>(null)

onMounted(async () => {
  try {
    const { data } = await http.get(`/api/invoices/${route.params.id}`)
    invoice.value = data
  } catch(e) { console.error(e) }
})
</script>
