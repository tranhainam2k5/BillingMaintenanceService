<template>
  <div>
    <PageHeader title="Phiếu thu">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreate = true">Tạo phiếu thu</v-btn>
      </template>
    </PageHeader>

    <!-- Summary -->
    <v-row class="mb-4">
      <v-col v-for="s in summaryCards" :key="s.label" cols="6" md="3">
        <v-card class="pa-3 text-center"><div class="text-h6 font-weight-bold" :class="'text-'+s.color">{{ s.value }}</div><div class="text-caption">{{ s.label }}</div></v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" placeholder="Tìm SV..." clearable density="compact" @update:model-value="loadData" /></v-col>
              </v-row>
    </v-card>

    <!-- Table -->
    <v-card>
      <v-data-table-server
        :headers="headers" :items="items" :items-length="total" :loading="loading"
        :items-per-page="pageSize" :page="page"
        @update:page="page=$event; loadData()" @update:items-per-page="pageSize=$event; loadData()"
        :row-props="rowProps"
      >
        <template #item.amount="{ item }">{{ formatCurrency(item.amount) }}</template>
                <template #item.dueDate="{ item }">{{ formatDate(item.dueDate) }}</template>
        <template #item.paidDate="{ item }">{{ item.paidDate ? formatDate(item.paidDate) : '—' }}</template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="router.push('/billing/invoices/'+item.id)"><v-icon>mdi-eye</v-icon></v-btn>
          <v-btn v-if="item.status==='UNPAID'||item.status==='OVERDUE'" icon size="small" variant="text" color="success" @click="openPay(item)"><v-icon>mdi-cash</v-icon></v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Pay Dialog -->
    <v-dialog v-model="showPay" max-width="480" persistent>
      <v-card>
        <v-card-title class="pt-5 px-6"><v-icon color="success" class="mr-2">mdi-cash-check</v-icon>Thu tiền</v-card-title>
        <v-card-text class="px-6">
          <div class="mb-4"><strong>{{ payItem?.studentName }}</strong> — {{ payItem?.roomNumber }} — {{ formatCurrency(payItem?.amount||0) }}</div>
          <v-select v-model="payMethod" :items="PAYMENT_METHOD_OPTIONS" label="Phương thức" />
          <v-text-field v-model="payNote" label="Ghi chú" />
        </v-card-text>
        <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showPay=false">Hủy</v-btn><v-btn color="success" variant="flat" @click="confirmPay" :loading="paying">Xác nhận thu tiền</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Invoice Dialog -->
    <v-dialog v-model="showCreate" max-width="540" persistent>
      <v-card style="position: relative;">
        <v-btn
          icon="mdi-close"
          variant="text"
          color="grey-darken-1"
          class="position-absolute top-0 right-0 ma-2"
          style="z-index: 10;"
          @click="closeCreate"
          aria-label="Đóng"
        />
        <v-card-title class="pt-5 px-6"><v-icon color="primary" class="mr-2">mdi-receipt-text-plus</v-icon>Tạo phiếu thu mới</v-card-title>
        <v-card-text class="px-6">
          <v-autocomplete
            v-model="createSelectedStudent"
            :items="students"
            item-value="id"
            item-title="fullName"
            label="Chọn sinh viên *"
            placeholder="Nhập tên hoặc mã sinh viên để tìm..."
            :loading="loadingStudents"
            return-object
            variant="outlined"
            class="mb-3"
            @focus="loadStudents"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="item.raw.fullName" :subtitle="item.raw.studentCode + ' - Phòng: ' + (item.raw.activeRoomNumber || 'Chưa xếp phòng')" />
            </template>
          </v-autocomplete>
          
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="createForm.amount"
                label="Số tiền *"
                type="number"
                suffix="₫"
                variant="outlined"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="createForm.period"
                label="Kỳ đóng (Tháng/Năm) *"
                placeholder="Ví dụ: 06/2026"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="createForm.dueDate"
                label="Hạn nộp *"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="createForm.note"
                label="Ghi chú"
                rows="2"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeCreate">Hủy</v-btn>
          <v-btn color="primary" variant="flat" :loading="creating" :disabled="!isCreateFormValid" @click="confirmCreate">Tạo phiếu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { PAYMENT_METHOD_OPTIONS } from '@/shared/utils/constants'
