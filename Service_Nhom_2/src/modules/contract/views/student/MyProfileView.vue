<template>
  <div>
    <PageHeader title="Hồ sơ của tôi" back />
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4" v-if="student">
          <div class="d-flex align-center mb-4"><v-avatar color="primary" size="56" class="mr-4"><span class="text-h6 text-white">{{ initials }}</span></v-avatar><div><div class="text-h6 font-weight-bold">{{ student.fullName }}</div><div class="text-body-2 text-grey">{{ student.studentCode }} — {{ student.faculty }}</div></div></div>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="120">Giới tính</td><td>{{ formatEnum(student.gender) }}</td></tr>
            <tr><td class="text-grey">Ngày sinh</td><td>{{ formatDate(student.dateOfBirth) }}</td></tr>
            <tr><td class="text-grey">SĐT</td><td>{{ student.phoneNumber }}</td></tr>
            <tr><td class="text-grey">Email</td><td>{{ student.email }}</td></tr>
            <tr><td class="text-grey">Địa chỉ</td><td>{{ student.address }}</td></tr>
          </tbody></v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card v-if="occupancy" class="pa-4 mb-4" color="success" variant="tonal">
          <div class="d-flex align-center mb-2"><v-icon class="mr-2">mdi-home-account</v-icon><h3 class="text-subtitle-1 font-weight-bold">Nơi ở hiện tại</h3></div>
          <div class="text-h5 font-weight-bold mb-1">Phòng {{ occupancy.roomNumberSnapshot }}</div>
          <div class="text-body-2">Giường {{ occupancy.bedNumberSnapshot }}</div>
          <div class="text-body-2 text-grey">Check-in: {{ formatDate(occupancy.checkInDate) }}</div>
        </v-card>
        <v-card v-else class="pa-4 mb-4" variant="tonal" color="info">
          <div class="d-flex align-center"><v-icon class="mr-2">mdi-information</v-icon><span>Bạn chưa được xếp phòng</span></div>
          <v-btn color="primary" variant="flat" class="mt-3" to="/contract/my-application" prepend-icon="mdi-clipboard-text">Đăng ký phòng</v-btn>
        </v-card>
        <v-card v-if="contract" class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Hợp đồng hiện tại</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="120">Mã HĐ</td><td class="font-weight-medium">{{ contract.contractCode }}</td></tr>
            <tr><td class="text-grey">Thời hạn</td><td>{{ formatDate(contract.startDate) }} — {{ formatDate(contract.endDate) }}</td></tr>
            <tr><td class="text-grey">Giá/tháng</td><td class="font-weight-bold text-primary">{{ formatCurrency(contract.monthlyPrice) }}</td></tr>
                      </tbody></v-table>
        </v-card>
      </v-col>
    </v-row>
    <v-skeleton-loader v-if="!student" type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatDate, formatEnum, formatCurrency } from '@/shared/utils/formatters'
import { useAuthStore } from '@/shared/stores/authStore'

const auth = useAuthStore()
const student = ref<any>(null); const contract = ref<any>(null); const occupancy = ref<any>(null)
const initials = computed(() => student.value?.fullName?.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase() || '')

onMounted(async () => {
  const sid = auth.user?.studentId
  if (!sid) return
  try {
    const [sRes] = await Promise.all([http.get(`/api/students/${sid}/summary`)])
    student.value = sRes.data.student; contract.value = sRes.data.activeContract
  } catch(e) { 
    console.error('Failed to fetch student summary:', e)
    // Fallback to mock user data from auth store if API fails
    if (auth.user) {
      student.value = {
        fullName: auth.user.fullName,
        studentCode: auth.user.studentCode || 'Chưa cập nhật',
        email: auth.user.email || 'Chưa cập nhật',
        faculty: 'Chưa cập nhật',
        gender: 'UNKNOWN',
        dateOfBirth: null,
        phoneNumber: auth.user.phone || 'Chưa cập nhật',
        address: 'Chưa cập nhật'
      }
    }
  }
  try { const { data } = await http.get(`/api/occupancies/student/${sid}/current`); occupancy.value = data } catch {}
})
</script>
