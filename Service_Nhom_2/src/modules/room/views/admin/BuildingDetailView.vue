<template>
  <div>
    <PageHeader :title="building?.name || 'Chi tiết tòa nhà'" back />
    <v-card v-if="building" class="pa-4 mb-4">
      <v-row>
        <v-col cols="6" sm="3"><div class="text-caption text-grey">Tên</div><div class="font-weight-medium">{{ building.name }}</div></v-col>
        <v-col cols="6" sm="3"><div class="text-caption text-grey">Số tầng</div><div>{{ building.totalFloors }}</div></v-col>
        <v-col cols="6" sm="3"><div class="text-caption text-grey">Loại KTX</div><div><v-chip size="small" variant="tonal" :color="building.genderType==='MALE'?'indigo':building.genderType==='FEMALE'?'pink':'teal'">{{ formatEnum(building.genderType) }}</v-chip></div></v-col>
        <v-col cols="6" sm="3"></v-col>
      </v-row>
    </v-card>
    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="rooms">Danh sách phòng</v-tab>
      <v-tab value="stats">Thống kê</v-tab>
    </v-tabs>
    <v-card v-if="tab==='rooms'" class="pa-4">
      <v-data-table-server :headers="roomHeaders" :items="rooms" :items-length="rooms.length" :loading="loadingRooms" items-per-page="-1">
                <template #item.occupancy="{ item }">{{ item.currentOccupancy }}/{{ item.roomType?.capacity }}</template>
        <template #item.actions="{ item }"><v-btn icon size="small" variant="text" @click="$router.push('/room/rooms/'+item.id)"><v-icon>mdi-eye</v-icon></v-btn></template>
      </v-data-table-server>
    </v-card>
    <v-card v-if="tab==='stats'" class="pa-6">
      <v-row>
        <v-col v-for="s in roomStats" :key="s.label" cols="6" md="3" class="text-center">
          <div class="text-h4 font-weight-bold" :class="'text-'+s.color">{{ s.value }}</div>
          <div class="text-caption">{{ s.label }}</div>
        </v-col>
      </v-row>
    </v-card>
    <v-skeleton-loader v-if="!building" type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatEnum } from '@/shared/utils/formatters'

const route = useRoute()
const building = ref<any>(null)
const rooms = ref<any[]>([])
const tab = ref('rooms')
const loadingRooms = ref(false)

const roomHeaders = [
  { title: 'Phòng', key: 'roomNumber' }, { title: 'Tầng', key: 'floorNumber', width: 70 },
  { title: 'Loại', key: 'roomType.typeName' }, { title: 'Sức chứa', key: 'occupancy', width: 90 },
   { title: '', key: 'actions', width: 60, sortable: false },
]

const roomStats = computed(() => [
  { label: 'Tổng phòng', value: rooms.value.length, color: 'primary' },
  { label: 'Còn chỗ', value: rooms.value.filter(r=>r.status==='AVAILABLE').length, color: 'success' },
  { label: 'Đầy', value: rooms.value.filter(r=>r.status==='FULL').length, color: 'warning' },
  { label: 'Bảo trì', value: rooms.value.filter(r=>r.status==='UNDER_MAINTENANCE').length, color: 'error' },
])

onMounted(async () => {
  try {
    const [bRes, rRes] = await Promise.all([http.get(`/api/buildings/${route.params.id}`), http.get('/api/rooms', { params: { buildingId: route.params.id } })])
    building.value = bRes.data; rooms.value = rRes.data
  } catch(e) { console.error(e) }
})
</script>
