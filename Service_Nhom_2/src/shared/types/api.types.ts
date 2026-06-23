export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ApiError {
  title: string
  status: number
  detail?: string
  errors?: Record<string, string[]>
}
