<template>
  <div>
    <PageHeader title="Đơn đăng ký phòng" />
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" placeholder="Tìm SV..." density="compact" clearable @update:model-value="loadData" /></v-col>
              </v-row>
    </v-card>
    <v-card>
      <v-data-table-server :headers="headers" :items="items" :items-length="total" :loading="loading" :items-per-page="pageSize" :page="page" @update:page="page=$event;loadData()" @update:items-per-page="pageSize=$event;loadData()">
                <template #item.submittedAt="{ item }">{{ item.submittedAt ? formatDate(item.submittedAt) : '—' }}</template>
        <template #item.actions="{ item }">
          <v-btn v-if="item.status==='SUBMITTED'" icon size="small" variant="text" color="success" @click="$router.push('/contract/applications/'+item.id+'/approve')"><v-icon>mdi-check</v-icon></v-btn>
          <v-btn v-if="item.status==='SUBMITTED'" icon size="small" variant="text" color="error" @click="rejectItem=item;showReject=true"><v-icon>mdi-close</v-icon></v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="showReject" max-width="440">
      <v-card><v-card-title class="pt-5 px-6"><v-icon color="error" class="mr-2">mdi-close-circle</v-icon>Từ chối đơn</v-card-title>
      <v-card-text class="px-6"><div class="mb-3"><strong>{{ rejectItem?.studentName }}</strong></div><v-textarea v-model="rejectReason" label="Lý do từ chối *" rows="3" /></v-card-text>
      <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showReject=false">Hủy</v-btn><v-btn color="error" variant="flat" :loading="rejecting" @click="doReject">Từ chối</v-btn></v-card-actions></v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatDate } from '@/shared/utils/formatters'

import { useNotify } from '@/shared/composables/useNotify'

const { success } = useNotify()
const items = ref<any[]>([]); const total = ref(0); const page = ref(1); const pageSize = ref(20)
const loading = ref(false); const search = ref(''); const statusFilter = ref('SUBMITTED')
const showReject = ref(false); const rejectItem = ref<any>(null); const rejectReason = ref(''); const rejecting = ref(false)

const headers = [
  { title:'Sinh viên', key:'studentName' },{ title:'Mã SV', key:'studentCode', width:90 },
  { title:'Ngày gửi', key:'submittedAt', width:110 },
  { title:'', key:'actions', width:100, sortable:false },
]

async function doReject() {
  rejecting.value=true
  try{await http.patch(`/api/room-applications/${rejectItem.value.id}/reject`,{rejectReason:rejectReason.value});success('Đã từ chối');showReject.value=false;loadData()}catch(e){console.error(e)}finally{rejecting.value=false}
}

async function loadData() {
  loading.value=true
  try{const{data}=await http.get('/api/room-applications',{params:{keyword:search.value,status:statusFilter.value,page:page.value,pageSize:pageSize.value}});items.value=data.items;total.value=data.totalItems}catch(e){console.error(e)}finally{loading.value=false}
}
onMounted(loadData)
</script>
