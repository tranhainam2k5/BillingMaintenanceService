import MockAdapter from 'axios-mock-adapter'
import { http } from '@/shared/http'

const mock = new MockAdapter(http, { delayResponse: 300, onNoMatch: 'passthrough' })

const STORAGE_PREFIX = 'ktx_mock_'

function getStored<T>(key: string, defaultVal: T): T {
  const item = localStorage.getItem(STORAGE_PREFIX + key)
  if (item) {
    try {
      return JSON.parse(item)
    } catch (e) {
      console.error('Error parsing localStorage key:', key, e)
    }
  }
  return defaultVal
}

function saveStored(key: string, data: any) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
}

// ── Mock Users ──
const initialUsers = [
  // Quản trị viên (ADMIN) – toàn quyền kể cả quản lý tài khoản
  { id: 'admin-001', username: 'admin', password: 'admin', name: 'Nguyễn Quản Trị', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'admin-002', username: 'admin2', password: 'admin2', name: 'Lê Hoàng Minh', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'admin-003', username: 'admin3', password: 'admin3', name: 'Phạm Thị Thảo', role: 'ADMIN', status: 'INACTIVE' },
  // Quản lý (MANAGER) – quản lý nghiệp vụ, không quản lý tài khoản
  { id: 'mgr-001', username: 'manager', password: 'manager', name: 'Trần Thị Quản Lý', role: 'MANAGER', status: 'ACTIVE' },
  { id: 'mgr-002', username: 'manager2', password: 'manager2', name: 'Hoàng Văn Bảo', role: 'MANAGER', status: 'ACTIVE' },
  { id: 'mgr-003', username: 'manager3', password: 'manager3', name: 'Vũ Thị Lan', role: 'MANAGER', status: 'INACTIVE' },
  // Sinh viên (STUDENT)
  { id: 'sv-001', username: 'student', password: 'student', name: 'Trần Văn Sinh', role: 'STUDENT', studentId: 'st-001', studentCode: 'SV001' },
  { id: 'sv-002', username: 'sv1', password: 'sv1', name: 'Sinh Viên 1', role: 'STUDENT', studentId: 'st-002', studentCode: 'SV002' },
  { id: 'sv-003', username: 'sv2', password: 'sv2', name: 'Sinh Viên 2', role: 'STUDENT', studentId: 'st-003', studentCode: 'SV003' },
  { id: 'sv-004', username: 'sv3', password: 'sv3', name: 'Sinh Viên 3', role: 'STUDENT', studentId: 'st-004', studentCode: 'SV004' },
]

const users = getStored('users', initialUsers)

