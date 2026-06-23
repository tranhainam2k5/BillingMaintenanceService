<template>
  <div>
    <PageHeader title="Yêu cầu sửa chữa">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/billing/submit-maintenance">Báo cáo sự cố</v-btn>
      </template>
    </PageHeader>
    <div v-if="loading" class="d-flex justify-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="!items.length"><EmptyState icon="mdi-wrench" title="Chưa có yêu cầu" description="Bạn chưa gửi yêu cầu sửa chữa nào." action-text="Báo cáo sự cố" @action="$router.push('/billing/submit-maintenance')" /></div>
    <v-card v-for="item in items" :key="item.id" class="pa-4 mb-3" v-else>
      <div class="d-flex align-center mb-2">
        <v-icon class="mr-2" color="primary">mdi-wrench</v-icon>
        <span class="font-weight-medium">{{ formatEnum(item.type) }} — {{ item.roomNumber }}</span>
        <v-spacer />
        
      </div>
      <p class="text-body-2 text-grey mb-2">{{ item.description }}</p>
      <div class="text-caption text-grey">{{ formatRelativeTime(item.createdAt) }}</div>
      <div v-if="item.assignee" class="text-caption text-info mt-1"><v-icon size="12">mdi-account</v-icon> {{ item.assignee }}</div>
      <v-btn v-if="item.status==='NEW'" variant="text" color="error" size="small" class="mt-2" @click="cancelItem(item)">Hủy yêu cầu</v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { http } from '@/shared/http'
import { formatRelativeTime, formatEnum } from '@/shared/utils/formatters'
import { useAuthStore } from '@/shared/stores/authStore'
import { useNotify } from '@/shared/composables/useNotify'

const auth = useAuthStore()
const { success } = useNotify()
const items = ref<any[]>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const { data } = await http.get('/api/maintenance', { params: { studentId: auth.user?.studentId } })
    items.value = data.items
  } catch(e) { console.error(e) } finally { loading.value = false }
}

async function cancelItem(item: any) {
  try { await http.put(`/api/maintenance/${item.id}/status`, { status: 'Cancelled' }); success('Đã hủy yêu cầu'); loadData() } catch(e) { console.error(e) }
}

onMounted(loadData)
</script>
