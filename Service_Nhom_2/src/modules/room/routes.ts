import type { RouteRecordRaw } from 'vue-router'

export const roomRoutes: RouteRecordRaw[] = [
  { path: '/room', redirect: '/room/buildings' },
  {
    path: '/room/buildings',
    component: () => import('./views/admin/BuildingListView.vue'),
    meta: { title: 'Tòa nhà', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/room/buildings/:id',
    component: () => import('./views/admin/BuildingDetailView.vue'),
    meta: { title: 'Chi tiết tòa nhà', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/room/room-types',
    component: () => import('./views/admin/RoomTypeListView.vue'),
    meta: { title: 'Loại phòng', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/room/rooms',
    component: () => import('./views/admin/RoomListView.vue'),
    meta: { title: 'Quản lý phòng', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/room/rooms/:id',
    component: () => import('./views/admin/RoomDetailView.vue'),
    meta: { title: 'Chi tiết phòng', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/room/floor-map',
    component: () => import('./views/admin/FloorMapView.vue'),
    meta: { title: 'Sơ đồ tầng', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/room/equipment',
    component: () => import('./views/admin/EquipmentView.vue'),
    meta: { title: 'Thiết bị', roles: ['ADMIN', 'MANAGER'] },
  },
  // Student
  {
    path: '/room/browse',
    component: () => import('./views/student/RoomBrowseView.vue'),
    meta: { title: 'Xem phòng trống', roles: ['STUDENT'] },
  },
]
