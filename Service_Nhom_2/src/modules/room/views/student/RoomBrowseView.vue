<template>
  <div>
    <PageHeader title="Xem phòng trống" subtitle="Tìm phòng phù hợp để đăng ký" />
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="4"><v-select v-model="buildingFilter" :items="[{title:'Tất cả',value:''},...buildingOptions]" label="Tòa nhà" density="compact" @update:model-value="loadData" /></v-col>
        <v-col cols="12" sm="3"><v-select v-model="typeFilter" :items="[{title:'Tất cả',value:''},...typeOptions]" label="Loại phòng" density="compact" @update:model-value="loadData" /></v-col>
      </v-row>
    </v-card>
    <div v-if="loading" class="d-flex justify-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="!items.length"><EmptyState icon="mdi-bed-empty" title="Không tìm thấy phòng trống" description="Thử thay đổi bộ lọc." /></div>
    <v-row v-else>
      <v-col v-for="room in items" :key="room.roomId" cols="12" sm="6" md="4">
        <v-card class="pa-4">
          <div class="d-flex align-center mb-2"><v-icon color="primary" class="mr-2">mdi-door</v-icon><span class="text-subtitle-1 font-weight-bold">{{ room.roomNumber }}</span><v-spacer /><v-chip size="small" variant="tonal" color="success">{{ room.availableSlots }} chỗ trống</v-chip></div>
          <div class="text-body-2 text-grey mb-1"><v-icon size="14">mdi-office-building</v-icon> {{ room.building?.name }}</div>
          <div class="text-body-2 text-grey mb-1"><v-icon size="14">mdi-bed</v-icon> {{ room.roomType?.typeName || 'Phòng' }} ({{ room.roomType?.capacity }} người)</div>
          <div class="text-body-2 text-grey mb-3"><v-icon size="14">mdi-stairs</v-icon> Tầng {{ room.floorNumber }}</div>
          <div class="text-h6 font-weight-bold text-primary mb-3">{{ formatCurrency(room.roomType?.basePrice) }}/tháng</div>
          <v-progress-linear :model-value="(room.currentOccupancy/room.roomType?.capacity)*100" color="primary" height="8" rounded class="mb-2" />
          <div class="text-caption text-grey">{{ room.currentOccupancy }}/{{ room.roomType?.capacity }} đã ở</div>
          <v-btn block variant="flat" color="primary" class="mt-3" prepend-icon="mdi-clipboard-text" @click="openApplicationForm(room)">Đăng ký</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="600">
      <v-card class="pa-2 rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Đăng ký phòng</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showDialog = false" />
        </v-card-title>
        <v-card-text>
          <v-stepper v-model="step" :items="['Chọn phòng', 'Thời gian', 'Xác nhận']" flat hide-actions>
            <template #item.1>
              <div class="pa-2">
                <v-select v-model="form.buildingId" :items="buildingOptions" label="Tòa nhà *" class="mb-3" />
                <v-select v-model="form.roomTypeId" :items="typeOptions" label="Loại phòng *" class="mb-3" />
                <v-text-field v-model.number="form.preferredFloor" label="Tầng mong muốn (không bắt buộc)" type="number" class="mb-3" />
                <div class="d-flex justify-end"><v-btn color="primary" @click="step=2" :disabled="!form.buildingId||!form.roomTypeId">Tiếp theo</v-btn></div>
              </div>
            </template>
            <template #item.2>
              <div class="pa-2">
                <v-row dense>
                  <v-col cols="6"><v-text-field v-model="form.expectedStartDate" label="Ngày bắt đầu *" type="date" /></v-col>
                  <v-col cols="6"><v-text-field v-model="form.expectedEndDate" label="Ngày kết thúc *" type="date" /></v-col>
                </v-row>
                <v-textarea v-model="form.note" label="Ghi chú" rows="2" class="mt-3 mb-4" />
                <div class="d-flex ga-3 justify-end"><v-btn variant="text" @click="step=1">Quay lại</v-btn><v-btn color="primary" @click="step=3" :disabled="!form.expectedStartDate||!form.expectedEndDate">Tiếp theo</v-btn></div>
              </div>
            </template>
            <template #item.3>
              <div class="pa-2">
                <v-alert type="info" variant="tonal" class="mb-4">Kiểm tra thông tin trước khi gửi đơn</v-alert>
                <v-table density="compact"><tbody>
                  <tr><td class="text-grey">Tòa nhà</td><td>{{ buildingOptions.find(b=>b.value===form.buildingId)?.title }}</td></tr>
                  <tr><td class="text-grey">Loại phòng</td><td>{{ typeOptions.find(r=>r.value===form.roomTypeId)?.title }}</td></tr>
                  <tr><td class="text-grey">Tầng</td><td>{{ form.preferredFloor || 'Không chỉ định' }}</td></tr>
                  <tr><td class="text-grey">Thời gian</td><td>{{ form.expectedStartDate }} — {{ form.expectedEndDate }}</td></tr>
                  <tr><td class="text-grey">Ghi chú</td><td>{{ form.note || '—' }}</td></tr>
                </tbody></v-table>
                <div class="d-flex ga-3 mt-4 justify-end"><v-btn variant="text" @click="step=2">Quay lại</v-btn><v-btn color="primary" variant="flat" :loading="submitting" @click="submitApp" prepend-icon="mdi-send">Gửi đơn</v-btn></div>
              </div>
            </template>
          </v-stepper>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { http } from '@/shared/http'
import { formatCurrency } from '@/shared/utils/formatters'
import { useAuthStore } from '@/shared/stores/authStore'
import { useNotify } from '@/shared/composables/useNotify'

const router = useRouter(); const auth = useAuthStore(); const { success } = useNotify()
const items = ref<any[]>([]); const loading = ref(false)
const buildingFilter = ref(''); const typeFilter = ref('')
const buildingOptions = ref<any[]>([]); const typeOptions = ref<any[]>([])

const showDialog = ref(false)
const step = ref(1)
const submitting = ref(false)
const form = ref({ buildingId: '', roomTypeId: '', roomId: '', preferredFloor: null as number|null, expectedStartDate: '', expectedEndDate: '', note: '' })

function openApplicationForm(room: any) {
  form.value = {
    buildingId: room.buildingId || room.building?.id || '',
    roomTypeId: room.roomTypeId || room.roomType?.id || '',
    roomId: room.id || room.roomId || '',
    preferredFloor: room.floorNumber || null,
    expectedStartDate: '',
    expectedEndDate: '',
    note: ''
  }
  step.value = 1
  showDialog.value = true
}

async function submitApp() {
  submitting.value = true
  try {
    const { data } = await http.post('/api/room-applications', { ...form.value, studentId: auth.user?.studentId })
    await http.patch(`/api/room-applications/${data.id}/submit`)
    success('Đã gửi đơn đăng ký')
    showDialog.value = false
    router.push('/contract/my-application/status')
  } catch(e) { console.error(e) } finally { submitting.value = false }
}

async function loadData() {
  loading.value = true
  try { const { data } = await http.get('/api/rooms/available'); items.value = data } catch(e) { console.error(e) } finally { loading.value = false }
}

onMounted(async () => {
  try {
    const [bRes, rtRes] = await Promise.all([http.get('/api/buildings'), http.get('/api/roomtypes')])
    buildingOptions.value = bRes.data.map((b:any)=>({title:b.name,value:b.id}))
    typeOptions.value = rtRes.data.map((rt:any)=>({title:rt.typeName,value:rt.id}))
  } catch(e) { console.error(e) }
  loadData()
})
</script>
