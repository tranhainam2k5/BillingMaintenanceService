<template>
  <div>
    <PageHeader title="Hợp đồng của tôi" back />
    <div v-if="loading" class="d-flex justify-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="!contract"><EmptyState icon="mdi-file-document-remove" title="Chưa có hợp đồng" description="Bạn chưa có hợp đồng nào." /></div>
    <v-row v-else>
      <v-col cols="12" md="7">
        <v-card class="pa-6 rounded-xl">
          <div class="d-flex align-center mb-4"><v-icon color="primary" size="32" class="mr-3">mdi-file-document-check</v-icon><div><div class="text-h6 font-weight-bold">{{ contract.contractCode }}</div></div></div>
          <v-divider class="my-4" />
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">Phòng</td><td class="font-weight-medium">{{ contract.roomNumberSnapshot }} — {{ contract.bedNumberSnapshot }}</td></tr>
            <tr><td class="text-grey">Loại phòng</td><td>{{ contract.roomTypeNameSnapshot }}</td></tr>
            <tr><td class="text-grey">Bắt đầu</td><td>{{ formatDate(contract.startDate) }}</td></tr>
            <tr><td class="text-grey">Kết thúc</td><td>{{ formatDate(contract.endDate) }}</td></tr>
            <tr><td class="text-grey">Giá/tháng</td><td class="text-h6 font-weight-bold text-primary">{{ formatCurrency(contract.monthlyPrice) }}</td></tr>
            <tr><td class="text-grey">Đặt cọc</td><td>{{ formatCurrency(contract.depositAmount) }}</td></tr>
            <tr><td class="text-grey">Chu kỳ TT</td><td>{{ formatEnum(contract.paymentCycle) }}</td></tr>
          </tbody></v-table>
          <v-divider class="my-4" />
          <h4 class="text-subtitle-2 font-weight-bold mb-2">Tiến độ hợp đồng</h4>
          <v-progress-linear :model-value="progress" :color="progress>80?'error':progress>60?'warning':'success'" height="24" rounded class="mb-2"><template #default>{{ progress }}% — còn {{ daysLeft }} ngày</template></v-progress-linear>
        </v-card>
      </v-col>

      <v-col cols="12" md="5" class="d-none d-md-block">
        <v-card class="pa-6 rounded-xl fill-height d-flex flex-column" color="indigo-lighten-5" flat>
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" size="28" class="mr-2">mdi-shield-alert-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-indigo-darken-4">Quy định Lưu trú</h3>
          </div>
          
          <p class="text-body-2 text-grey-darken-3 mb-4 leading-relaxed">
            Để đảm bảo môi trường sinh hoạt văn minh, an toàn và lành mạnh tại Ký túc xá, sinh viên lưu ý các quy định sau:
          </p>
          
          <div class="d-flex flex-column ga-3 mb-6 text-body-2 text-grey-darken-3">
            <div class="d-flex align-start">
              <v-icon color="indigo" size="18" class="mr-2 mt-1">mdi-clock-outline</v-icon>
              <span><strong>Giờ giới nghiêm:</strong> KTX mở cửa từ 05:00 và đóng cửa lúc 23:00 hàng ngày. Sinh viên đi muộn phải báo trước với Trưởng nhà.</span>
            </div>
            <div class="d-flex align-start">
              <v-icon color="indigo" size="18" class="mr-2 mt-1">mdi-fire-off</v-icon>
              <span><strong>An toàn cháy nổ:</strong> Tuyệt đối không tự ý nấu ăn trong phòng ở, không sử dụng các thiết bị điện công suất lớn trái quy định.</span>
            </div>
            <div class="d-flex align-start">
              <v-icon color="indigo" size="18" class="mr-2 mt-1">mdi-account-group-outline</v-icon>
              <span><strong>Vệ sinh & Tự quản:</strong> Giữ gìn vệ sinh chung, sắp xếp đồ đạc gọn gàng và tham gia tổng vệ sinh phòng hàng tuần.</span>
            </div>
          </div>
          
          <v-spacer />
          
          <v-divider class="mb-4" />
          
          <div class="text-caption text-indigo-darken-3 bg-white pa-3 rounded-lg border-dashed">
            <v-icon color="indigo" class="mr-1" size="16">mdi-information</v-icon>
            <strong>Gia hạn / Kết thúc:</strong> Sinh viên có nhu cầu gia hạn hợp đồng hoặc làm thủ tục trả phòng dọn đi phải thông báo cho BQL trước **15 ngày** khi hợp đồng hết hạn.
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { http } from '@/shared/http'
import { formatDate, formatCurrency, formatEnum } from '@/shared/utils/formatters'
import { useAuthStore } from '@/shared/stores/authStore'
import dayjs from 'dayjs'

const auth = useAuthStore()
const contract = ref<any>(null); const loading = ref(false)
const progress = computed(() => { if (!contract.value) return 0; const t = dayjs(contract.value.endDate).diff(contract.value.startDate,'day'); const e = dayjs().diff(contract.value.startDate,'day'); return Math.min(100,Math.round((e/t)*100)) })
const daysLeft = computed(() => contract.value ? Math.max(0, dayjs(contract.value.endDate).diff(dayjs(),'day')) : 0)

onMounted(async () => {
  loading.value = true
  try { const { data } = await http.get(`/api/contracts/student/${auth.user?.studentId}/active`); contract.value = data } catch { contract.value = null } finally { loading.value = false }
})
</script>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(57, 73, 171, 0.3) !important;
}
</style>
