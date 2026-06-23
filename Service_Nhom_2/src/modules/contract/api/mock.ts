import MockAdapter from 'axios-mock-adapter'
import { http } from '@/shared/http'

const mock = new MockAdapter(http, { delayResponse: 250, onNoMatch: 'passthrough' })

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

// ── Students ──
const initialStudents = [
  { id: 'st-001', studentCode: 'SV001', fullName: 'Trần Văn Sinh', gender: 'MALE', dateOfBirth: '2004-05-20', citizenId: '001204000001', faculty: 'Công nghệ thông tin', className: 'CNTT15A', phoneNumber: '0987654321', email: 'svsinh@example.com', address: 'Hà Nội', guardianName: 'Trần Văn Phụ', guardianPhone: '0912345678', status: 'ACTIVE', hasActiveContract: true, activeRoomNumber: 'A101', createdAt: '2026-01-10T08:00:00Z', updatedAt: null },
  { id: 'st-002', studentCode: 'SV002', fullName: 'Nguyễn Thị Hoa', gender: 'FEMALE', dateOfBirth: '2004-08-15', citizenId: '001204000002', faculty: 'Kinh tế', className: 'KT15B', phoneNumber: '0987654322', email: 'svhoa@example.com', address: 'TP.HCM', guardianName: 'Nguyễn Văn Cha', guardianPhone: '0912345679', status: 'ACTIVE', hasActiveContract: true, activeRoomNumber: 'B205', createdAt: '2026-01-10T08:00:00Z', updatedAt: null },
  { id: 'st-003', studentCode: 'SV003', fullName: 'Lê Minh Tuấn', gender: 'MALE', dateOfBirth: '2003-12-01', citizenId: '001203000003', faculty: 'Cơ khí', className: 'CK14A', phoneNumber: '0987654323', email: 'svtuan@example.com', address: 'Đà Nẵng', guardianName: 'Lê Văn Bố', guardianPhone: '0912345680', status: 'ACTIVE', hasActiveContract: true, activeRoomNumber: 'A203', createdAt: '2026-01-12T08:00:00Z', updatedAt: null },
  { id: 'st-004', studentCode: 'SV004', fullName: 'Phạm Thanh Hằng', gender: 'FEMALE', dateOfBirth: '2004-03-22', citizenId: '001204000004', faculty: 'Y khoa', className: 'YK15C', phoneNumber: '0987654324', email: 'svhang@example.com', address: 'Huế', guardianName: 'Phạm Văn Ba', guardianPhone: '0912345681', status: 'ACTIVE', hasActiveContract: true, activeRoomNumber: 'C102', createdAt: '2026-01-15T08:00:00Z', updatedAt: null },
  { id: 'st-005', studentCode: 'SV005', fullName: 'Hoàng Đức Anh', gender: 'MALE', dateOfBirth: '2004-07-10', citizenId: '001204000005', faculty: 'Điện tử', className: 'DT15A', phoneNumber: '0987654325', email: 'svanh@example.com', address: 'Hải Phòng', guardianName: 'Hoàng Văn Mẹ', guardianPhone: '0912345682', status: 'ACTIVE', hasActiveContract: true, activeRoomNumber: 'A105', createdAt: '2026-01-18T08:00:00Z', updatedAt: null },
  { id: 'st-006', studentCode: 'SV006', fullName: 'Vũ Thị Mai', gender: 'FEMALE', dateOfBirth: '2004-11-30', citizenId: '001204000006', faculty: 'Ngoại ngữ', className: 'NN15D', phoneNumber: '0987654326', email: 'svmai@example.com', address: 'Nghệ An', guardianName: 'Vũ Văn Cha', guardianPhone: '0912345683', status: 'ACTIVE', hasActiveContract: false, activeRoomNumber: null, createdAt: '2026-02-01T08:00:00Z', updatedAt: null },
  { id: 'st-007', studentCode: 'SV007', fullName: 'Đỗ Quang Huy', gender: 'MALE', dateOfBirth: '2003-09-15', citizenId: '001203000007', faculty: 'Xây dựng', className: 'XD14B', phoneNumber: '0987654327', email: 'svhuy@example.com', address: 'Nam Định', guardianName: 'Đỗ Thị Mẹ', guardianPhone: '0912345684', status: 'GRADUATED', hasActiveContract: false, activeRoomNumber: null, createdAt: '2025-09-01T08:00:00Z', updatedAt: '2026-05-15T08:00:00Z' },
  { id: 'st-008', studentCode: 'SV008', fullName: 'Bùi Văn Long', gender: 'MALE', dateOfBirth: '2004-01-08', citizenId: '001204000008', faculty: 'Công nghệ thông tin', className: 'CNTT15B', phoneNumber: '0987654328', email: 'svlong@example.com', address: 'Thái Bình', guardianName: 'Bùi Văn Cha', guardianPhone: '0912345685', status: 'SUSPENDED', hasActiveContract: false, activeRoomNumber: null, createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-04-01T08:00:00Z' },
]

// ── Applications ──
const initialApplications = [
  { id: 'app-001', studentId: 'st-006', studentCode: 'SV006', studentName: 'Vũ Thị Mai', buildingId: 'bld-002', roomTypeId: 'rt-002', preferredFloor: 2, expectedStartDate: '2026-09-01', expectedEndDate: '2027-06-30', note: 'Muốn ở tầng thấp', status: 'SUBMITTED', submittedAt: '2026-06-10T08:00:00Z', approvedBy: null, approvedAt: null, rejectedBy: null, rejectReason: null, createdAt: '2026-06-09T08:00:00Z', updatedAt: null },
  { id: 'app-002', studentId: 'st-001', studentCode: 'SV001', studentName: 'Trần Văn Sinh', buildingId: 'bld-001', roomTypeId: 'rt-002', preferredFloor: 1, expectedStartDate: '2026-09-01', expectedEndDate: '2027-06-30', note: '', status: 'APPROVED', submittedAt: '2026-05-15T08:00:00Z', approvedBy: 'admin-001', approvedAt: '2026-05-18T10:00:00Z', rejectedBy: null, rejectReason: null, createdAt: '2026-05-14T08:00:00Z', updatedAt: '2026-05-18T10:00:00Z' },
  { id: 'app-003', studentId: 'st-007', studentCode: 'SV007', studentName: 'Đỗ Quang Huy', buildingId: 'bld-001', roomTypeId: 'rt-003', preferredFloor: null, expectedStartDate: '2026-09-01', expectedEndDate: '2027-06-30', note: 'Phòng nào cũng được', status: 'REJECTED', submittedAt: '2026-05-20T08:00:00Z', approvedBy: null, approvedAt: null, rejectedBy: 'admin-001', rejectReason: 'Sinh viên đã tốt nghiệp', createdAt: '2026-05-19T08:00:00Z', updatedAt: '2026-05-21T08:00:00Z' },
  { id: 'app-004', studentId: 'st-006', studentCode: 'SV006', studentName: 'Vũ Thị Mai', buildingId: 'bld-002', roomTypeId: 'rt-001', preferredFloor: 3, expectedStartDate: '2026-09-01', expectedEndDate: '2027-06-30', note: 'Đơn nháp chưa gửi', status: 'DRAFT', submittedAt: null, approvedBy: null, approvedAt: null, rejectedBy: null, rejectReason: null, createdAt: '2026-06-11T08:00:00Z', updatedAt: null },
]

// ── Contracts ──
const initialContracts = [
  { id: 'ct-001', contractCode: 'HD-2026-0001', applicationId: 'app-002', studentId: 'st-001', studentCode: 'SV001', studentName: 'Trần Văn Sinh', buildingId: 'bld-001', roomTypeId: 'rt-002', roomId: 'room-001', bedId: 'bed-room-001-01', buildingNameSnapshot: 'KTX A', roomNumberSnapshot: 'A101', bedNumberSnapshot: 'A101-01', roomTypeNameSnapshot: 'Phòng 6 người', startDate: '2026-09-01', endDate: '2027-06-30', monthlyPrice: 1200000, depositAmount: 500000, paymentCycle: 'MONTHLY', status: 'ACTIVE', signedAt: '2026-05-18T08:00:00Z', terminatedAt: null, terminateReason: null, createdAt: '2026-05-18T08:00:00Z', updatedAt: null },
  { id: 'ct-002', contractCode: 'HD-2026-0002', applicationId: null, studentId: 'st-002', studentCode: 'SV002', studentName: 'Nguyễn Thị Hoa', buildingId: 'bld-002', roomTypeId: 'rt-003', roomId: 'room-005', bedId: 'bed-room-005-01', buildingNameSnapshot: 'KTX B', roomNumberSnapshot: 'B205', bedNumberSnapshot: 'B205-01', roomTypeNameSnapshot: 'Phòng 8 người', startDate: '2026-09-01', endDate: '2027-06-30', monthlyPrice: 800000, depositAmount: 300000, paymentCycle: 'MONTHLY', status: 'ACTIVE', signedAt: '2026-05-20T08:00:00Z', terminatedAt: null, terminateReason: null, createdAt: '2026-05-20T08:00:00Z', updatedAt: null },
  { id: 'ct-003', contractCode: 'HD-2026-0003', applicationId: null, studentId: 'st-003', studentCode: 'SV003', studentName: 'Lê Minh Tuấn', buildingId: 'bld-001', roomTypeId: 'rt-002', roomId: 'room-003', bedId: 'bed-room-003-01', buildingNameSnapshot: 'KTX A', roomNumberSnapshot: 'A203', bedNumberSnapshot: 'A203-01', roomTypeNameSnapshot: 'Phòng 6 người', startDate: '2026-03-01', endDate: '2026-07-15', monthlyPrice: 1200000, depositAmount: 500000, paymentCycle: 'MONTHLY', status: 'ACTIVE', signedAt: '2026-02-28T08:00:00Z', terminatedAt: null, terminateReason: null, createdAt: '2026-02-28T08:00:00Z', updatedAt: null },
  { id: 'ct-004', contractCode: 'HD-2026-0004', applicationId: null, studentId: 'st-004', studentCode: 'SV004', studentName: 'Phạm Thanh Hằng', buildingId: 'bld-003', roomTypeId: 'rt-001', roomId: 'room-008', bedId: 'bed-room-008-01', buildingNameSnapshot: 'KTX C', roomNumberSnapshot: 'C102', bedNumberSnapshot: 'C102-01', roomTypeNameSnapshot: 'Phòng 4 người', startDate: '2026-09-01', endDate: '2027-06-30', monthlyPrice: 1800000, depositAmount: 800000, paymentCycle: 'SEMESTER', status: 'ACTIVE', signedAt: '2026-05-25T08:00:00Z', terminatedAt: null, terminateReason: null, createdAt: '2026-05-25T08:00:00Z', updatedAt: null },
  { id: 'ct-005', contractCode: 'HD-2025-0010', applicationId: null, studentId: 'st-007', studentCode: 'SV007', studentName: 'Đỗ Quang Huy', buildingId: 'bld-001', roomTypeId: 'rt-002', roomId: 'room-002', bedId: 'bed-room-002-01', buildingNameSnapshot: 'KTX A', roomNumberSnapshot: 'A105', bedNumberSnapshot: 'A105-01', roomTypeNameSnapshot: 'Phòng 6 người', startDate: '2025-09-01', endDate: '2026-06-30', monthlyPrice: 1200000, depositAmount: 500000, paymentCycle: 'MONTHLY', status: 'EXPIRED', signedAt: '2025-08-30T08:00:00Z', terminatedAt: null, terminateReason: null, createdAt: '2025-08-30T08:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
]

// ── Occupancies ──
const initialOccupancies = [
  { id: 'occ-001', studentId: 'st-001', studentCode: 'SV001', studentName: 'Trần Văn Sinh', contractId: 'ct-001', contractCode: 'HD-2026-0001', roomId: 'room-001', bedId: 'bed-room-001-01', roomNumberSnapshot: 'A101', bedNumberSnapshot: 'A101-01', checkInDate: '2026-09-01', checkOutDate: null as string | null, status: 'ACTIVE', createdAt: '2026-05-18T08:00:00Z', updatedAt: null as string | null },
  { id: 'occ-002', studentId: 'st-002', studentCode: 'SV002', studentName: 'Nguyễn Thị Hoa', contractId: 'ct-002', contractCode: 'HD-2026-0002', roomId: 'room-005', bedId: 'bed-room-005-01', roomNumberSnapshot: 'B205', bedNumberSnapshot: 'B205-01', checkInDate: '2026-09-01', checkOutDate: null as string | null, status: 'ACTIVE', createdAt: '2026-05-20T08:00:00Z', updatedAt: null as string | null },
  { id: 'occ-003', studentId: 'st-003', studentCode: 'SV003', studentName: 'Lê Minh Tuấn', contractId: 'ct-003', contractCode: 'HD-2026-0003', roomId: 'room-003', bedId: 'bed-room-003-01', roomNumberSnapshot: 'A203', bedNumberSnapshot: 'A203-01', checkInDate: '2026-03-01', checkOutDate: null as string | null, status: 'ACTIVE', createdAt: '2026-02-28T08:00:00Z', updatedAt: null as string | null },
]

const students = getStored('students', initialStudents)
const applications = getStored('applications', initialApplications)
const contracts = getStored('contracts', initialContracts)
const occupancies = getStored('occupancies', initialOccupancies)

saveStored('students', students)
saveStored('applications', applications)
saveStored('contracts', contracts)
saveStored('occupancies', occupancies)

// ── Student endpoints removed because real API exists ──
mock.onPost(/\/api\/students\/[^/]+\/assign-room/).reply((c) => {
  const studentId = c.url!.split('/')[3]
  const idx = students.findIndex(x => x.id === studentId)
  if (idx < 0) return [404, { message: 'Student not found' }]
  const student = students[idx]
  
  const body = JSON.parse(c.data)
  
  let roomNumberSnapshot = ''
  let bedNumberSnapshot = ''
  let roomTypeNameSnapshot = ''
  let buildingId = ''
  let roomTypeId = ''
  
  const roomsStore = localStorage.getItem('ktx_mock_rooms')
  const bedsStore = localStorage.getItem('ktx_mock_beds')
  if (roomsStore && bedsStore) {
    try {
      const localRooms = JSON.parse(roomsStore)
      const localBeds = JSON.parse(bedsStore)
      
      const rIdx = localRooms.findIndex((r: any) => r.id === body.roomId)
      const bIdx = localBeds.findIndex((b: any) => b.id === body.bedId)
      
      if (bIdx >= 0) {
        localBeds[bIdx].status = 'OCCUPIED'
        bedNumberSnapshot = localBeds[bIdx].bedNumber
      }
      if (rIdx >= 0) {
        localRooms[rIdx].currentOccupancy += 1
        if (localRooms[rIdx].currentOccupancy >= localRooms[rIdx].roomType.capacity) {
          localRooms[rIdx].status = 'FULL'
        }
        roomNumberSnapshot = localRooms[rIdx].roomNumber
        roomTypeNameSnapshot = localRooms[rIdx].roomType.typeName
        buildingId = localRooms[rIdx].buildingId
        roomTypeId = localRooms[rIdx].roomType.id
        
        const roomBedIdx = localRooms[rIdx].beds.findIndex((b: any) => b.id === body.bedId)
        if (roomBedIdx >= 0) {
          localRooms[rIdx].beds[roomBedIdx].status = 'OCCUPIED'
        }
      }
      localStorage.setItem('ktx_mock_rooms', JSON.stringify(localRooms))
      localStorage.setItem('ktx_mock_beds', JSON.stringify(localBeds))
    } catch (e) {
      console.error(e)
    }
  }

  const ct = { 
    id: 'ct-' + Date.now(), 
    contractCode: `HD-2026-${String(contracts.length+1).padStart(4,'0')}`, 
    applicationId: null, 
    studentId: student.id, 
    studentCode: student.studentCode, 
    studentName: student.fullName, 
    buildingId, 
    roomTypeId, 
    roomId: body.roomId, 
    bedId: body.bedId, 
    buildingNameSnapshot: 'KTX', 
    roomNumberSnapshot, 
    bedNumberSnapshot, 
    roomTypeNameSnapshot, 
    startDate: body.contractStartDate, 
    endDate: body.contractEndDate, 
    monthlyPrice: body.monthlyPrice, 
    depositAmount: body.depositAmount || 0, 
    paymentCycle: body.paymentCycle || 'MONTHLY', 
    status: 'ACTIVE', 
    signedAt: new Date().toISOString(), 
    terminatedAt: null, 
    terminateReason: null, 
    createdAt: new Date().toISOString(), 
    updatedAt: null 
  }
  contracts.push(ct)

  student.hasActiveContract = true
  student.activeRoomNumber = roomNumberSnapshot || 'A101'

  const occ = {
    id: 'occ-' + Date.now(),
    studentId: student.id,
    studentCode: student.studentCode,
    studentName: student.fullName,
    contractId: ct.id,
    contractCode: ct.contractCode,
    roomId: ct.roomId,
    bedId: ct.bedId,
    roomNumberSnapshot,
    bedNumberSnapshot,
    checkInDate: ct.startDate,
    checkOutDate: null,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: null
  }
  occupancies.push(occ)

  saveStored('contracts', contracts)
  saveStored('students', students)
  saveStored('occupancies', occupancies)
  return [200, { status: 'ASSIGNED', contract: ct }]
})

// ── Application endpoints ──
mock.onGet('/api/room-applications').reply((c) => {
  let f = [...applications]; const p = c.params || {}
  if (p.status) f = f.filter(a => a.status === p.status)
  if (p.keyword) { const kw = p.keyword.toLowerCase(); f = f.filter(a => a.studentName.toLowerCase().includes(kw) || a.studentCode.toLowerCase().includes(kw)) }
  const page = parseInt(p.page) || 1, ps = parseInt(p.pageSize) || 20, start = (page-1)*ps
  return [200, { items: f.slice(start, start+ps), page, pageSize: ps, totalItems: f.length, totalPages: Math.ceil(f.length/ps) }]
})
mock.onGet(/\/api\/room-applications\/student\/[^/]+\/latest$/).reply((c) => {
  const sid = c.url!.split('/')[4]
  const a = applications.filter(x => x.studentId === sid).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  return a ? [200, a] : [404]
})
mock.onGet(/\/api\/room-applications\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const a = applications.find(x => x.id === id)
  if (!a) return [404]
  const student = students.find(s => s.id === a.studentId)
  return [200, { ...a, student }]
})
mock.onPost('/api/room-applications').reply((c) => {
  const body = JSON.parse(c.data)
  const st = students.find(s => s.id === body.studentId)
  const item = { id: 'app-' + Date.now(), ...body, studentCode: st?.studentCode, studentName: st?.fullName, status: 'DRAFT', submittedAt: null, approvedBy: null, approvedAt: null, rejectedBy: null, rejectReason: null, createdAt: new Date().toISOString(), updatedAt: null }
  applications.push(item)
  saveStored('applications', applications)
  return [201, item]
})
mock.onPatch(/\/api\/room-applications\/[^/]+\/submit/).reply((c) => {
  const id = c.url!.split('/')[3]; const a = applications.find(x => x.id === id)
  if (!a) return [404]
  a.status = 'SUBMITTED'
  a.submittedAt = new Date().toISOString()
  saveStored('applications', applications)
  return [204]
})
mock.onPatch(/\/api\/room-applications\/[^/]+\/approve/).reply((c) => {
  const id = c.url!.split('/')[3]; const a = applications.find(x => x.id === id)
  if (!a) return [404]; const body = JSON.parse(c.data)
  a.status = 'APPROVED'; a.approvedAt = new Date().toISOString(); a.approvedBy = body.approvedBy || 'admin'
  
  let roomNumberSnapshot = ''
  let bedNumberSnapshot = ''
  let roomTypeNameSnapshot = ''
  
  const roomsStore = localStorage.getItem('ktx_mock_rooms')
  const bedsStore = localStorage.getItem('ktx_mock_beds')
  if (roomsStore && bedsStore) {
    try {
      const localRooms = JSON.parse(roomsStore)
      const localBeds = JSON.parse(bedsStore)
      
      const rIdx = localRooms.findIndex((r: any) => r.id === body.roomId)
      const bIdx = localBeds.findIndex((b: any) => b.id === body.bedId)
      
      if (bIdx >= 0) {
        localBeds[bIdx].status = 'OCCUPIED'
        bedNumberSnapshot = localBeds[bIdx].bedNumber
      }
      if (rIdx >= 0) {
        localRooms[rIdx].currentOccupancy += 1
        if (localRooms[rIdx].currentOccupancy >= localRooms[rIdx].roomType.capacity) {
          localRooms[rIdx].status = 'FULL'
        }
        roomNumberSnapshot = localRooms[rIdx].roomNumber
        roomTypeNameSnapshot = localRooms[rIdx].roomType.typeName
        
        const roomBedIdx = localRooms[rIdx].beds.findIndex((b: any) => b.id === body.bedId)
        if (roomBedIdx >= 0) {
          localRooms[rIdx].beds[roomBedIdx].status = 'OCCUPIED'
        }
      }
      localStorage.setItem('ktx_mock_rooms', JSON.stringify(localRooms))
      localStorage.setItem('ktx_mock_beds', JSON.stringify(localBeds))
    } catch (e) {
      console.error(e)
    }
  }

  const ct = { id: 'ct-' + Date.now(), contractCode: `HD-2026-${String(contracts.length+1).padStart(4,'0')}`, applicationId: id, studentId: a.studentId, studentCode: a.studentCode, studentName: a.studentName, buildingId: a.buildingId, roomTypeId: a.roomTypeId, roomId: body.roomId, bedId: body.bedId, buildingNameSnapshot: 'KTX', roomNumberSnapshot, bedNumberSnapshot, roomTypeNameSnapshot, startDate: body.contractStartDate, endDate: body.contractEndDate, monthlyPrice: body.monthlyPrice, depositAmount: body.depositAmount || 0, paymentCycle: body.paymentCycle || 'MONTHLY', status: 'ACTIVE', signedAt: new Date().toISOString(), terminatedAt: null, terminateReason: null, createdAt: new Date().toISOString(), updatedAt: null }
  contracts.push(ct)

  // set student's hasActiveContract = true
  const stIdx = students.findIndex(s => s.id === a.studentId)
  if (stIdx >= 0) {
    students[stIdx].hasActiveContract = true
    students[stIdx].activeRoomNumber = roomNumberSnapshot || 'A101'
  }

  // create occupancy
  const occ = {
    id: 'occ-' + Date.now(),
    studentId: a.studentId,
    studentCode: a.studentCode,
    studentName: a.studentName,
    contractId: ct.id,
    contractCode: ct.contractCode,
    roomId: ct.roomId,
    bedId: ct.bedId,
    roomNumberSnapshot,
    bedNumberSnapshot,
    checkInDate: ct.startDate,
    checkOutDate: null,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: null
  }
  occupancies.push(occ)

  saveStored('applications', applications)
  saveStored('contracts', contracts)
  saveStored('students', students)
  saveStored('occupancies', occupancies)
  return [200, { applicationId: id, status: 'APPROVED', contract: ct }]
})
mock.onPatch(/\/api\/room-applications\/[^/]+\/reject/).reply((c) => {
  const id = c.url!.split('/')[3]; const a = applications.find(x => x.id === id)
  if (!a) return [404]; const body = JSON.parse(c.data)
  a.status = 'REJECTED'; a.rejectReason = body.rejectReason; a.rejectedBy = body.rejectedBy || 'admin'
  saveStored('applications', applications)
  return [204]
})
mock.onPatch(/\/api\/room-applications\/[^/]+\/cancel/).reply((c) => {
  const id = c.url!.split('/')[3]; const a = applications.find(x => x.id === id)
  if (!a) return [404]
  a.status = 'CANCELLED'
  saveStored('applications', applications)
  return [204]
})

// ── Contract endpoints ──
mock.onGet('/api/contracts').reply((c) => {
  let f = [...contracts]; const p = c.params || {}
  if (p.status) f = f.filter(ct => ct.status === p.status)
  if (p.buildingId) f = f.filter(ct => ct.buildingId === p.buildingId)
  if (p.keyword) { const kw = p.keyword.toLowerCase(); f = f.filter(ct => ct.contractCode.toLowerCase().includes(kw) || ct.studentName.toLowerCase().includes(kw) || ct.studentCode.toLowerCase().includes(kw)) }
  const page = parseInt(p.page) || 1, ps = parseInt(p.pageSize) || 20, start = (page-1)*ps
  return [200, { items: f.slice(start, start+ps), page, pageSize: ps, totalItems: f.length, totalPages: Math.ceil(f.length/ps) }]
})
mock.onGet(/\/api\/contracts\/student\/[^/]+\/active$/).reply((c) => {
  const sid = c.url!.split('/')[4]
  const ct = contracts.find(x => x.studentId === sid && x.status === 'ACTIVE')
  return ct ? [200, ct] : [404]
})
mock.onGet(/\/api\/contracts\/student\/[^/]+$/).reply((c) => {
  const sid = c.url!.split('/').pop()
  return [200, contracts.filter(x => x.studentId === sid)]
})
mock.onGet(/\/api\/contracts\/room\/[^/]+\/active$/).reply((c) => {
  const rid = c.url!.split('/')[4]
  return [200, contracts.filter(x => x.roomId === rid && x.status === 'ACTIVE')]
})
mock.onGet(/\/api\/contracts\/[^/]+\/print$/).reply((c) => {
  const id = c.url!.split('/')[3]
  const ct = contracts.find(x => x.id === id)
  if (!ct) return [404]
  const st = students.find(s => s.id === ct.studentId)
  return [200, { ...ct, citizenId: st?.citizenId, phoneNumber: st?.phoneNumber, email: st?.email, address: st?.address, guardianName: st?.guardianName, guardianPhone: st?.guardianPhone, terms: ['Sinh viên thanh toán tiền phòng đúng hạn.', 'Sinh viên giữ gìn tài sản trong phòng.', 'Nếu chấm dứt hợp đồng trước hạn phải báo trước theo quy định.'] }]
})
mock.onGet(/\/api\/contracts\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const ct = contracts.find(x => x.id === id)
  if (!ct) return [404]
  const student = students.find(s => s.id === ct.studentId)
  return [200, { ...ct, student }]
})
mock.onPost('/api/contracts').reply((c) => {
  const body = JSON.parse(c.data)
  const st = students.find(s => s.id === body.studentId)
  const item = { id: 'ct-' + Date.now(), contractCode: `HD-2026-${String(contracts.length+1).padStart(4,'0')}`, applicationId: null, studentId: body.studentId, studentCode: st?.studentCode || '', studentName: st?.fullName || '', ...body, buildingNameSnapshot: '', roomNumberSnapshot: '', bedNumberSnapshot: '', roomTypeNameSnapshot: '', status: 'ACTIVE', signedAt: new Date().toISOString(), terminatedAt: null, terminateReason: null, createdAt: new Date().toISOString(), updatedAt: null }
  contracts.push(item)
  saveStored('contracts', contracts)
  return [201, item]
})
mock.onPatch(/\/api\/contracts\/[^/]+\/terminate/).reply((c) => {
  const id = c.url!.split('/')[3]; const ct = contracts.find(x => x.id === id)
  if (!ct) return [404]; const body = JSON.parse(c.data)
  ct.status = 'TERMINATED'; ct.terminatedAt = body.terminatedAt; ct.terminateReason = body.terminateReason

  const stIdx = students.findIndex(s => s.id === ct.studentId)
  if (stIdx >= 0) {
    students[stIdx].hasActiveContract = false
    students[stIdx].activeRoomNumber = null
  }

  const occIdx = occupancies.findIndex(o => o.contractId === ct.id && o.status === 'ACTIVE')
  if (occIdx >= 0) {
    occupancies[occIdx].status = 'CHECKED_OUT'
    occupancies[occIdx].checkOutDate = body.terminatedAt || new Date().toISOString().split('T')[0]
  }

  const roomsStore = localStorage.getItem('ktx_mock_rooms')
  const bedsStore = localStorage.getItem('ktx_mock_beds')
  if (roomsStore && bedsStore) {
    try {
      const localRooms = JSON.parse(roomsStore)
      const localBeds = JSON.parse(bedsStore)
      
      const rIdx = localRooms.findIndex((r: any) => r.id === ct.roomId)
      const bIdx = localBeds.findIndex((b: any) => b.id === ct.bedId)
      
      if (bIdx >= 0) {
        localBeds[bIdx].status = 'AVAILABLE'
      }
      if (rIdx >= 0) {
        localRooms[rIdx].currentOccupancy = Math.max(0, localRooms[rIdx].currentOccupancy - 1)
        if (localRooms[rIdx].status === 'FULL') {
          localRooms[rIdx].status = 'AVAILABLE'
        }
        const roomBedIdx = localRooms[rIdx].beds.findIndex((b: any) => b.id === ct.bedId)
        if (roomBedIdx >= 0) {
          localRooms[rIdx].beds[roomBedIdx].status = 'AVAILABLE'
        }
      }
      localStorage.setItem('ktx_mock_rooms', JSON.stringify(localRooms))
      localStorage.setItem('ktx_mock_beds', JSON.stringify(localBeds))
    } catch (e) {
      console.error(e)
    }
  }

  saveStored('contracts', contracts)
  saveStored('students', students)
  saveStored('occupancies', occupancies)
  return [204]
})
mock.onPatch(/\/api\/contracts\/[^/]+\/extend/).reply((c) => {
  const id = c.url!.split('/')[3]; const ct = contracts.find(x => x.id === id)
  if (!ct) return [404]; const body = JSON.parse(c.data)
  ct.endDate = body.newEndDate; if (body.monthlyPrice) ct.monthlyPrice = body.monthlyPrice
  saveStored('contracts', contracts)
  return [200, ct]
})
mock.onPatch(/\/api\/contracts\/[^/]+\/expire/).reply((c) => {
  const id = c.url!.split('/')[3]; const ct = contracts.find(x => x.id === id)
  if (!ct) return [404]
  ct.status = 'EXPIRED'
  saveStored('contracts', contracts)
  return [204]
})
mock.onPatch(/\/api\/contracts\/[^/]+\/cancel/).reply((c) => {
  const id = c.url!.split('/')[3]; const ct = contracts.find(x => x.id === id)
  if (!ct) return [404]
  ct.status = 'CANCELLED'
  saveStored('contracts', contracts)
  return [204]
})

