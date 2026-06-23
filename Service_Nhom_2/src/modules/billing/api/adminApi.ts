import { http } from '@/shared/http'

export interface AdminUser {
  id: string
  username: string
  name: string
  role: 'ADMIN' | 'MANAGER'
  status: 'ACTIVE' | 'INACTIVE'
}

export const adminApi = {
  getAdmins(params?: { keyword?: string; status?: string; role?: string; page?: number; pageSize?: number }) {
    return http.get<{
      items: AdminUser[]
      page: number
      pageSize: number
      totalItems: number
      totalPages: number
    }>('/api/admins', { params })
  },
  createAdmin(data: { username: string; name: string; role: 'ADMIN' | 'MANAGER'; status?: string }) {
    return http.post<AdminUser>('/api/admins', data)
  },
  updateAdmin(id: string, data: { username: string; name: string; status: string }) {
    return http.put<AdminUser>(`/api/admins/${id}`, data)
  },
  deleteAdmin(id: string) {
    return http.delete(`/api/admins/${id}`)
  }
}
