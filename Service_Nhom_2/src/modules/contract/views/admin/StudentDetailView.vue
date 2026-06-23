<template>
  <div>
    <PageHeader :title="student?.fullName || 'Chi tiết sinh viên'" back />

    <v-row v-if="student">
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <!-- Profile Header Section -->
          <div class="d-flex align-center flex-column flex-sm-row mb-6">
            <div class="mr-sm-6 mb-4 mb-sm-0 border rounded-lg elevation-1 bg-grey-lighten-4" style="width: 100px; height: 133px; overflow: hidden;">
              <v-img v-if="student.avatarUrl" :src="student.avatarUrl" cover height="133" width="100" />
              <div v-else class="d-flex flex-column align-center justify-center fill-height text-grey-darken-1">
                <v-icon size="48">mdi-account-box</v-icon>
                <span class="text-caption font-weight-bold mt-1">Ảnh 3x4</span>
              </div>
            </div>
            <div class="text-center text-sm-left">
              <h2 class="text-h5 font-weight-bold mb-1">{{ student.fullName }}</h2>
              <div class="text-subtitle-1 text-grey-darken-1 mb-2">Mã SV: <span class="font-weight-bold">{{ student.studentCode }}</span></div>
              
            </div>
          </div>
          
          <v-divider class="mb-4" />
          
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Thông tin cá nhân</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">Giới tính</td><td>{{ formatEnum(student.gender) }}</td></tr>
            <tr><td class="text-grey">Ngày sinh</td><td>{{ formatDate(student.dateOfBirth) }}</td></tr>
            <tr><td class="text-grey">CCCD</td><td>{{ student.citizenId }}</td></tr>
            <tr><td class="text-grey">Khoa</td><td>{{ student.faculty }}</td></tr>
            <tr><td class="text-grey">Lớp</td><td>{{ student.className }}</td></tr>
          </tbody></v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Liên hệ</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">SĐT</td><td>{{ student.phoneNumber }}</td></tr>
            <tr><td class="text-grey">Email</td><td>{{ student.email }}</td></tr>
            <tr><td class="text-grey">Địa chỉ</td><td>{{ student.address }}</td></tr>
            <tr><td class="text-grey">Phụ huynh</td><td>{{ student.guardianName }}</td></tr>
            <tr><td class="text-grey">SĐT PH</td><td>{{ student.guardianPhone }}</td></tr>
          </tbody></v-table>
        </v-card>
        <v-card v-if="contract" class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Hợp đồng hiện tại</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">Mã HĐ</td><td><router-link :to="'/contract/contracts/'+contract.id" class="text-primary">{{ contract.contractCode }}</router-link></td></tr>
            <tr><td class="text-grey">Phòng</td><td>{{ contract.roomNumberSnapshot }}</td></tr>
            <tr><td class="text-grey">Thời hạn</td><td>{{ formatDate(contract.startDate) }} — {{ formatDate(contract.endDate) }}</td></tr>
                      </tbody></v-table>
        </v-card>
      </v-col>
    </v-row>
    <v-skeleton-loader v-else type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatDate, formatEnum } from '@/shared/utils/formatters'

const route = useRoute()
const student = ref<any>(null); const contract = ref<any>(null)

onMounted(async () => {
  try {
    const { data } = await http.get(`/api/students/${route.params.id}/summary`)
    student.value = data.student; contract.value = data.activeContract
  } catch(e) { console.error(e) }
})
</script>