// ── Invoices ──
const initialInvoices = [
  { id: 'inv-001', studentId: 'st-001', studentCode: 'SV001', studentName: 'Trần Văn Sinh', roomNumber: 'A101', period: '06/2026', amount: 1200000, dueDate: '2026-06-05', paidDate: null, status: 'UNPAID', paymentMethod: null, note: '', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'inv-002', studentId: 'st-002', studentCode: 'SV002', studentName: 'Nguyễn Thị Hoa', roomNumber: 'B205', period: '06/2026', amount: 800000, dueDate: '2026-06-05', paidDate: '2026-06-01T10:00:00Z', status: 'PAID', paymentMethod: 'TRANSFER', note: '', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'inv-003', studentId: 'st-003', studentCode: 'SV003', studentName: 'Lê Minh Tuấn', roomNumber: 'A203', period: '05/2026', amount: 1200000, dueDate: '2026-05-05', paidDate: null, status: 'OVERDUE', paymentMethod: null, note: '', createdAt: '2026-04-20T08:00:00Z' },
  { id: 'inv-004', studentId: 'st-004', studentCode: 'SV004', studentName: 'Phạm Thanh Hằng', roomNumber: 'C102', period: '06/2026', amount: 1800000, dueDate: '2026-06-05', paidDate: '2026-05-28T15:00:00Z', status: 'PAID', paymentMethod: 'CASH', note: '', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'inv-005', studentId: 'st-005', studentCode: 'SV005', studentName: 'Hoàng Đức Anh', roomNumber: 'A105', period: '06/2026', amount: 1200000, dueDate: '2026-06-05', paidDate: null, status: 'UNPAID', paymentMethod: null, note: '', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'inv-006', studentId: 'st-001', studentCode: 'SV001', studentName: 'Trần Văn Sinh', roomNumber: 'A101', period: '05/2026', amount: 1200000, dueDate: '2026-05-05', paidDate: '2026-05-03T09:00:00Z', status: 'PAID', paymentMethod: 'TRANSFER', note: '', createdAt: '2026-04-20T08:00:00Z' },
  { id: 'inv-007', studentId: 'st-006', studentCode: 'SV006', studentName: 'Vũ Thị Mai', roomNumber: 'B301', period: '06/2026', amount: 800000, dueDate: '2026-06-05', paidDate: null, status: 'CANCELLED', paymentMethod: null, note: 'Hủy do chuyển phòng', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'inv-008', studentId: 'st-002', studentCode: 'SV002', studentName: 'Sinh Viên 1', roomNumber: 'A102', period: '06/2026', amount: 1200000, dueDate: '2026-06-05', paidDate: null, status: 'UNPAID', paymentMethod: null, note: '', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'inv-009', studentId: 'st-003', studentCode: 'SV003', studentName: 'Sinh Viên 2', roomNumber: 'A103', period: '06/2026', amount: 1200000, dueDate: '2026-06-05', paidDate: null, status: 'UNPAID', paymentMethod: null, note: '', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'inv-010', studentId: 'st-004', studentCode: 'SV004', studentName: 'Sinh Viên 3', roomNumber: 'A104', period: '06/2026', amount: 1200000, dueDate: '2026-06-05', paidDate: null, status: 'UNPAID', paymentMethod: null, note: '', createdAt: '2026-05-20T08:00:00Z' },
]

const invoices = getStored('invoices', initialInvoices)

// ── Maintenance ──
const initialMaintenanceRequests = [
  { id: 'mt-001', studentId: 'st-001', studentCode: 'SV001', studentName: 'Trần Văn Sinh', roomId: 'room-001', roomNumber: 'A101', type: 'AC', description: 'Điều hòa không lạnh, chạy có tiếng ồn', priority: 'NORMAL', status: 'NEW', assignee: null, cost: null, completedAt: null, createdAt: '2026-06-10T14:00:00Z' },
  { id: 'mt-002', studentId: 'st-002', studentCode: 'SV002', studentName: 'Nguyễn Thị Hoa', roomId: 'room-005', roomNumber: 'B205', type: 'PLUMBING', description: 'Vòi nước bồn rửa bị rỉ nước liên tục', priority: 'URGENT', status: 'IN_PROGRESS', assignee: 'Nguyễn Văn Kỹ Thuật', cost: null, completedAt: null, createdAt: '2026-06-08T09:00:00Z' },
  { id: 'mt-003', studentId: 'st-003', studentCode: 'SV003', studentName: 'Lê Minh Tuấn', roomId: 'room-003', roomNumber: 'A203', type: 'ELECTRICAL', description: 'Bóng đèn phòng ngủ bị cháy', priority: 'NORMAL', status: 'COMPLETED', assignee: 'Trần Văn Điện', cost: 50000, completedAt: '2026-06-07T16:00:00Z', createdAt: '2026-06-05T10:00:00Z' },
  { id: 'mt-004', studentId: 'st-004', studentCode: 'SV004', studentName: 'Phạm Thanh Hằng', roomId: 'room-008', roomNumber: 'C102', type: 'LOCK', description: 'Khóa cửa phòng bị kẹt, không đóng được', priority: 'URGENT', status: 'NEW', assignee: null, cost: null, completedAt: null, createdAt: '2026-06-11T08:00:00Z' },
  { id: 'mt-005', studentId: 'st-005', studentCode: 'SV005', studentName: 'Hoàng Đức Anh', roomId: 'room-002', roomNumber: 'A105', type: 'STRUCTURE', description: 'Trần nhà bị thấm nước khi trời mưa', priority: 'NORMAL', status: 'IN_PROGRESS', assignee: 'Lê Văn Xây', cost: null, completedAt: null, createdAt: '2026-06-03T11:00:00Z' },
  { id: 'mt-006', studentId: 'st-001', studentCode: 'SV001', studentName: 'Trần Văn Sinh', roomId: 'room-001', roomNumber: 'A101', type: 'ELECTRICAL', description: 'Ổ cắm điện gần bàn học bị lỏng', priority: 'NORMAL', status: 'COMPLETED', assignee: 'Trần Văn Điện', cost: 30000, completedAt: '2026-05-28T14:00:00Z', createdAt: '2026-05-25T09:00:00Z' },
  { id: 'mt-007', studentId: 'st-006', studentCode: 'SV006', studentName: 'Vũ Thị Mai', roomId: 'room-009', roomNumber: 'B301', type: 'OTHER', description: 'Quạt trần kêu to khi bật', priority: 'NORMAL', status: 'CANCELLED', assignee: null, cost: null, completedAt: null, createdAt: '2026-06-01T15:00:00Z' },
]

