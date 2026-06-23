export interface User {
  id: string
  username: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'STUDENT'
  status?: string
  studentId?: string
  studentCode?: string
  email?: string
  phone?: string
  fullName?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}
