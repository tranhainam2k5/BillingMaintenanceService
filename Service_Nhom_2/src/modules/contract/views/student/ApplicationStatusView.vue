<template>
  <div>
    <PageHeader title="Theo dõi đơn đăng ký" />
    <div v-if="loading" class="d-flex justify-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="!app"><EmptyState icon="mdi-clipboard-text" title="Chưa có đơn" description="Bạn chưa gửi đơn đăng ký phòng." action-text="Đăng ký ngay" @action="$router.push('/contract/my-application')" /></div>
    <v-card v-else class="pa-6" max-width="600">
      <div class="d-flex align-center mb-6"><span class="ml-3 text-body-2 text-grey">Cập nhật: {{ formatRelativeTime(app.updatedAt || app.createdAt) }}</span></div>

      <v-timeline density="compact" side="end" class="mb-6">
        <v-timeline-item dot-color="success" size="small"><div class="text-body-2 font-weight-medium">Tạo đơn</div><div class="text-caption text-grey">{{ formatDate(app.createdAt) }}</div></v-timeline-item>
        <v-timeline-item :dot-color="app.submittedAt ? 'success' : 'grey'" size="small"><div class="text-body-2 font-weight-medium">Đã gửi</div><div class="text-caption text-grey">{{ app.submittedAt ? formatDate(app.submittedAt) : 'Chờ gửi' }}</div></v-timeline-item>
        <v-timeline-item :dot-color="app.status==='APPROVED'?'success':app.status==='REJECTED'?'error':'grey'" size="small"><div class="text-body-2 font-weight-medium">{{ app.status==='APPROVED'?'Đã duyệt':app.status==='REJECTED'?'Từ chối':'Chờ duyệt' }}</div><div v-if="app.approvedAt" class="text-caption text-grey">{{ formatDate(app.approvedAt) }}</div><div v-if="app.rejectReason" class="text-caption text-error">{{ app.rejectReason }}</div></v-timeline-item>
      </v-timeline>

      <v-btn v-if="app.status==='DRAFT'" color="primary" variant="flat" block @click="submitDraft" :loading="submitting" prepend-icon="mdi-send">Gửi đơn</v-btn>
      <v-btn v-if="app.status==='SUBMITTED'" color="error" variant="outlined" block @click="cancelApp" :loading="cancelling">Hủy đơn</v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { http } from '@/shared/http'
import { formatDate, formatRelativeTime } from '@/shared/utils/formatters'
import { useAuthStore } from '@/shared/stores/authStore'
import { useNotify } from '@/shared/composables/useNotify'

const auth = useAuthStore(); const { success } = useNotify()
const app = ref<any>(null); const loading = ref(false); const submitting = ref(false); const cancelling = ref(false)

async function submitDraft() { submitting.value=true; try { await http.patch(`/api/room-applications/${app.value.id}/submit`); success('Đã gửi đơn'); loadData() } catch(e){console.error(e)} finally{submitting.value=false} }
async function cancelApp() { cancelling.value=true; try { await http.patch(`/api/room-applications/${app.value.id}/cancel`); success('Đã hủy đơn'); loadData() } catch(e){console.error(e)} finally{cancelling.value=false} }

async function loadData() {
  loading.value=true
  try { const { data } = await http.get(`/api/room-applications/student/${auth.user?.studentId}/latest`); app.value = data } catch { app.value = null } finally { loading.value=false }
}
onMounted(loadData)
</script>
