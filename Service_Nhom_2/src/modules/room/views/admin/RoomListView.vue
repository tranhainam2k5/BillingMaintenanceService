<template>
  <div>
    <PageHeader title="Quản lý phòng">
      <template #actions><v-btn color="primary" prepend-icon="mdi-plus" @click="openForm()">Thêm phòng</v-btn></template>
    </PageHeader>
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="3"><v-select v-model="buildingFilter" :items="[{title:'Tất cả',value:''},...buildingOptions]" label="Tòa nhà" density="compact" @update:model-value="loadData" /></v-col>
        <v-col cols="12" sm="2"><v-select v-model="floorFilter" :items="[{title:'Tất cả',value:''},...floorOptions]" label="Tầng" density="compact" @update:model-value="loadData" /></v-col>
      </v-row>
    </v-card>
    <v-card>
      <v-data-table-server :headers="headers" :items="items" :items-length="items.length" :loading="loading" items-per-page="-1">
        <template #item.occupancy="{ item }"><v-progress-linear :model-value="(item.currentOccupancy/(item.roomType?.capacity||1))*100" :color="item.currentOccupancy>=item.roomType?.capacity?'error':'primary'" height="18" rounded class="text-caption"><template #default>{{ item.currentOccupancy }}/{{ item.roomType?.capacity }}</template></v-progress-linear></template>
        <template #item.roomType="{ item }">{{ item.roomType?.typeName }}</template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="$router.push('/room/rooms/'+item.id)"><v-icon>mdi-eye</v-icon></v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="showForm" max-width="540" persistent>
      <v-card>
        <v-card-title class="pt-5 px-6"><v-icon color="primary" class="mr-2">mdi-door</v-icon>Thêm phòng</v-card-title>
        <v-card-text class="px-6">
          <v-select v-model="form.buildingId" :items="buildingOptions" label="Tòa nhà *" class="mb-2" />
          <v-text-field v-model="form.roomNumber" label="Số phòng *" class="mb-2" />
          <v-text-field v-model.number="form.floorNumber" label="Tầng *" type="number" class="mb-2" />
          <v-select v-model="form.roomTypeId" :items="roomTypeOptions" label="Loại phòng *" class="mb-2" />
        </v-card-text>
        <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showForm=false">Hủy</v-btn><v-btn color="primary" variant="flat" :loading="saving" @click="save">Tạo</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { useNotify } from '@/shared/composables/useNotify'

const { success } = useNotify()
const items = ref<any[]>([])
const loading = ref(false)
const buildingOptions = ref<any[]>([])
const roomTypeOptions = ref<any[]>([])
const floorOptions = ref<any[]>([])
const buildingFilter = ref('')
const floorFilter = ref('')
const showForm = ref(false)
const saving = ref(false)
const form = ref({ buildingId: '', roomNumber: '', floorNumber: 1, roomTypeId: '' })

const headers = [
  { title: 'Phòng', key: 'roomNumber' }, { title: 'Tầng', key: 'floorNumber', width: 70 },
  { title: 'Loại', key: 'roomType', width: 140 }, { title: 'Sức chứa', key: 'occupancy', width: 130 },
  { title: '', key: 'actions', width: 100, sortable: false },
]

function openForm() { form.value = { buildingId: buildingFilter.value, roomNumber: '', floorNumber: 1, roomTypeId: '' }; showForm.value = true }

async function save() {
  saving.value = true
  try { await http.post('/api/rooms', form.value); success('Đã tạo phòng'); showForm.value = false; loadData() } catch(e) { console.error(e) } finally { saving.value = false }
}



async function loadData() {
  loading.value = true
  try {
    const { data } = await http.get('/api/rooms', { params: { buildingId: buildingFilter.value, floor: floorFilter.value } })
    items.value = data
    const floors = [...new Set(data.map((r: any) => r.floorNumber))].sort().map((f: any) => ({ title: `Tầng ${f}`, value: String(f) }))
    floorOptions.value = floors
  } catch(e) { console.error(e) } finally { loading.value = false }
}

onMounted(async () => {
  try {
    const [bRes, rtRes] = await Promise.all([http.get('/api/buildings'), http.get('/api/roomtypes')])
    buildingOptions.value = bRes.data.map((b: any) => ({ title: b.name, value: b.id }))
    roomTypeOptions.value = rtRes.data.map((rt: any) => ({ title: rt.typeName, value: rt.id }))
  } catch(e) { console.error(e) }
  loadData()
})
</script>
