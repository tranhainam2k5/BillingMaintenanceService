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

// ── Buildings ──
const initialBuildings = [
  { id: 'bld-001', name: 'KTX A', totalFloors: 6, genderType: 'MALE', status: 'ACTIVE', description: 'Khu A dành cho nam sinh viên', createdAt: '2026-01-15T08:00:00Z', updatedAt: null },
  { id: 'bld-002', name: 'KTX B', totalFloors: 5, genderType: 'FEMALE', status: 'ACTIVE', description: 'Khu B dành cho nữ sinh viên', createdAt: '2026-01-15T08:00:00Z', updatedAt: null },
  { id: 'bld-003', name: 'KTX C', totalFloors: 4, genderType: 'MIXED', status: 'ACTIVE', description: 'Khu C hỗn hợp, tầng 1-2 nam, 3-4 nữ', createdAt: '2026-02-01T08:00:00Z', updatedAt: null },
  { id: 'bld-004', name: 'KTX D', totalFloors: 3, genderType: 'MALE', status: 'UNDER_MAINTENANCE', description: 'Khu D đang sửa chữa nâng cấp', createdAt: '2026-03-10T08:00:00Z', updatedAt: '2026-05-01T08:00:00Z' },
]

// ── Room Types ──
const initialRoomTypes = [
  { id: 'rt-001', typeName: 'Phòng 4 người', capacity: 4, basePrice: 1800000, description: 'Phòng cao cấp 4 người, có điều hòa, WC riêng', amenities: ['Điều hòa', 'WC riêng', 'Tủ cá nhân', 'Bàn học'], createdAt: '2026-01-15T08:00:00Z', updatedAt: null },
  { id: 'rt-002', typeName: 'Phòng 6 người', capacity: 6, basePrice: 1200000, description: 'Phòng tiêu chuẩn 6 người', amenities: ['Quạt trần', 'WC chung tầng', 'Tủ cá nhân', 'Bàn học'], createdAt: '2026-01-15T08:00:00Z', updatedAt: null },
  { id: 'rt-003', typeName: 'Phòng 8 người', capacity: 8, basePrice: 800000, description: 'Phòng phổ thông 8 người', amenities: ['Quạt trần', 'WC chung tầng', 'Tủ cá nhân'], createdAt: '2026-01-15T08:00:00Z', updatedAt: null },
]

const buildings = getStored('buildings', initialBuildings)
const roomTypes = getStored('roomTypes', initialRoomTypes)

const rooms: any[] = getStored('rooms', [])
const beds: any[] = getStored('beds', [])
const equipments: any[] = getStored('equipments', [])

if (rooms.length === 0) {
  const initialRooms: any[] = []
  const initialBeds: any[] = []
  const initialEquipments: any[] = []
  let roomIdx = 1
  const statuses = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'FULL', 'UNDER_MAINTENANCE', 'INACTIVE']

  for (const bld of buildings) {
    for (let floor = 1; floor <= Math.min(bld.totalFloors, 3); floor++) {
      for (let r = 1; r <= 3; r++) {
        const rt = roomTypes[r - 1] || roomTypes[0]
        const roomId = `room-${String(roomIdx).padStart(3, '0')}`
        const roomNumber = `${bld.name.slice(-1)}${floor}${String(r).padStart(2, '0')}`
        const status = statuses[roomIdx % statuses.length]
        const currentOccupancy = status === 'FULL' ? rt.capacity : status === 'AVAILABLE' ? Math.floor(Math.random() * rt.capacity) : 0

        initialRooms.push({
          id: roomId, buildingId: bld.id, roomNumber, floorNumber: floor,
          currentOccupancy, status, maintenanceReason: status === 'UNDER_MAINTENANCE' ? 'Sửa chữa điện' : null,
          roomType: { ...rt }, beds: [], equipments: [],
          createdAt: '2026-01-20T08:00:00Z', updatedAt: null,
        })

        // Create beds
        for (let b = 1; b <= rt.capacity; b++) {
          const bedId = `bed-${roomId}-${String(b).padStart(2, '0')}`
          const bedStatus = b <= currentOccupancy ? 'OCCUPIED' : 'AVAILABLE'
          const bed = { id: bedId, roomId, bedNumber: `${roomNumber}-${String(b).padStart(2, '0')}`, status: bedStatus, createdAt: '2026-01-20T08:00:00Z', updatedAt: null }
          initialBeds.push(bed)
          initialRooms[initialRooms.length - 1].beds.push(bed)
        }

        // Create equipment
        const eqNames = ['Máy lạnh', 'Quạt trần', 'Tủ đựng đồ', 'Bóng đèn']
        for (let e = 0; e < Math.min(eqNames.length, 3); e++) {
          const eqId = `eq-${roomId}-${e + 1}`
          const eq = { id: eqId, roomId, equipmentName: eqNames[e], equipmentIndex: e + 1, status: 'ACTIVE', createdAt: '2026-01-20T08:00:00Z', updatedAt: null }
          initialEquipments.push(eq)
          initialRooms[initialRooms.length - 1].equipments.push(eq)
        }

        roomIdx++
      }
    }
  }

  rooms.push(...initialRooms)
  beds.push(...initialBeds)
  equipments.push(...initialEquipments)

  saveStored('buildings', buildings)
  saveStored('roomTypes', roomTypes)
  saveStored('rooms', rooms)
  saveStored('beds', beds)
  saveStored('equipments', equipments)
}

