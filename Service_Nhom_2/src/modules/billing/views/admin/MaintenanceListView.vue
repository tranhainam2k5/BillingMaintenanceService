<template>
  <div>
    <PageHeader title="Yêu cầu sửa chữa" />

    <!-- View Toggle -->
    <v-card class="pa-4 mb-4">
      <v-row dense align="center">
        <v-col cols="auto"><v-btn-toggle v-model="viewMode" mandatory color="primary" density="compact"><v-btn value="kanban" icon="mdi-view-column" /><v-btn value="table" icon="mdi-table" /></v-btn-toggle></v-col>
                <v-col cols="12" sm="3"><v-select v-model="typeFilter" :items="[{title:'Tất cả',value:''}, ...MAINTENANCE_TYPE_OPTIONS]" label="Loại sự cố" density="compact" @update:model-value="loadData" /></v-col>
      </v-row>
    </v-card>

    <!-- Kanban View -->
    <v-row v-if="viewMode==='kanban'">
      <v-col v-for="col in kanbanCols" :key="col.status" cols="12" sm="6" md="3">
        <v-card class="pa-3" style="min-height:300px;">
          <div class="d-flex align-center mb-3">
            <h4 class="text-subtitle-2 font-weight-bold">{{ col.title }}</h4>
            <v-chip size="x-small" class="ml-2">{{ col.items.length }}</v-chip>
          </div>
          <v-card v-for="item in col.items" :key="item.id" class="pa-3 mb-2" variant="outlined" @click="router.push('/billing/maintenance/'+item.id)" style="cursor:pointer;">
            <div class="d-flex align-center mb-1"><v-icon size="16" class="mr-1">mdi-wrench</v-icon><span class="text-body-2 font-weight-medium">{{ item.roomNumber }}</span></div>
            <div class="text-caption text-grey-darken-1 mb-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">{{ item.description }}</div>
            <div class="text-caption text-grey">{{ formatRelativeTime(item.createdAt) }}</div>
            <div v-if="item.assignee" class="text-caption text-info mt-1"><v-icon size="12">mdi-account</v-icon> {{ item.assignee }}</div>
          </v-card>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table View -->
    <v-card v-else>
      <v-data-table-server :headers="headers" :items="items" :items-length="total" :loading="loading" :items-per-page="pageSize" :page="page" @update:page="page=$event;loadData()" @update:items-per-page="pageSize=$event;loadData()">
        <template #item.type="{ item }">{{ formatEnum(item.type) }}</template>
                <template #item.createdAt="{ item }">{{ formatRelativeTime(item.createdAt) }}</template>
        <template #item.actions="{ item }"><v-btn icon size="small" variant="text" @click="router.push('/billing/maintenance/'+item.id)"><v-icon>mdi-eye</v-icon></v-btn></template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { formatRelativeTime, formatEnum } from '@/shared/utils/formatters'
import { MAINTENANCE_TYPE_OPTIONS } from '@/shared/utils/constants'

const router = useRouter()
const items = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const viewMode = ref('kanban')
const statusFilter = ref('')
const typeFilter = ref('')

const headers = [
  { title: 'Phòng', key: 'roomNumber', width: 80 },
  { title: 'Sinh viên', key: 'studentName' },
  { title: 'Loại', key: 'type', width: 100 },
  { title: 'Mô tả', key: 'description' },
  
  { title: 'Thời gian', key: 'createdAt', width: 120 },
  { title: '', key: 'actions', width: 60, sortable: false },
]

const kanbanCols = computed(() => {
  const cols = [
    { status: 'NEW', title: 'Mới', items: [] as any[] },
    { status: 'IN_PROGRESS', title: 'Đang xử lý', items: [] as any[] },
    { status: 'COMPLETED', title: 'Hoàn thành', items: [] as any[] },
    { status: 'CANCELLED', title: 'Đã hủy', items: [] as any[] },
  ]
  for (const item of items.value) {
    const col = cols.find(c => c.status === item.status)
    if (col) col.items.push(item)
  }
  return cols
})

async function loadData() {
  loading.value = true
  try {
    const { data } = await http.get('/api/maintenance', { params: { status: statusFilter.value, type: typeFilter.value, page: page.value, pageSize: 100 } })
    items.value = data.items; total.value = data.totalItems
  } catch(e) { console.error(e) } finally { loading.value = false }
}

onMounted(loadData)
</script>
