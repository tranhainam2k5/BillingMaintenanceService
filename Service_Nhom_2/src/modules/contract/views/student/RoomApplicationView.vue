<template>
  <div>
    <PageHeader title="Đăng ký phòng" back />
    
    <v-row>
      <v-col cols="12" md="7">
        <v-card class="pa-6 rounded-xl">
          <v-stepper v-model="step" :items="['Chọn phòng', 'Thông tin', 'Xác nhận']" flat hide-actions>
            <template #item.1>
              <div class="pa-4">
                <v-select v-model="form.buildingId" :items="buildingOptions" label="Chọn tòa nhà *" class="mb-3" />
                <v-select v-model="form.roomTypeId" :items="roomTypeOptions" label="Loại phòng *" class="mb-3" />
                <v-text-field v-model.number="form.preferredFloor" label="Tầng mong muốn (không bắt buộc)" type="number" class="mb-3" />
                <v-btn color="primary" @click="step=2" :disabled="!form.buildingId||!form.roomTypeId">Tiếp theo</v-btn>
              </div>
            </template>
            <template #item.2>
              <div class="pa-4">
                <v-row dense>
                  <v-col cols="6"><v-text-field v-model="form.expectedStartDate" label="Ngày bắt đầu *" type="date" /></v-col>
                  <v-col cols="6"><v-text-field v-model="form.expectedEndDate" label="Ngày kết thúc *" type="date" /></v-col>
                </v-row>
                <v-textarea v-model="form.note" label="Ghi chú" rows="3" class="mt-3 mb-4" />
                <div class="d-flex ga-3"><v-btn variant="text" @click="step=1">Quay lại</v-btn><v-btn color="primary" @click="step=3" :disabled="!form.expectedStartDate||!form.expectedEndDate">Tiếp theo</v-btn></div>
              </div>
            </template>
            <template #item.3>
              <div class="pa-4">
                <v-alert type="info" variant="tonal" class="mb-4">Kiểm tra thông tin trước khi gửi đơn</v-alert>
                <v-table density="compact"><tbody>
                  <tr><td class="text-grey">Tòa nhà</td><td>{{ buildingOptions.find(b=>b.value===form.buildingId)?.title }}</td></tr>
                  <tr><td class="text-grey">Loại phòng</td><td>{{ roomTypeOptions.find(r=>r.value===form.roomTypeId)?.title }}</td></tr>
                  <tr><td class="text-grey">Tầng</td><td>{{ form.preferredFloor || 'Không chỉ định' }}</td></tr>
                  <tr><td class="text-grey">Thời gian</td><td>{{ form.expectedStartDate }} — {{ form.expectedEndDate }}</td></tr>
                  <tr><td class="text-grey">Ghi chú</td><td>{{ form.note || '—' }}</td></tr>
                </tbody></v-table>
                <div class="d-flex ga-3 mt-4"><v-btn variant="text" @click="step=2">Quay lại</v-btn><v-btn color="primary" variant="flat" :loading="submitting" @click="submitApp" prepend-icon="mdi-send">Gửi đơn</v-btn></div>
              </div>
            </template>
          </v-stepper>
        </v-card>
      </v-col>

      <v-col cols="12" md="5" class="d-none d-md-block">
        <v-card class="pa-6 rounded-xl fill-height d-flex flex-column" color="indigo-lighten-5" flat>
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" size="28" class="mr-2">mdi-information-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-indigo-darken-4">Hướng dẫn đăng ký</h3>
          </div>
          
          <p class="text-body-2 text-grey-darken-3 mb-4 leading-relaxed">
            Hệ thống đăng ký phòng ở Ký túc xá giúp sinh viên dễ dàng chọn lựa không gian sống phù hợp thông qua 3 bước:
          </p>
          
          <div class="d-flex flex-column ga-4 mb-6">
            <div class="d-flex align-start">
              <v-avatar size="24" color="primary" class="mr-2 text-white font-weight-bold text-caption" style="min-width: 24px">1</v-avatar>
              <div>
                <div class="text-body-2 font-weight-bold text-grey-darken-4">Chọn phòng & Tòa nhà</div>
                <div class="text-caption text-grey-darken-1">Lựa chọn khu KTX nam/nữ và loại phòng (4/6/8 người).</div>
              </div>
            </div>
            
            <div class="d-flex align-start">
              <v-avatar size="24" color="primary" class="mr-2 text-white font-weight-bold text-caption" style="min-width: 24px">2</v-avatar>
              <div>
                <div class="text-body-2 font-weight-bold text-grey-darken-4">Thời gian lưu trú</div>
                <div class="text-caption text-grey-darken-1">Điền ngày bắt đầu và kết thúc niên học mong muốn lưu trú.</div>
              </div>
            </div>
            
            <div class="d-flex align-start">
              <v-avatar size="24" color="primary" class="mr-2 text-white font-weight-bold text-caption" style="min-width: 24px">3</v-avatar>
              <div>
                <div class="text-body-2 font-weight-bold text-grey-darken-4">Xác nhận hồ sơ</div>
                <div class="text-caption text-grey-darken-1">Kiểm tra thông tin chi tiết và gửi yêu cầu đến Ban quản lý.</div>
              </div>
            </div>
          </div>
          
          <v-spacer />
          
          <v-divider class="mb-4" />
          
          <div class="text-caption text-indigo-darken-3 bg-white pa-3 rounded-lg border-dashed">
            <v-icon color="indigo" class="mr-1" size="16">mdi-alert-circle</v-icon>
            <strong>Lưu ý:</strong> Sau khi đơn được xét duyệt, bạn sẽ nhận được thông báo nộp lệ phí qua mục <em>Phiếu thu</em> trong vòng 3 ngày làm việc.
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { useAuthStore } from '@/shared/stores/authStore'
import { useNotify } from '@/shared/composables/useNotify'

const router = useRouter(); const auth = useAuthStore(); const { success } = useNotify()
const step = ref(1); const submitting = ref(false)
const buildingOptions = ref<any[]>([]); const roomTypeOptions = ref<any[]>([])
const form = ref({ buildingId: '', roomTypeId: '', preferredFloor: null as number|null, expectedStartDate: '', expectedEndDate: '', note: '' })

async function submitApp() {
  submitting.value = true
  try {
    const { data } = await http.post('/api/room-applications', { ...form.value, studentId: auth.user?.studentId })
    await http.patch(`/api/room-applications/${data.id}/submit`)
    success('Đã gửi đơn đăng ký')
    router.push('/contract/my-application/status')
  } catch(e) { console.error(e) } finally { submitting.value = false }
}

onMounted(async () => {
  try {
    const [bRes, rtRes] = await Promise.all([http.get('/api/buildings'), http.get('/api/roomtypes')])
    buildingOptions.value = bRes.data.filter((b:any)=>b.status==='ACTIVE').map((b:any)=>({title:b.name,value:b.id}))
    roomTypeOptions.value = rtRes.data.map((rt:any)=>({title:`${rt.typeName} (${rt.capacity} người)`,value:rt.id}))
  } catch(e) { console.error(e) }
})
</script>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(57, 73, 171, 0.3) !important;
}
</style>