const maintenanceRequests = getStored<any[]>('maintenanceRequests', initialMaintenanceRequests)

// ── Reset nếu chưa có MANAGER (nâng cấp từ phiên bản cũ) ──
const hasManager = users.some((u: any) => u.role === 'MANAGER')
if (!hasManager) {
  // Xóa users cũ, nạp lại initialUsers có MANAGER
  localStorage.removeItem(STORAGE_PREFIX + 'users')
  users.length = 0
  users.push(...initialUsers)
}

saveStored('users', users)
saveStored('invoices', invoices)
saveStored('maintenanceRequests', maintenanceRequests)

// ── Auth endpoints ──
mock.onPost('/api/auth/login').reply((config) => {
  const { username, password } = JSON.parse(config.data)
  const user = users.find((u: any) => u.username === username && u.password === password)
  if (!user) {
    return [401, { title: 'Sai tài khoản hoặc mật khẩu', status: 401 }]
  }
  if (user.status !== 'ACTIVE') {
    return [403, { title: 'Tài khoản đã bị khóa', status: 403 }]
  }

  const token = 'mock-jwt-token-for-' + user.username
  return [200, { token, user: { id: user.id, username: user.username, name: user.name, role: user.role, studentId: user.studentId } }]
})
// ── Staff CRUD Endpoints (ADMIN + MANAGER) ──
mock.onGet('/api/admins').reply((config) => {
  const params = config.params || {}
  // Lọc theo role nếu có, mặc định lấy cả ADMIN và MANAGER
  let filtered = users.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER')

  if (params.role) {
    filtered = filtered.filter(u => u.role === params.role)
  }
  if (params.status) {
    filtered = filtered.filter(u => u.status === params.status)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(kw) ||
      u.username.toLowerCase().includes(kw)
    )
  }

  const page = parseInt(params.page) || 1
  const pageSize = parseInt(params.pageSize) || 10
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return [200, {
    items,
    page,
    pageSize,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize)
  }]
})

mock.onPost('/api/admins').reply((config) => {
  const data = JSON.parse(config.data)

  // Kiểm tra trùng username
  const exists = users.some(u => u.username.toLowerCase() === data.username.toLowerCase())
  if (exists) {
    return [400, { title: 'Tên đăng nhập đã tồn tại', status: 400 }]
  }

  const role = data.role === 'MANAGER' ? 'MANAGER' : 'ADMIN'
  const newUser = {
    id: (role === 'MANAGER' ? 'mgr-' : 'admin-') + Date.now(),
    username: data.username,
    password: role === 'MANAGER' ? 'manager' : 'admin',
    name: data.name,
    role,
    status: data.status || 'ACTIVE'
  }
  users.push(newUser)
  saveStored('users', users)
  return [201, newUser]
})

mock.onPut(/\/api\/admins\/[^/]+$/).reply((config) => {
  const urlParts = config.url!.split('/')
  const id = urlParts[urlParts.length - 1]
  const data = JSON.parse(config.data)

  const idx = users.findIndex(u => u.id === id && (u.role === 'ADMIN' || u.role === 'MANAGER'))
  if (idx === -1) {
    return [404, { title: 'Không tìm thấy tài khoản', status: 404 }]
  }

  // Kiểm tra trùng username với người khác
  const duplicate = users.some(u => u.id !== id && u.username.toLowerCase() === data.username.toLowerCase())
  if (duplicate) {
    return [400, { title: 'Tên đăng nhập đã tồn tại', status: 400 }]
  }

  // Cập nhật thông tin (role không thể thay đổi)
  users[idx] = {
    ...users[idx],
    username: data.username,
    name: data.name,
    status: data.status
  }
  saveStored('users', users)
  return [200, users[idx]]
})

