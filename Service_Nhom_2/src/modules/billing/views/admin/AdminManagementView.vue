<template>
  <div>
    <PageHeader title="Quản lý tài khoản nhân viên">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openForm()">
          Thêm tài khoản
        </v-btn>
      </template>
    </PageHeader>

    <!-- Stats Summary Cards -->
    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="12" sm="4">
        <v-card class="pa-4 text-center" variant="outlined" style="border-color: rgba(0,0,0,0.12);">
          <v-icon :color="s.color" size="32" class="mb-2">{{ s.icon }}</v-icon>
          <div class="text-h4 font-weight-bold mb-1">{{ s.value }}</div>
          <div class="text-body-2 text-grey-darken-1">{{ s.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-card class="pa-4 mb-4" variant="outlined" style="border-color: rgba(0,0,0,0.12);">
      <v-row dense>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Tìm theo tên đăng nhập hoặc họ tên..."
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @update:model-value="onSearch"
          />
        </v-col>
        <v-col cols="12" sm="3" md="2">
          <v-select
            v-model="roleFilter"
            :items="ROLE_FILTER_OPTIONS"
            label="Role"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="loadData"
          />
        </v-col>
              </v-row>
    </v-card>

    <!-- Admins Data Table -->
    <v-card variant="outlined" style="border-color: rgba(0,0,0,0.12);">
      <v-data-table-server
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="loading"
        :items-per-page="pageSize"
        :page="page"
        @update:page="onPageChange"
        @update:items-per-page="onPageSizeChange"
      >
        <template #item.role="{ item }">
          <v-chip
            :color="item.role === 'ADMIN' ? 'deep-purple' : 'amber'"
            size="small"
            variant="flat"
          >
            {{ item.role === 'ADMIN' ? 'Quản trị viên' : 'Quản lý' }}
          </v-chip>
        </template>
        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'ACTIVE' ? 'success' : 'error'"
            size="small"
            variant="flat"
          >
            {{ item.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bị khóa' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            color="primary"
            @click="openForm(item)"
            aria-label="Sửa"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            :disabled="item.id === 'admin-001'"
            @click="confirmDel(item)"
            aria-label="Xóa"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Create/Edit Form Dialog -->
    <AdminFormDialog
      v-model="showForm"
      :is-edit="editing"
      :initial-data="editItem"
      :loading="saving"
      @submit="handleFormSubmit"
    />

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      ref="delDialog"
      title="Xóa tài khoản"
      :message="`Bạn có chắc chận muốn xóa tài khoản <strong>${delItem?.name}</strong> (${delItem?.username})? Hành động này không thể hoàn tác.`"
      confirm-text="Xác nhận xóa"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import AdminFormDialog from '@/modules/billing/components/dialogs/AdminFormDialog.vue'
import { adminApi, type AdminUser } from '@/modules/billing/api/adminApi'
import { useNotify } from '@/shared/composables/useNotify'

const { success, error } = useNotify()

const items = ref<AdminUser[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

// Form state
const showForm = ref(false)
const saving = ref(false)
const editing = ref(false)
const editItem = ref<AdminUser | null>(null)

// Delete state
const delItem = ref<AdminUser | null>(null)
const delDialog = ref()

const headers = [
  { title: 'Tên đăng nhập', key: 'username', width: '22%' },
  { title: 'Họ và tên', key: 'name', width: '28%' },
  { title: 'Role', key: 'role', width: '20%' },
  
  { title: 'Hành động', key: 'actions', width: '12%', sortable: false, align: 'end' as const }
]

const ROLE_FILTER_OPTIONS = [
  { title: 'Tất cả', value: '' },
  { title: 'Quản trị viên', value: 'ADMIN' },
  { title: 'Quản lý', value: 'MANAGER' }
]

const STATUS_FILTER_OPTIONS = [
  { title: 'Tất cả', value: '' },
  { title: 'Đang hoạt động', value: 'ACTIVE' },
  { title: 'Bị khóa', value: 'INACTIVE' }
]

// Stats computing
const stats = computed(() => {
  const adminCount = items.value.filter(i => i.role === 'ADMIN').length
  const managerCount = items.value.filter(i => i.role === 'MANAGER').length
  const activeCount = items.value.filter(i => i.status === 'ACTIVE').length
  return [
    { icon: 'mdi-shield-crown-outline', label: 'Quản trị viên', value: adminCount, color: 'deep-purple' },
    { icon: 'mdi-account-tie', label: 'Quản lý', value: managerCount, color: 'amber-darken-2' },
    { icon: 'mdi-shield-check-outline', label: 'Đang hoạt động', value: activeCount, color: 'success' }
  ]
})

// Search debounce placeholder
let searchTimeout: any = null
function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadData()
  }, 400)
}

function onPageChange(newPage: number) {
  page.value = newPage
  loadData()
}

function onPageSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await adminApi.getAdmins({
      keyword: search.value || undefined,
      role: roleFilter.value || undefined,
      status: statusFilter.value || undefined,
      page: page.value,
      pageSize: pageSize.value
    })
    items.value = data.items
    total.value = data.totalItems
  } catch (e: any) {
    error(e.response?.data?.title || 'Không thể tải danh sách')
  } finally {
    loading.value = false
  }
}

function openForm(item?: AdminUser) {
  if (item) {
    editing.value = true
    editItem.value = { ...item }
  } else {
    editing.value = false
    editItem.value = null
  }
  showForm.value = true
}

async function handleFormSubmit(formData: any) {
  saving.value = true
  try {
    if (editing.value && editItem.value) {
      await adminApi.updateAdmin(editItem.value.id, {
        username: formData.username,
        name: formData.name,
        status: formData.status
      })
      success('Cập nhật tài khoản thành công')
    } else {
      await adminApi.createAdmin({
        username: formData.username,
        name: formData.name,
        role: formData.role || 'MANAGER',
        status: formData.status
      })
      success('Tạo tài khoản thành công')
    }
    showForm.value = false
    loadData()
  } catch (e: any) {
    error(e.response?.data?.title || 'Thao tác thất bại')
  } finally {
    saving.value = false
  }
}

function confirmDel(item: AdminUser) {
  delItem.value = item
  delDialog.value.open()
}

async function doDelete() {
  if (!delItem.value) return
  try {
    await adminApi.deleteAdmin(delItem.value.id)
    success('Xóa tài khoản thành công')
    loadData()
  } catch (e: any) {
    error(e.response?.data?.title || 'Không thể xóa tài khoản')
  }
}

onMounted(() => {
  loadData()
})
</script>
