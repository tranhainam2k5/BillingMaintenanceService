import type { RouteRecordRaw } from 'vue-router'

export const contractRoutes: RouteRecordRaw[] = [
  {
    path: '/contract/students',
    component: () => import('./views/admin/StudentListView.vue'),
    meta: { title: 'Sinh viên', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/contract/students/:id',
    component: () => import('./views/admin/StudentDetailView.vue'),
    meta: { title: 'Chi tiết sinh viên', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/contract/applications',
    component: () => import('./views/admin/ApplicationListView.vue'),
    meta: { title: 'Đơn đăng ký', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/contract/applications/:id/approve',
    component: () => import('./views/admin/ApplicationApproveView.vue'),
    meta: { title: 'Duyệt đơn đăng ký', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/contract/contracts',
    component: () => import('./views/admin/ContractListView.vue'),
    meta: { title: 'Hợp đồng', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/contract/contracts/:id',
    component: () => import('./views/admin/ContractDetailView.vue'),
    meta: { title: 'Chi tiết hợp đồng', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/contract/occupancies',
    component: () => import('./views/admin/OccupancyListView.vue'),
    meta: { title: 'Lưu trú', roles: ['ADMIN', 'MANAGER'] },
  },
  // Student
  {
    path: '/contract/my-profile',
    component: () => import('./views/student/MyProfileView.vue'),
    meta: { title: 'Hồ sơ của tôi', roles: ['STUDENT'] },
  },
  {
    path: '/contract/my-application',
    component: () => import('./views/student/RoomApplicationView.vue'),
    meta: { title: 'Đăng ký phòng', roles: ['STUDENT'] },
  },
  {
    path: '/contract/my-application/status',
    component: () => import('./views/student/ApplicationStatusView.vue'),
    meta: { title: 'Theo dõi đơn', roles: ['STUDENT'] },
  },
  {
    path: '/contract/my-contract',
    component: () => import('./views/student/MyContractView.vue'),
    meta: { title: 'Hợp đồng của tôi', roles: ['STUDENT'] },
  },
]