// ── Building endpoints ──
mock.onGet('/api/buildings').reply(200, buildings)
mock.onGet(/\/api\/buildings\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const b = buildings.find(x => x.id === id)
  return b ? [200, b] : [404, { title: 'Không tìm thấy', status: 404 }]
})
mock.onPost('/api/buildings').reply((c) => {
  const body = JSON.parse(c.data)
  const item = { id: 'bld-' + Date.now(), ...body, status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: null }
  buildings.push(item)
  saveStored('buildings', buildings)
  return [201, item]
})
mock.onPut(/\/api\/buildings\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = buildings.findIndex(x => x.id === id)
  if (idx < 0) return [404]
  const body = JSON.parse(c.data)
  buildings[idx] = { ...buildings[idx], ...body, updatedAt: new Date().toISOString() }
  saveStored('buildings', buildings)
  return [200, buildings[idx]]
})
mock.onDelete(/\/api\/buildings\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = buildings.findIndex(x => x.id === id)
  if (idx >= 0) {
    buildings.splice(idx, 1)
    saveStored('buildings', buildings)
  }
  return [204]
})

// ── Room Type endpoints ──
mock.onGet('/api/roomtypes').reply(200, roomTypes)
mock.onGet(/\/api\/roomtypes\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const rt = roomTypes.find(x => x.id === id)
  return rt ? [200, rt] : [404]
})
mock.onPost('/api/roomtypes').reply((c) => {
  const body = JSON.parse(c.data)
  const item = { id: 'rt-' + Date.now(), ...body, createdAt: new Date().toISOString(), updatedAt: null }
  roomTypes.push(item)
  saveStored('roomTypes', roomTypes)
  return [201, item]
})
mock.onPut(/\/api\/roomtypes\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = roomTypes.findIndex(x => x.id === id)
  if (idx < 0) return [404]
  roomTypes[idx] = { ...roomTypes[idx], ...JSON.parse(c.data), updatedAt: new Date().toISOString() }
  saveStored('roomTypes', roomTypes)
  return [200, roomTypes[idx]]
})
mock.onDelete(/\/api\/roomtypes\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = roomTypes.findIndex(x => x.id === id)
  if (idx >= 0) {
    roomTypes.splice(idx, 1)
    saveStored('roomTypes', roomTypes)
  }
  return [204]
})

// ── Room endpoints ──
mock.onGet('/api/rooms').reply((c) => {
  let filtered = [...rooms]
  const p = c.params || {}
  if (p.buildingId) filtered = filtered.filter(r => r.buildingId === p.buildingId)
  if (p.floor) filtered = filtered.filter(r => r.floorNumber === parseInt(p.floor))
  if (p.status) filtered = filtered.filter(r => r.status === p.status)
  return [200, filtered]
})
mock.onGet('/api/rooms/floormap').reply((c) => {
  let filtered = [...rooms]
  const p = c.params || {}
  if (p.buildingId) filtered = filtered.filter(r => r.buildingId === p.buildingId)
  if (p.floor) filtered = filtered.filter(r => r.floorNumber === parseInt(p.floor))
  return [200, filtered]
})
mock.onGet(/\/api\/rooms\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const r = rooms.find(x => x.id === id)
  return r ? [200, r] : [404]
})
mock.onPost('/api/rooms').reply((c) => {
  const body = JSON.parse(c.data)
  const rt = roomTypes.find(x => x.id === body.roomTypeId)
  const item = { id: 'room-' + Date.now(), ...body, currentOccupancy: 0, status: 'AVAILABLE', maintenanceReason: null, roomType: rt || roomTypes[0], beds: [], equipments: [], createdAt: new Date().toISOString(), updatedAt: null }
  rooms.push(item)
  saveStored('rooms', rooms)
  return [201, item]
})
mock.onPut(/\/api\/rooms\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = rooms.findIndex(x => x.id === id)
  if (idx < 0) return [404]
  rooms[idx] = { ...rooms[idx], ...JSON.parse(c.data), updatedAt: new Date().toISOString() }
  saveStored('rooms', rooms)
  return [200, rooms[idx]]
})
mock.onPatch(/\/api\/rooms\/[^/]+\/status/).reply((c) => {
  const id = c.url!.split('/')[3]
  const idx = rooms.findIndex(x => x.id === id)
  if (idx < 0) return [404]
  const body = JSON.parse(c.data)
  rooms[idx].status = body.status
  rooms[idx].maintenanceReason = body.maintenanceReason || null
  saveStored('rooms', rooms)
  return [204]
})
mock.onDelete(/\/api\/rooms\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = rooms.findIndex(x => x.id === id)
  if (idx >= 0) {
    rooms.splice(idx, 1)
    saveStored('rooms', rooms)
  }
  return [204]
})

