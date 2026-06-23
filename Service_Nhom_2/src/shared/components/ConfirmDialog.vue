<template>
  <v-dialog v-model="show" max-width="440" persistent>
    <v-card>
      <v-card-title class="d-flex align-center pt-5 px-6">
        <v-icon color="warning" size="28" class="mr-3">mdi-alert</v-icon>
        <span>{{ title }}</span>
      </v-card-title>
      <v-card-text class="px-6 pt-2">
        <span v-html="message" />
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn variant="text" @click="cancel" :disabled="loading">Hủy</v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          @click="confirm"
          :loading="loading"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  message?: string
  confirmText?: string
  confirmColor?: string
}>(), {
  title: 'Xác nhận',
  message: 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText: 'Xác nhận',
  confirmColor: 'error',
})

const show = ref(false)
const loading = ref(false)

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

function open() {
  show.value = true
}

function cancel() {
  show.value = false
}

function confirm() {
  emit('confirm')
  show.value = false
}

defineExpose({ open, close: cancel })
</script>
