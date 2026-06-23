import { ref, computed } from 'vue'

export function usePagination(defaultPageSize = 20) {
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const totalItems = ref(0)

  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

  function setTotal(n: number) {
    totalItems.value = n
  }

  function reset() {
    page.value = 1
  }

  return { page, pageSize, totalItems, totalPages, setTotal, reset }
}