import { useNotify } from '@/shared/composables/useNotify'

const router = useRouter()
const { success } = useNotify()
const items = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const showCreate = ref(false)
const showPay = ref(false)
const payItem = ref<any>(null)
const payMethod = ref('CASH')
const payNote = ref('')
const paying = ref(false)

// Create Invoice variables
const createSelectedStudent = ref<any>(null)
const students = ref<any[]>([])
const loadingStudents = ref(false)
const creating = ref(false)
const createForm = ref({
  amount: 0,
  period: '',
  dueDate: '',
  note: ''
})

const isCreateFormValid = computed(() => {
  return !!(createSelectedStudent.value && createForm.value.amount > 0 && createForm.value.period && createForm.value.dueDate)
})

const headers = [
  { title: 'Mã phiếu', key: 'id', width: 100 },
  { title: 'Sinh viên', key: 'studentName' },
  { title: 'Phòng', key: 'roomNumber', width: 80 },
  { title: 'Kỳ', key: 'period', width: 80 },
  { title: 'Số tiền', key: 'amount', width: 130 },
  { title: 'Hạn nộp', key: 'dueDate', width: 110 },
  { title: 'Ngày nộp', key: 'paidDate', width: 110 },
  
  { title: '', key: 'actions', width: 100, sortable: false },
]

const summaryCards = computed(() => {
  const all = items.value
  return [
    { label: 'Tổng phiếu', value: total.value, color: 'primary' },
    { label: 'Đã thanh toán', value: all.filter(i=>i.status==='PAID').length, color: 'success' },
    { label: 'Chưa TT', value: all.filter(i=>i.status==='UNPAID').length, color: 'warning' },
    { label: 'Quá hạn', value: all.filter(i=>i.status==='OVERDUE').length, color: 'error' },
  ]
})

function rowProps({ item }: any) {
  return item.status === 'OVERDUE' ? { class: 'bg-red-lighten-5' } : {}
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await http.get('/api/invoices', { params: { keyword: search.value, status: statusFilter.value, page: page.value, pageSize: pageSize.value } })
    items.value = data.items; total.value = data.totalItems
  } catch(e) { console.error(e) } finally { loading.value = false }
}

function openPay(item: any) { payItem.value = item; showPay.value = true }

async function confirmPay() {
  paying.value = true
  try {
    await http.patch(`/api/invoices/${payItem.value.id}/pay`, { paymentMethod: payMethod.value, paidDate: new Date().toISOString() })
    success('Đã ghi nhận thanh toán')
    showPay.value = false; loadData()
  } catch(e) { console.error(e) } finally { paying.value = false }
}

let studentsLoaded = false
async function loadStudents() {
  if (studentsLoaded) return
  loadingStudents.value = true
  try {
    const { data } = await http.get('/api/students', { params: { pageSize: 200 } })
    students.value = data.items || []
    studentsLoaded = true
  } catch (e) {
    console.error('Lỗi khi tải danh sách sinh viên', e)
  } finally {
    loadingStudents.value = false
  }
}

function closeCreate() {
  showCreate.value = false
  createSelectedStudent.value = null
  createForm.value = {
    amount: 0,
    period: '',
    dueDate: '',
    note: ''
  }
}

async function confirmCreate() {
  if (!isCreateFormValid.value) return
  creating.value = true
  try {
    await http.post('/api/invoices', {
      studentId: createSelectedStudent.value.id,
      studentCode: createSelectedStudent.value.studentCode,
      studentName: createSelectedStudent.value.fullName,
      roomNumber: createSelectedStudent.value.activeRoomNumber || '—',
      amount: createForm.value.amount,
      period: createForm.value.period,
      dueDate: createForm.value.dueDate,
      note: createForm.value.note
    })
    success('Tạo phiếu thu thành công')
    closeCreate()
    loadData()
  } catch (e) {
    console.error(e)
  } finally {
    creating.value = false
  }
}

onMounted(loadData)
</script>
