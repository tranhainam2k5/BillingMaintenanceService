<template>
  <div>
    <PageHeader :title="'Hợp đồng ' + (ct?.contractCode || '')" back />

    <v-row v-if="ct">
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Thông tin hợp đồng</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">Mã HĐ</td><td class="font-weight-medium">{{ ct.contractCode }}</td></tr>
            <tr><td class="text-grey">Sinh viên</td><td><router-link :to="'/contract/students/'+ct.studentId" class="text-primary">{{ ct.studentName }} ({{ ct.studentCode }})</router-link></td></tr>
            <tr><td class="text-grey">Phòng</td><td>{{ ct.roomNumberSnapshot }} — {{ ct.bedNumberSnapshot }}</td></tr>
            <tr><td class="text-grey">Loại phòng</td><td>{{ ct.roomTypeNameSnapshot }}</td></tr>
            <tr><td class="text-grey">Giá/tháng</td><td class="font-weight-bold text-primary">{{ formatCurrency(ct.monthlyPrice) }}</td></tr>
            <tr><td class="text-grey">Đặt cọc</td><td>{{ formatCurrency(ct.depositAmount) }}</td></tr>
            <tr><td class="text-grey">Chu kỳ TT</td><td>{{ formatEnum(ct.paymentCycle) }}</td></tr>
            <tr><td class="text-grey">Bắt đầu</td><td>{{ formatDate(ct.startDate) }}</td></tr>
            <tr><td class="text-grey">Kết thúc</td><td>{{ formatDate(ct.endDate) }}</td></tr>
                      </tbody></v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" v-if="ct.status==='ACTIVE'">
        <v-card class="pa-4 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Thao tác</h3>
          <v-btn color="secondary" block variant="outlined" class="mb-2" prepend-icon="mdi-calendar-plus" @click="showExtend=true">Gia hạn</v-btn>
          <v-btn color="error" block variant="outlined" class="mb-2" prepend-icon="mdi-file-remove" @click="showTerminate=true">Chấm dứt</v-btn>
        </v-card>
        <!-- Contract Progress -->
        <v-card class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Tiến độ</h3>
          <v-progress-linear :model-value="progress" :color="progress>80?'error':progress>60?'warning':'success'" height="20" rounded><template #default>{{ progress }}%</template></v-progress-linear>
          <div class="text-caption text-grey mt-2">{{ daysRemaining }} ngày còn lại</div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showExtend" max-width="400">
      <v-card><v-card-title class="pt-5 px-6">Gia hạn hợp đồng</v-card-title>
      <v-card-text class="px-6"><v-text-field v-model="newEndDate" label="Ngày kết thúc mới" type="date" /></v-card-text>
      <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showExtend=false">Hủy</v-btn><v-btn color="primary" variant="flat" @click="doExtend">Gia hạn</v-btn></v-card-actions></v-card>
    </v-dialog>

    <v-dialog v-model="showTerminate" max-width="440">
      <v-card><v-card-title class="pt-5 px-6"><v-icon color="error" class="mr-2">mdi-alert</v-icon>Chấm dứt hợp đồng</v-card-title>
      <v-card-text class="px-6"><v-textarea v-model="terminateReason" label="Lý do chấm dứt *" rows="3" /></v-card-text>
      <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showTerminate=false">Hủy</v-btn><v-btn color="error" variant="flat" @click="doTerminate">Chấm dứt</v-btn></v-card-actions></v-card>
    </v-dialog>
    <v-skeleton-loader v-if="!ct" type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatCurrency, formatDate, formatEnum } from '@/shared/utils/formatters'
import { useNotify } from '@/shared/composables/useNotify'
import dayjs from 'dayjs'

const route = useRoute(); const router = useRouter(); const { success } = useNotify()
const ct = ref<any>(null)
const showExtend = ref(false); const newEndDate = ref('')
const showTerminate = ref(false); const terminateReason = ref('')

const progress = computed(() => { if (!ct.value) return 0; const total = dayjs(ct.value.endDate).diff(ct.value.startDate, 'day'); const elapsed = dayjs().diff(ct.value.startDate, 'day'); return Math.min(100, Math.round((elapsed / total) * 100)) })
const daysRemaining = computed(() => ct.value ? Math.max(0, dayjs(ct.value.endDate).diff(dayjs(), 'day')) : 0)

async function doExtend() { try { await http.patch(`/api/contracts/${route.params.id}/extend`, { newEndDate: newEndDate.value }); success('Đã gia hạn'); showExtend.value = false; loadData() } catch(e) { console.error(e) } }
async function doTerminate() { try { await http.patch(`/api/contracts/${route.params.id}/terminate`, { terminateReason: terminateReason.value, terminatedAt: new Date().toISOString() }); success('Đã chấm dứt'); router.push('/contract/contracts') } catch(e) { console.error(e) } }

async function loadData() { try { const { data } = await http.get(`/api/contracts/${route.params.id}`); ct.value = data } catch(e) { console.error(e) } }
onMounted(loadData)
</script>
