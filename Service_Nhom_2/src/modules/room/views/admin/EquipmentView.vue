<template>
  <div>
    <PageHeader title="Thiết bị" />
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" placeholder="Tìm theo phòng..." density="compact" @update:model-value="loadData" /></v-col>
      </v-row>
    </v-card>
    <v-card>
      <v-data-table-server :headers="headers" :items="items" :items-length="items.length" :loading="loading" items-per-page="-1">
                <template #item.actions="{ item }"><v-btn icon size="small" variant="text" @click="eqItem=item;showStatus=true"><v-icon>mdi-swap-horizontal</v-icon></v-btn></template>
      </v-data-table-server>
    </v-card>
    <v-dialog v-model="showStatus" max-width="360">
      <v-card><v-card-title class="pt-5 px-6">Đổi trạng thái</v-card-title><v-card-text class="px-6"><v-select v-model="newStatus" :items="EQUIPMENT_STATUS_OPTIONS" label="Trạng thái" /></v-card-text><v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showStatus=false">Hủy</v-btn><v-btn color="primary" variant="flat" @click="changeStatus">Cập nhật</v-btn></v-card-actions></v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'

import { useNotify } from '@/shared/composables/useNotify'
const { success } = useNotify()
const items = ref<any[]>([]); const loading = ref(false); const search = ref(''); const showStatus = ref(false); const eqItem = ref<any>(null); const newStatus = ref('')
const EQUIPMENT_STATUS_OPTIONS = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
  { title: 'Hỏng', value: 'BROKEN' },
  { title: 'Đã thanh lý', value: 'RETIRED' },
]
const headers = [{ title: 'Phòng', key: 'roomId', width: 100 },{ title: 'Thiết bị', key: 'equipmentName' },{ title: '', key: 'actions', width: 60, sortable: false }]
async function changeStatus() { try { await http.patch(`/api/equipments/${eqItem.value.id}/status`, { status: newStatus.value }); success('Đã cập nhật'); showStatus.value = false; loadData() } catch(e) { console.error(e) } }
async function loadData() { loading.value=true; try { const{data}=await http.get('/api/equipments'); items.value=data } catch(e){console.error(e)} finally{loading.value=false} }
onMounted(loadData)
</script>
