<template>
  <div class="text-center py-12">
    <v-icon :icon="icon" size="80" color="grey-lighten-1" class="mb-4" />
    <h3 class="text-h6 text-grey-darken-1 mb-2">{{ title }}</h3>
    <p class="text-body-2 text-grey mb-6">{{ description }}</p>
    <v-btn
      v-if="actionText"
      color="primary"
      variant="flat"
      :prepend-icon="actionIcon"
      @click="$emit('action')"
    >
      {{ actionText }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
  actionText?: string
  actionIcon?: string
}>(), {
  icon: 'mdi-inbox-outline',
  title: 'Không có dữ liệu',
  description: 'Chưa có dữ liệu nào được tìm thấy.',
  actionText: '',
  actionIcon: 'mdi-plus',
})

defineEmits<{ (e: 'action'): void }>()
</script>
