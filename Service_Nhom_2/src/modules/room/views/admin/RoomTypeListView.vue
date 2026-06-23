<template>
  <div>
    <PageHeader title="Loại phòng">
      <template #actions><v-btn color="primary" prepend-icon="mdi-plus" @click="openForm()">Thêm loại phòng</v-btn></template>
    </PageHeader>
    <v-card>
      <v-data-table-server :headers="headers" :items="items" :items-length="items.length" :loading="loading" items-per-page="-1">
        <template #item.basePrice="{ item }">{{ formatCurrency(item.basePrice) }}</template>
        <template #item.amenities="{ item }">
          <v-chip v-for="(a,i) in item.amenities?.slice(0,3)" :key="i" size="x-small" class="mr-1" variant="tonal">{{ a }}</v-chip>
          <v-chip v-if="item.amenities?.length>3" size="x-small" variant="tonal">+{{ item.amenities.length-3 }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="openForm(item)"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="delItem=item;delDialog.open()"><v-icon>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="showForm" max-width="640" persistent>
      <v-card>
        <v-card-title class="pt-5 px-6"><v-icon color="primary" class="mr-2">mdi-bed</v-icon>{{ editing?'Sửa':'Thêm' }} loại phòng</v-card-title>
        <v-card-text class="px-6">
          <v-text-field v-model="form.typeName" label="Tên loại phòng *" class="mb-2" />
          <v-row dense><v-col cols="6"><v-text-field v-model.number="form.capacity" label="Sức chứa *" type="number" /></v-col><v-col cols="6"><v-text-field v-model.number="form.basePrice" label="Giá cơ bản *" type="number" suffix="₫" /></v-col></v-row>
          <v-textarea v-model="form.description" label="Mô tả" rows="2" class="mt-2 mb-2" />
          <v-combobox v-model="form.amenities" label="Tiện nghi" multiple chips closable-chips />
        </v-card-text>
        <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showForm=false">Hủy</v-btn><v-btn color="primary" variant="flat" :loading="saving" @click="save">{{ editing?'Lưu':'Tạo' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <ConfirmDialog ref="delDialog" title="Xóa loại phòng" :message="`Xóa <strong>${delItem?.typeName}</strong>?`" confirm-text="Xóa" @confirm="doDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import { http } from '@/shared/http'
import { formatCurrency } from '@/shared/utils/formatters'
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
const form = ref({ typeName: '', capacity: 4, basePrice: 1200000, description: '', amenities: [] as string[] })

const headers = [
  { title: 'Tên', key: 'typeName' }, { title: 'Sức chứa', key: 'capacity', width: 90 },
  { title: 'Giá cơ bản', key: 'basePrice', width: 140 }, { title: 'Tiện nghi', key: 'amenities' },
  { title: '', key: 'actions', width: 100, sortable: false },
]

function openForm(item?: any) {
  if (item) { editing.value=true; editId.value=item.id; form.value={...item, amenities:[...(item.amenities||[])]} }
  else { editing.value=false; form.value={typeName:'',capacity:4,basePrice:1200000,description:'',amenities:[]} }
  showForm.value=true
}
async function save() {
  saving.value=true
  try { if(editing.value) await http.put(`/api/roomtypes/${editId.value}`,form.value); else await http.post('/api/roomtypes',form.value); success('Đã lưu'); showForm.value=false; loadData() } catch(e){console.error(e)} finally{saving.value=false}
}
async function doDelete() { try{await http.delete(`/api/roomtypes/${delItem.value.id}`); success('Đã xóa'); loadData()}catch(e){console.error(e)} }
async function loadData() { loading.value=true; try{const{data}=await http.get('/api/roomtypes'); items.value=data}catch(e){console.error(e)}finally{loading.value=false} }
onMounted(loadData)
</script>
