<template>
  <div>
    <PageHeader title="Quản lý Tòa nhà">
      <template #actions><v-btn color="primary" prepend-icon="mdi-plus" @click="openForm()">Thêm tòa nhà</v-btn></template>
    </PageHeader>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card class="pa-3 text-center"><v-icon :color="s.color" class="mb-1">{{ s.icon }}</v-icon><div class="text-h5 font-weight-bold">{{ s.value }}</div><div class="text-caption">{{ s.label }}</div></v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table-server :headers="headers" :items="items" :items-length="items.length" :loading="loading" items-per-page="-1">
        <template #item.genderType="{ item }"><v-chip :color="item.genderType==='MALE'?'indigo':item.genderType==='FEMALE'?'pink':'teal'" size="small" variant="tonal">{{ formatEnum(item.genderType) }}</v-chip></template>
                <template #item.createdAt="{ item }">{{ formatDate(item.createdAt) }}</template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="$router.push('/room/buildings/'+item.id)" aria-label="Xem"><v-icon>mdi-eye</v-icon></v-btn>
          <v-btn icon size="small" variant="text" @click="openForm(item)" aria-label="Sửa"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="confirmDel(item)" aria-label="Xóa"><v-icon>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Form Dialog -->
    <v-dialog v-model="showForm" max-width="480" persistent>
      <v-card>
        <v-card-title class="pt-5 px-6"><v-icon color="primary" class="mr-2">mdi-office-building</v-icon>{{ editing ? 'Sửa' : 'Thêm' }} tòa nhà</v-card-title>
        <v-card-text class="px-6">
          <v-text-field v-model="form.name" label="Tên tòa nhà *" :rules="[v=>!!v||'Bắt buộc', v=>v.length<=50||'Tối đa 50 ký tự']" class="mb-2" />
          <v-text-field v-model.number="form.totalFloors" label="Số tầng *" type="number" :rules="[v=>v>=1&&v<=100||'1-100']" class="mb-2" />
          <v-select v-model="form.genderType" :items="GENDER_OPTIONS" label="Loại KTX *" class="mb-2" />
          <v-textarea v-model="form.description" label="Mô tả" rows="2" />
          <v-select v-if="editing" v-model="form.status" :items="BUILDING_STATUS_OPTIONS" label="Trạng thái" />
        </v-card-text>
        <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showForm=false">Hủy</v-btn><v-btn color="primary" variant="flat" :loading="saving" @click="save">{{ editing ? 'Lưu' : 'Tạo' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="delDialog" title="Xóa tòa nhà" :message="`Xóa <strong>${delItem?.name}</strong>? Hành động này không thể hoàn tác.`" confirm-text="Xác nhận xóa" @confirm="doDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import { http } from '@/shared/http'
import { formatDate, formatEnum } from '@/shared/utils/formatters'
import { GENDER_OPTIONS } from '@/shared/utils/constants'
import { useNotify } from '@/shared/composables/useNotify'

const { success } = useNotify()
const items = ref<any[]>([])
const loading = ref(false)
const showForm = ref(false)
const saving = ref(false)
const editing = ref(false)
const editId = ref('')
const delItem = ref<any>(null)
const delDialog = ref()
const form = ref({ name: '', totalFloors: 1, genderType: 'MALE', description: '', status: 'ACTIVE' })

const BUILDING_STATUS_OPTIONS = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
  { title: 'Không hoạt động', value: 'INACTIVE' },
]

const headers = [
  { title: 'Tên', key: 'name' }, { title: 'Số tầng', key: 'totalFloors', width: 90 },
  { title: 'Loại KTX', key: 'genderType', width: 110 }, 
  { title: 'Ngày tạo', key: 'createdAt', width: 110 }, { title: '', key: 'actions', width: 130, sortable: false },
]

const stats = computed(() => [
  { icon: 'mdi-office-building', label: 'Tổng', value: items.value.length, color: 'primary' },
  { icon: 'mdi-check-circle', label: 'Hoạt động', value: items.value.filter(i=>i.status==='ACTIVE').length, color: 'success' },
  { icon: 'mdi-wrench', label: 'Bảo trì', value: items.value.filter(i=>i.status==='UNDER_MAINTENANCE').length, color: 'warning' },
  { icon: 'mdi-minus-circle', label: 'Không HĐ', value: items.value.filter(i=>i.status==='INACTIVE').length, color: 'grey' },
])

function openForm(item?: any) {
  if (item) { editing.value = true; editId.value = item.id; form.value = { ...item } }
  else { editing.value = false; form.value = { name: '', totalFloors: 1, genderType: 'MALE', description: '', status: 'ACTIVE' } }
  showForm.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) await http.put(`/api/buildings/${editId.value}`, form.value)
    else await http.post('/api/buildings', form.value)
    success(editing.value ? 'Đã cập nhật' : 'Đã tạo tòa nhà')
    showForm.value = false; loadData()
  } catch(e) { console.error(e) } finally { saving.value = false }
}

function confirmDel(item: any) { delItem.value = item; delDialog.value.open() }
async function doDelete() { try { await http.delete(`/api/buildings/${delItem.value.id}`); success('Đã xóa'); loadData() } catch(e) { console.error(e) } }

async function loadData() {
  loading.value = true
  try { const { data } = await http.get('/api/buildings'); items.value = data } catch(e) { console.error(e) } finally { loading.value = false }
}
onMounted(loadData)
</script>
