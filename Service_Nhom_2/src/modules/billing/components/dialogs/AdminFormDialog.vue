<template>
  <v-dialog v-model="visible" max-width="480" persistent>
    <v-card>
      <v-card-title class="pt-5 px-6">
        <v-icon color="primary" class="mr-2">mdi-shield-account</v-icon>
        {{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }} tài khoản
      </v-card-title>
      <v-card-text class="px-6">
        <v-form ref="formRef" v-model="isValid">
          <v-text-field
            v-model="formData.username"
            label="Tên đăng nhập *"
            prepend-inner-icon="mdi-account"
            :rules="[
              v => !!v || 'Vui lòng nhập tên đăng nhập',
              v => (v && v.length >= 3) || 'Tên đăng nhập phải có ít nhất 3 ký tự',
              v => (v && v.length <= 20) || 'Tên đăng nhập tối đa 20 ký tự',
              v => /^[a-zA-Z0-9_]+$/.test(v) || 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới'
            ]"
            :disabled="isEdit"
            class="mb-2"
          />
          <v-text-field
            v-model="formData.name"
            label="Họ và tên *"
            prepend-inner-icon="mdi-account-card-details"
            :rules="[
              v => !!v || 'Vui lòng nhập họ và tên',
              v => (v && v.length <= 50) || 'Họ và tên tối đa 50 ký tự'
            ]"
            class="mb-2"
          />
          <v-select
            v-if="!isEdit"
            v-model="formData.role"
            :items="ROLE_OPTIONS"
            label="Role *"
            prepend-inner-icon="mdi-shield-half-full"
            class="mb-2"
          />
          <v-select
            v-if="isEdit"
            v-model="formData.status"
            :items="STATUS_OPTIONS"
            label="Trạng thái"
            prepend-inner-icon="mdi-check-circle-outline"
            class="mb-2"
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn variant="text" @click="close">Hủy</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="submit">
          {{ isEdit ? 'Cập nhật' : 'Tạo mới' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  isEdit: boolean
  initialData?: { username: string; name: string; role: 'ADMIN' | 'MANAGER'; status: 'ACTIVE' | 'INACTIVE' } | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { username: string; name: string; role: 'ADMIN' | 'MANAGER'; status?: 'ACTIVE' | 'INACTIVE' }): void
}>()

const visible = ref(props.modelValue)
const isValid = ref(false)
const formRef = ref<any>(null)
const formData = ref({
  username: '',
  name: '',
  role: 'MANAGER' as 'ADMIN' | 'MANAGER',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
})

const ROLE_OPTIONS = [
  { title: 'Quản lý (Manager)', value: 'MANAGER' },
  { title: 'Quản trị viên (Admin)', value: 'ADMIN' }
]

const STATUS_OPTIONS = [
  { title: 'Đang hoạt động', value: 'ACTIVE' },
  { title: 'Bị khóa', value: 'INACTIVE' }
]

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = {
      username: newVal.username,
      name: newVal.name,
      role: newVal.role || 'MANAGER',
      status: newVal.status
    }
  } else {
    formData.value = {
      username: '',
      name: '',
      role: 'MANAGER',
      status: 'ACTIVE'
    }
  }
}, { immediate: true })

function close() {
  visible.value = false
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

async function submit() {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (valid) {
      emit('submit', { ...formData.value })
    }
  }
}
</script>