// ── Bed endpoints ──
mock.onGet('/api/beds').reply((c) => {
  const p = c.params || {}
  let filtered = [...beds]
  if (p.roomId) filtered = filtered.filter(b => b.roomId === p.roomId)
  
  try {
    const contractsStore = localStorage.getItem('ktx_mock_contracts')
    if (contractsStore) {
      const allContracts = JSON.parse(contractsStore)
      filtered = filtered.map(b => {
        const activeCt = allContracts.find((ct: any) => ct.roomId === b.roomId && ct.bedId === b.id && ct.status === 'ACTIVE')
        if (activeCt) {
          return {
            ...b,
            studentId: activeCt.studentId,
            studentName: activeCt.studentName,
            studentCode: activeCt.studentCode
          }
        }
        return b
      })
    }
  } catch (e) {
    console.error('Error populating student details for beds:', e)
  }
  
  return [200, filtered]
})
mock.onGet(/\/api\/beds\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const b = beds.find(x => x.id === id)
  return b ? [200, b] : [404]
})
mock.onPost('/api/beds').reply((c) => {
  const body = JSON.parse(c.data)
  const item = { id: 'bed-' + Date.now(), ...body, status: 'AVAILABLE', createdAt: new Date().toISOString(), updatedAt: null }
  beds.push(item)
  const room = rooms.find(r => r.id === item.roomId)
  if (room) {
    if (!room.beds) room.beds = []
    room.beds.push(item)
  }
  saveStored('beds', beds)
  saveStored('rooms', rooms)
  return [201, item]
})
mock.onPut(/\/api\/beds\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = beds.findIndex(x => x.id === id)
  if (idx < 0) return [404]
  beds[idx] = { ...beds[idx], ...JSON.parse(c.data), updatedAt: new Date().toISOString() }
  const room = rooms.find(r => r.id === beds[idx].roomId)
  if (room && room.beds) {
    const bIdx = room.beds.findIndex((b: any) => b.id === id)
    if (bIdx >= 0) room.beds[bIdx] = beds[idx]
  }
  saveStored('beds', beds)
  saveStored('rooms', rooms)
  return [200, beds[idx]]
})
mock.onDelete(/\/api\/beds\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = beds.findIndex(x => x.id === id)
  if (idx >= 0) {
    const bed = beds[idx]
    beds.splice(idx, 1)
    const room = rooms.find(r => r.id === bed.roomId)
    if (room && room.beds) {
      const bIdx = room.beds.findIndex((b: any) => b.id === id)
      if (bIdx >= 0) room.beds.splice(bIdx, 1)
    }
    saveStored('beds', beds)
    saveStored('rooms', rooms)
  }
  return [204]
})

// ── Equipment endpoints ──
mock.onGet('/api/equipments').reply((c) => {
  const p = c.params || {}
  let filtered = [...equipments]
  if (p.roomId) filtered = filtered.filter(e => e.roomId === p.roomId)
  return [200, filtered]
})
mock.onGet(/\/api\/equipments\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const eq = equipments.find(x => x.id === id)
  return eq ? [200, eq] : [404]
})
mock.onPost('/api/equipments').reply((c) => {
  const body = JSON.parse(c.data)
  const item = { id: 'eq-' + Date.now(), ...body, equipmentIndex: 1, status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: null }
  equipments.push(item)
  const room = rooms.find(r => r.id === item.roomId)
  if (room) {
    if (!room.equipments) room.equipments = []
    room.equipments.push(item)
  }
  saveStored('equipments', equipments)
  saveStored('rooms', rooms)
  return [201, item]
})
mock.onPatch(/\/api\/equipments\/[^/]+\/status/).reply((c) => {
  const id = c.url!.split('/')[3]
  const idx = equipments.findIndex(x => x.id === id)
  if (idx < 0) return [404]
  equipments[idx].status = JSON.parse(c.data).status
  const room = rooms.find(r => r.id === equipments[idx].roomId)
  if (room && room.equipments) {
    const eq = room.equipments.find((e: any) => e.id === id)
    if (eq) eq.status = equipments[idx].status
  }
  saveStored('equipments', equipments)
  saveStored('rooms', rooms)
  return [204]
})
mock.onDelete(/\/api\/equipments\/[^/]+$/).reply((c) => {
  const id = c.url!.split('/').pop()
  const idx = equipments.findIndex(x => x.id === id)
  if (idx >= 0) {
    const eq = equipments[idx]
    equipments.splice(idx, 1)
    const room = rooms.find(r => r.id === eq.roomId)
    if (room && room.equipments) {
      const eIdx = room.equipments.findIndex((e: any) => e.id === id)
      if (eIdx >= 0) room.equipments.splice(eIdx, 1)
    }
    saveStored('equipments', equipments)
    saveStored('rooms', rooms)
  }
  return [204]
})

export { buildings, roomTypes, rooms, beds, equipments }
export default mock