// ── Occupancy endpoints ──
mock.onGet('/api/occupancies').reply((c) => {
  let f = [...occupancies]; const p = c.params || {}
  if (p.roomId) f = f.filter(o => o.roomId === p.roomId)
  if (p.status) f = f.filter(o => o.status === p.status)
  const page = parseInt(p.page) || 1, ps = parseInt(p.pageSize) || 20, start = (page-1)*ps
  return [200, { items: f.slice(start, start+ps), page, pageSize: ps, totalItems: f.length, totalPages: Math.ceil(f.length/ps) }]
})
mock.onGet(/\/api\/occupancies\/room\/[^/]+\/current$/).reply((c) => {
  const rid = c.url!.split('/')[4]
  return [200, occupancies.filter(o => o.roomId === rid && o.status === 'ACTIVE')]
})
mock.onGet(/\/api\/occupancies\/student\/[^/]+\/current$/).reply((c) => {
  const sid = c.url!.split('/')[4]
  const o = occupancies.find(x => x.studentId === sid && x.status === 'ACTIVE')
  return o ? [200, o] : [404]
})
mock.onGet(/\/api\/occupancies\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const o = occupancies.find(x => x.id === id)
  return o ? [200, o] : [404]
})
mock.onPatch(/\/api\/occupancies\/[^/]+\/checkout/).reply((c) => {
  const id = c.url!.split('/')[3]; const o = occupancies.find(x => x.id === id)
  if (!o) return [404]
  o.status = 'CHECKED_OUT'
  o.checkOutDate = new Date().toISOString().split('T')[0]
  saveStored('occupancies', occupancies)
  return [204]
})

