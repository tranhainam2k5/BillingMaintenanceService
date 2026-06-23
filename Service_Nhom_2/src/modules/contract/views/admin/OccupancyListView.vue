<template>
  <div>
    <PageHeader title="Quản lý lưu trú" />
    <v-card>
      <v-data-table-server :headers="headers" :items="items" :items-length="total" :loading="loading" :items-per-page="pageSize" :page="page" @update:page="page=$event;loadData()" @update:items-per-page="pageSize=$event;loadData()">
                <template #item.checkInDate="{ item }">{{ formatDate(item.checkInDate) }}</template>
        <template #item.checkOutDate="{ item }">{{ item.checkOutDate ? formatDate(item.checkOutDate) : '—' }}</template>
        <template #item.actions="{ item }">
          <v-btn v-if="item.status==='ACTIVE'" size="small" variant="text" color="warning" @click="doCheckout(item)">Trả phòng</v-btn>
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatDate } from '@/shared/utils/formatters'
import { useNotify } from '@/shared/composables/useNotify'

const { success } = useNotify()
const items = ref<any[]>([]); const total = ref(0); const page = ref(1); const pageSize = ref(20); const loading = ref(false)
const headers = [
  { title:'Sinh viên', key:'studentName' },{ title:'Mã SV', key:'studentCode', width:90 },
  { title:'Phòng', key:'roomNumberSnapshot', width:80 },{ title:'Giường', key:'bedNumberSnapshot', width:100 },
  { title:'Check-in', key:'checkInDate', width:110 },{ title:'Check-out', key:'checkOutDate', width:110 },
  { title:'', key:'actions', width:100, sortable:false },
]
async function doCheckout(item: any) { try { await http.patch(`/api/occupancies/${item.id}/checkout`); success('Đã trả phòng'); loadData() } catch(e) { console.error(e) } }
async function loadData() { loading.value=true; try{const{data}=await http.get('/api/occupancies',{params:{page:page.value,pageSize:pageSize.value}});items.value=data.items;total.value=data.totalItems}catch(e){console.error(e)}finally{loading.value=false} }
onMounted(loadData)
</script>
