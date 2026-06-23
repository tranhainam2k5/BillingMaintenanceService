<template>
  <div>
    <PageHeader title="Sơ đồ tầng" />
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="4"><v-select v-model="buildingId" :items="buildingOptions" label="Tòa nhà" density="compact" @update:model-value="loadRooms" /></v-col>
        <v-col cols="12" sm="3"><v-select v-model="floor" :items="floorOptions" label="Tầng" density="compact" @update:model-value="loadRooms" /></v-col>
      </v-row>
    </v-card>

    <!-- Legend -->
    <div class="d-flex ga-4 mb-4 flex-wrap">
      <v-chip v-for="l in legend" :key="l.label" :color="l.color" size="small" variant="tonal">{{ l.label }}</v-chip>
    </div>

    <!-- Floor Grid -->
    <div class="d-flex flex-wrap ga-3">
      <v-card v-for="room in rooms" :key="room.id" width="160" class="pa-3 text-center room-card" :style="{ backgroundColor: roomColor(room.status) + '20', borderColor: roomColor(room.status) }" variant="outlined" @click="$router.push('/room/rooms/'+room.id)" style="cursor:pointer;">
        <div class="text-subtitle-2 font-weight-bold">{{ room.roomNumber }}</div>
        <div class="text-caption text-grey">{{ room.roomType?.typeName }}</div>
        <v-progress-linear :model-value="(room.currentOccupancy/(room.roomType?.capacity||1))*100" :color="roomColor(room.status)" height="6" rounded class="mt-2 mb-1" />
        <div class="text-caption">{{ room.currentOccupancy }}/{{ room.roomType?.capacity }}</div>
      </v-card>
    </div>
    <EmptyState v-if="!rooms.length && buildingId" icon="mdi-floor-plan" title="Chưa chọn tầng" description="Vui lòng chọn tòa nhà và tầng" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { http } from '@/shared/http'
import { colors } from '@/shared/design-tokens'

const buildingId = ref('')
const floor = ref('')
const buildingOptions = ref<any[]>([])
const floorOptions = ref<any[]>([])
const rooms = ref<any[]>([])

const legend = [
  { label: 'Còn chỗ', color: 'success' }, { label: 'Đầy', color: 'error' },
  { label: 'Bảo trì', color: 'warning' }, { label: 'Không HĐ', color: 'grey' },
]

function roomColor(status: string) {
  const map: Record<string,string> = { AVAILABLE: colors.success, FULL: colors.error, UNDER_MAINTENANCE: colors.warning, INACTIVE: '#9E9E9E' }
  return map[status] || '#9E9E9E'
}

async function loadRooms() {
  if (!buildingId.value) return
  try {
    const { data } = await http.get('/api/rooms/floormap', { params: { buildingId: buildingId.value, floor: floor.value } })
    rooms.value = data
    const floors = [...new Set(data.map((r:any)=>r.floorNumber))].sort().map((f:any)=>({title:`Tầng ${f}`,value:String(f)}))
    if (floors.length && !floor.value) { floorOptions.value = floors }
  } catch(e) { console.error(e) }
}

onMounted(async () => {
  try {
    const { data } = await http.get('/api/buildings')
    buildingOptions.value = data.map((b:any)=>({title:b.name,value:b.id}))
    if (data.length) { buildingId.value = data[0].id; loadRooms() }
  } catch(e) { console.error(e) }
})
</script>

<style scoped>
.room-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.room-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
</style>