// ── Room References ──
mock.onGet('/api/room-references/available').reply(() => {
  const roomsStore = localStorage.getItem('ktx_mock_rooms')
  const buildingsStore = localStorage.getItem('ktx_mock_buildings')
  if (roomsStore && buildingsStore) {
    try {
      const localRooms = JSON.parse(roomsStore)
      const localBuildings = JSON.parse(buildingsStore)
      const availableRooms = localRooms
        .filter((r: any) => r.status === 'AVAILABLE' && r.currentOccupancy < r.roomType.capacity)
        .map((r: any) => {
          const bld = localBuildings.find((b: any) => b.id === r.buildingId)
          return {
            buildingId: r.buildingId,
            buildingName: bld ? bld.name : 'KTX',
            buildingGenderType: bld ? bld.genderType : 'MIXED',
            roomId: r.id,
            roomNumber: r.roomNumber,
            floorNumber: r.floorNumber,
            roomTypeId: r.roomType.id,
            roomTypeName: r.roomType.typeName,
            capacity: r.roomType.capacity,
            currentOccupancy: r.currentOccupancy,
            availableSlots: r.roomType.capacity - r.currentOccupancy,
            basePrice: r.roomType.basePrice,
            status: r.status
          }
        })
      return [200, availableRooms]
    } catch (e) {
      console.error(e)
    }
  }
  // fallback
  return [200, [
    { buildingId: 'bld-001', buildingName: 'KTX A', buildingGenderType: 'MALE', roomId: 'room-001', roomNumber: 'A101', floorNumber: 1, roomTypeId: 'rt-002', roomTypeName: 'Phòng 6 người', capacity: 6, currentOccupancy: 4, availableSlots: 2, basePrice: 1200000, status: 'AVAILABLE' },
    { buildingId: 'bld-001', buildingName: 'KTX A', buildingGenderType: 'MALE', roomId: 'room-002', roomNumber: 'A105', floorNumber: 1, roomTypeId: 'rt-003', roomTypeName: 'Phòng 8 người', capacity: 8, currentOccupancy: 5, availableSlots: 3, basePrice: 800000, status: 'AVAILABLE' },
    { buildingId: 'bld-002', buildingName: 'KTX B', buildingGenderType: 'FEMALE', roomId: 'room-005', roomNumber: 'B205', floorNumber: 2, roomTypeId: 'rt-003', roomTypeName: 'Phòng 8 người', capacity: 8, currentOccupancy: 6, availableSlots: 2, basePrice: 800000, status: 'AVAILABLE' },
  ]]
})