mock.onDelete(/\/api\/admins\/[^/]+$/).reply((config) => {
  const urlParts = config.url!.split('/')
  const id = urlParts[urlParts.length - 1]

  const idx = users.findIndex(u => u.id === id && (u.role === 'ADMIN' || u.role === 'MANAGER'))
  if (idx === -1) {
    return [404, { title: 'Không tìm thấy tài khoản', status: 404 }]
  }

  if (id === 'admin-001') {
    return [400, { title: 'Không thể xóa tài khoản Quản trị viên gốc', status: 400 }]
  }

  users.splice(idx, 1)
  saveStored('users', users)
  return [204]
})

// ── Invoices Endpoints ──
mock.onGet('/api/invoices/my').reply(() => {
  let studentId = 'st-001'
  try {
    const user = JSON.parse(localStorage.getItem('ktx_user') || '{}')
    if (user && user.studentId) studentId = user.studentId
  } catch (e) {}
  const myInvoices = invoices.filter((i: any) => i.studentId === studentId)
  return [200, { items: myInvoices }]
})

mock.onGet('/api/invoices').reply((config) => {
  const params = config.params || {}
  let filtered = [...invoices]
  
  if (params.status) {
    filtered = filtered.filter((i: any) => i.status === params.status)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter((i: any) => 
      i.studentName.toLowerCase().includes(kw) || 
      i.studentCode.toLowerCase().includes(kw) ||
      i.roomNumber.toLowerCase().includes(kw)
    )
  }

  const page = parseInt(params.page) || 1
  const pageSize = parseInt(params.pageSize) || 10
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return [200, {
    items,
    page,
    pageSize,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize)
  }]
})

mock.onGet(/\/api\/invoices\/[^/]+$/).reply((config) => {
  const urlParts = config.url!.split('/')
  const id = urlParts[urlParts.length - 1]
  const inv = invoices.find((i: any) => i.id === id)
  if (!inv) return [404, { title: 'Không tìm thấy phiếu thu' }]
  return [200, inv]
})

mock.onPost('/api/invoices').reply((config) => {
  const data = JSON.parse(config.data)
  const newInvoice = {
    id: 'inv-' + Date.now(),
    studentId: data.studentId || 'st-001',
    studentCode: data.studentCode || 'SV001',
    studentName: data.studentName || 'Nguyễn Văn A',
    roomNumber: data.roomNumber || 'A101',
    period: data.period,
    amount: data.amount,
    dueDate: data.dueDate,
    paidDate: null,
    status: 'UNPAID',
    paymentMethod: null,
    note: data.note || '',
    createdAt: new Date().toISOString()
  }
  invoices.unshift(newInvoice)
  saveStored('invoices', invoices)
  return [201, newInvoice]
})

mock.onPatch(/\/api\/invoices\/[^/]+\/pay/).reply((config) => {
  const urlParts = config.url!.split('/')
  // url is /api/invoices/inv-001/pay
  const id = urlParts[urlParts.length - 2]
  const data = JSON.parse(config.data)
  
  const idx = invoices.findIndex((i: any) => i.id === id)
  if (idx === -1) return [404, { title: 'Không tìm thấy phiếu thu' }]
  
  invoices[idx] = {
    ...invoices[idx],
    status: 'PAID',
    paymentMethod: data.paymentMethod || 'CASH',
    paidDate: data.paidDate || new Date().toISOString()
  }
  saveStored('invoices', invoices)
  return [200, invoices[idx]]
})

// ── Maintenance Endpoints ──
mock.onGet('/api/maintenance').reply((config) => {
  const params = config.params || {}
  let filtered = [...maintenanceRequests]
  
  if (params.studentId) {
    filtered = filtered.filter((m: any) => m.studentId === params.studentId)
  }
  if (params.status) {
    filtered = filtered.filter((m: any) => m.status === params.status)
  }
  if (params.type) {
    filtered = filtered.filter((m: any) => m.type === params.type)
  }

  const page = parseInt(params.page) || 1
  const pageSize = parseInt(params.pageSize) || 10
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return [200, {
    items,
    page,
    pageSize,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize)
  }]
})

