<template>
  <div class="d-flex align-center justify-space-between flex-wrap mb-6">
    <div class="d-flex align-center">
      <v-btn v-if="back" icon="mdi-arrow-left" variant="text" class="mr-2" @click="goBack" aria-label="Quay lại" />
      <div>
        <h1 class="text-h5 font-weight-bold">{{ title }}</h1>
        <p v-if="subtitle" class="text-body-2 text-grey mt-1">{{ subtitle }}</p>
      </div>
    </div>
    <div class="d-flex ga-2 mt-2 mt-sm-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  subtitle?: string
  back?: boolean | string
}>()

const router = useRouter()

function goBack() {
  if (typeof props.back === 'string') {
    router.push(props.back)
  } else {
    router.back()
  }
}
</script>
