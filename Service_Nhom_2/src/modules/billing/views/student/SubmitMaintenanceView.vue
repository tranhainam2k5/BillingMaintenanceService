<template>
  <div>
    <PageHeader title="Báo cáo sự cố" />
    <v-card class="pa-6" max-width="640">
      <v-form @submit.prevent="submit" ref="formRef">
        <v-select v-model="form.type" :items="MAINTENANCE_TYPE_OPTIONS" label="Loại sự cố *" :rules="[v => !!v || 'Bắt buộc']" class="mb-3" />
        <v-textarea v-model="form.description" label="Mô tả chi tiết *" :rules="[v => !!v && v.length >= 20 || 'Tối thiểu 20 ký tự']" rows="4" class="mb-3" counter />
        <v-text-field :model-value="'A101'" label="Phòng" disabled class="mb-3" />
        <v-radio-group v-model="form.priority" label="Ưu tiên" inline class="mb-3">
          <v-radio label="Bình thường" value="NORMAL" /><v-radio label="Khẩn cấp" value="URGENT" />
        </v-radio-group>
        <v-file-input v-model="files" label="Hình ảnh" accept="image/*" multiple prepend-icon="mdi-camera" show-size class="mb-4" />
        <v-btn type="submit" color="primary" size="large" :loading="loading" prepend-icon="mdi-send">Gửi báo cáo</v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { MAINTENANCE_TYPE_OPTIONS } from '@/shared/utils/constants'
import { useAuthStore } from '@/shared/stores/authStore'
import { useNotify } from '@/shared/composables/useNotify'

const router = useRouter()
const auth = useAuthStore()
const { success } = useNotify()
const loading = ref(false)
const files = ref([])
const formRef = ref()
const form = ref({ type: '', description: '', priority: 'NORMAL' })

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true
  try {
    await http.post('/api/maintenance', {
      type: form.value.type,
      description: form.value.description,
      priority: form.value.priority,
      roomNumber: 'A101',
      repairCost: 0
    })
    success('Đã gửi báo cáo sự cố')
    router.push('/billing/my-maintenance')
  } catch(e) { console.error(e) } finally { loading.value = false }
}
</script>