mock.onGet(/\/api\/maintenance\/[^/]+$/).reply((config) => {
  const urlParts = config.url!.split('/')
  const id = urlParts[urlParts.length - 1]
  const mt = maintenanceRequests.find((m: any) => m.id === id)
  if (!mt) return [404, { title: 'Không tìm thấy yêu cầu' }]
  return [200, mt]
})

mock.onPost('/api/maintenance').reply((config) => {
  const data = JSON.parse(config.data)
  const newMt = {
    id: 'mt-' + Date.now(),
    studentId: data.studentId || 'st-001',
    studentCode: data.studentCode || 'SV001',
    studentName: data.studentName || 'Nguyễn Văn A',
    roomId: data.roomId || 'room-001',
    roomNumber: data.roomNumber || 'A101',
    type: data.type || 'OTHER',
    description: data.description,
    priority: data.priority || 'NORMAL',
    status: 'NEW',
    assignee: null,
    cost: null,
    completedAt: null,
    createdAt: new Date().toISOString()
  }
  maintenanceRequests.unshift(newMt)
  saveStored('maintenanceRequests', maintenanceRequests)
  return [201, newMt]
})

mock.onPut(/\/api\/maintenance\/[^/]+\/status/).reply((config) => {
  const urlParts = config.url!.split('/')
  const id = urlParts[urlParts.length - 2]
  const data = JSON.parse(config.data)
  
  const idx = maintenanceRequests.findIndex((m: any) => m.id === id)
  if (idx === -1) return [404, { title: 'Không tìm thấy yêu cầu' }]
  
  maintenanceRequests[idx] = {
    ...maintenanceRequests[idx],
    status: data.status,
    assignee: data.technicianId ? 'Kỹ thuật viên ' + data.technicianId : maintenanceRequests[idx].assignee,
    cost: data.repairCost || maintenanceRequests[idx].cost,
    completedAt: data.status === 'COMPLETED' ? new Date().toISOString() : maintenanceRequests[idx].completedAt
  }
  saveStored('maintenanceRequests', maintenanceRequests)
  return [200, maintenanceRequests[idx]]
})

// ── Dashboard ──
mock.onGet('/api/dashboard/overview').reply(() => {
  const totalRev = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0)
  const activeMaint = maintenanceRequests.filter(m => m.status === 'NEW' || m.status === 'IN_PROGRESS').length
  const newMaint = maintenanceRequests.filter(m => m.status === 'NEW').length
  const totalDebt = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0)
  const uniqueDebtStudents = new Set(invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').map(i => i.studentId)).size

  return [200, {
    totalRevenue: totalRev || 145000000,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'PAID').length,
    totalDebt: totalDebt || 23000000,
    debtStudents: uniqueDebtStudents || 18,
    maintenanceActive: activeMaint,
    maintenanceNew: newMaint,
    revenueGrowth: 12,
  }]
})

mock.onGet('/api/dashboard/revenue').reply(() => {
  return [200, {
    labels: ['07/25', '08/25', '09/25', '10/25', '11/25', '12/25', '01/26', '02/26', '03/26', '04/26', '05/26', '06/26'],
    data: [98000000, 102000000, 115000000, 110000000, 108000000, 95000000, 120000000, 118000000, 125000000, 130000000, 138000000, 145000000],
  }]
})

mock.onGet('/api/dashboard/debt').reply(() => {
  const unpaidInvoices = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE')
  const totalDebt = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0)
  const uniqueStudents = new Set(unpaidInvoices.map(i => i.studentId)).size
  return [200, { totalDebt: totalDebt || 23000000, students: uniqueStudents || 18 }]
})

mock.onPost('/api/auth/change-password').reply((config) => {
  const { userId, oldPassword, newPassword } = JSON.parse(config.data)
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return [404, { title: 'Không tìm thấy tài khoản', status: 404 }]
  if (users[idx].password !== oldPassword) return [400, { title: 'Mật khẩu cũ không chính xác', status: 400 }]
  users[idx].password = newPassword
  saveStored('users', users)
  return [200, { message: 'Đổi mật khẩu thành công' }]
})

export default mock
