import type { RouteRecordRaw } from 'vue-router'

export const billingRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: () => import('./views/admin/DashboardView.vue'),
    meta: { title: 'Dashboard', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/billing/invoices',
    component: () => import('./views/admin/InvoiceListView.vue'),
    meta: { title: 'Phiếu thu', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/billing/invoices/:id',
    component: () => import('./views/admin/InvoiceDetailView.vue'),
    meta: { title: 'Chi tiết phiếu thu', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/billing/maintenance',
    component: () => import('./views/admin/MaintenanceListView.vue'),
    meta: { title: 'Sự cố / Bảo trì', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/billing/maintenance/:id',
    component: () => import('./views/admin/MaintenanceDetailView.vue'),
    meta: { title: 'Chi tiết sự cố', roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/billing/admins',
    component: () => import('./views/admin/AdminManagementView.vue'),
    meta: { title: 'Quản lý Admin', roles: ['ADMIN'] },
  },
  // Student routes
  {
    path: '/billing/my-invoices',
    component: () => import('./views/student/MyInvoicesView.vue'),
    meta: { title: 'Phiếu thu của tôi', roles: ['STUDENT'] },
  },
  {
    path: '/billing/my-maintenance',
    component: () => import('./views/student/MyMaintenanceView.vue'),
    meta: { title: 'Yêu cầu sửa chữa', roles: ['STUDENT'] },
  },
  {
    path: '/billing/submit-maintenance',
    component: () => import('./views/student/SubmitMaintenanceView.vue'),
    meta: { title: 'Báo cáo sự cố', roles: ['STUDENT'] },
  },
]
