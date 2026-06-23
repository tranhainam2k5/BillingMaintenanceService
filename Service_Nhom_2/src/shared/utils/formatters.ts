import dayjs from 'dayjs'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function formatDate(date: string | Date, format = 'DD/MM/YYYY'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const enumLabels: Record<string, string> = {
  MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác', MIXED: 'Hỗn hợp',
  ACTIVE: 'Hoạt động', INACTIVE: 'Không hoạt động',
  AVAILABLE: 'Còn chỗ', FULL: 'Đầy',
  UNDER_MAINTENANCE: 'Bảo trì', BROKEN: 'Hỏng', RETIRED: 'Thanh lý',
  PENDING: 'Chờ xử lý', SUBMITTED: 'Đã gửi',
  APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy',
  TERMINATED: 'Chấm dứt', EXPIRED: 'Hết hạn',
  PAID: 'Đã thanh toán', UNPAID: 'Chưa thanh toán', OVERDUE: 'Quá hạn',
  GRADUATED: 'Đã tốt nghiệp', SUSPENDED: 'Đình chỉ',
  OCCUPIED: 'Đã sử dụng', CHECKED_OUT: 'Đã trả',
  MONTHLY: 'Hàng tháng', SEMESTER: 'Học kỳ', YEARLY: 'Hàng năm',
  NEW: 'Mới', IN_PROGRESS: 'Đang xử lý', COMPLETED: 'Hoàn thành',
}

export function formatEnum(value: string): string {
  return enumLabels[value] || value
}

export function formatRelativeTime(date: string | Date): string {
  const diff = dayjs().diff(dayjs(date), 'minute')
  if (diff < 1) return 'Vừa xong'
  if (diff < 60) return `${diff} phút trước`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}