mock.onGet('/api/room-references/validate-assignment').reply(200, { valid: true, message: 'Phòng và giường hợp lệ.' })

// ── Statistics ──
mock.onGet('/api/contract-statistics/overview').reply(() => {
  return [200, {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'ACTIVE').length,
    totalApplications: applications.length,
    submittedApplications: applications.filter(a => a.status === 'SUBMITTED').length,
    approvedApplications: applications.filter(a => a.status === 'APPROVED').length,
    rejectedApplications: applications.filter(a => a.status === 'REJECTED').length,
    activeContracts: contracts.filter(c => c.status === 'ACTIVE').length,
    expiredContracts: contracts.filter(c => c.status === 'EXPIRED').length,
    terminatedContracts: contracts.filter(c => c.status === 'TERMINATED').length,
    occupyingStudents: occupancies.filter(o => o.status === 'ACTIVE').length
  }]
})
mock.onGet('/api/contract-statistics/by-building').reply(() => {
  const bldsStore = localStorage.getItem('ktx_mock_buildings')
  if (bldsStore) {
    try {
      const localBuildings = JSON.parse(bldsStore)
      const data = localBuildings.map((b: any) => {
        const active = contracts.filter(c => c.buildingId === b.id && c.status === 'ACTIVE').length
        const term = contracts.filter(c => c.buildingId === b.id && c.status === 'TERMINATED').length
        const exp = contracts.filter(c => c.buildingId === b.id && c.status === 'EXPIRED').length
        return {
          buildingId: b.id,
          buildingNameSnapshot: b.name,
          activeContracts: active,
          terminatedContracts: term,
          expiredContracts: exp
        }
      })
      return [200, data]
    } catch (e) {
      console.error(e)
    }
  }
  return [200, [
    { buildingId: 'bld-001', buildingNameSnapshot: 'KTX A', activeContracts: 2, terminatedContracts: 0, expiredContracts: 1 },
    { buildingId: 'bld-002', buildingNameSnapshot: 'KTX B', activeContracts: 1, terminatedContracts: 0, expiredContracts: 0 },
    { buildingId: 'bld-003', buildingNameSnapshot: 'KTX C', activeContracts: 1, terminatedContracts: 0, expiredContracts: 0 },
  ]]
})
mock.onGet('/api/contract-statistics/expiring-soon').reply(() => {
  const upcoming = contracts.filter(c => {
    if (c.status !== 'ACTIVE') return false
    const diffTime = new Date(c.endDate).getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 30
  }).map(c => ({
    contractId: c.id,
    contractCode: c.contractCode,
    studentId: c.studentId,
    studentCode: c.studentCode,
    studentName: c.studentName,
    roomNumberSnapshot: c.roomNumberSnapshot,
    endDate: c.endDate,
    daysRemaining: Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }))
  return [200, upcoming]
})

export { students, applications, contracts, occupancies }
export default mock
