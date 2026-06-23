import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('ktx_token'))
  const user = ref<User | null>(
    localStorage.getItem('ktx_user')
      ? JSON.parse(localStorage.getItem('ktx_user')!)
      : null,
  )

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isManager = computed(() => user.value?.role === 'MANAGER')
  const isStudent = computed(() => user.value?.role === 'STUDENT')
  // isStaff = ADMIN hoặc MANAGER (có quyền quản lý nghiệp vụ)
  const isStaff = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'MANAGER')

  function setAuth(t: string, u: User) {
    token.value = t
    user.value = u
    localStorage.setItem('ktx_token', t)
    localStorage.setItem('ktx_user', JSON.stringify(u))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('ktx_token')
    localStorage.removeItem('ktx_user')
  }

  return { token, user, isLoggedIn, isAdmin, isManager, isStaff, isStudent, setAuth, logout }
})
