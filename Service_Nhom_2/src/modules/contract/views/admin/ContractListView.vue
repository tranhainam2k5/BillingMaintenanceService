<template>
  <div>
    <PageHeader title="Hợp đồng" />
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" placeholder="Tìm mã HĐ, SV..." density="compact" clearable @update:model-value="loadData" /></v-col>
              </v-row>
    </v-card>
    <v-card>
      <v-data-table-server :headers="headers" :items="items" :items-length="total" :loading="loading" :items-per-page="pageSize" :page="page" @update:page="page=$event;loadData()" @update:items-per-page="pageSize=$event;loadData()" :row-props="rowProps">
        <template #item.monthlyPrice="{ item }">{{ formatCurrency(item.monthlyPrice) }}</template>
                <template #item.endDate="{ item }">{{ formatDate(item.endDate) }}</template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="$router.push('/contract/contracts/'+item.id)"><v-icon>mdi-eye</v-icon></v-btn>
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'

import dayjs from 'dayjs'

const items = ref<any[]>([]); const total = ref(0); const page = ref(1); const pageSize = ref(20)
const loading = ref(false); const search = ref(''); const statusFilter = ref('')

const headers = [
  { title:'Mã HĐ', key:'contractCode', width:140 },{ title:'Sinh viên', key:'studentName' },
  { title:'Phòng', key:'roomNumberSnapshot', width:80 },{ title:'Giá/tháng', key:'monthlyPrice', width:130 },
  { title:'Đến hạn', key:'endDate', width:110 },
  { title:'', key:'actions', width:60, sortable:false },
]

function rowProps({ item }: any) {
  if (item.status === 'ACTIVE' && dayjs(item.endDate).diff(dayjs(), 'day') <= 30) return { class: 'bg-amber-lighten-5' }
  return {}
}

async function loadData() {
  loading.value=true
  try{const{data}=await http.get('/api/contracts',{params:{keyword:search.value,status:statusFilter.value,page:page.value,pageSize:pageSize.value}});items.value=data.items;total.value=data.totalItems}catch(e){console.error(e)}finally{loading.value=false}
}
onMounted(loadData)
</script>
