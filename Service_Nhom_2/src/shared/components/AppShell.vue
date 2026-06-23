<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      :permanent="lgAndUp"
      :temporary="!lgAndUp"
      width="260"
      color="primary-darken-1"
      dark
    >
      <!-- Logo -->
      <div class="pa-4 d-flex align-center" style="min-height: 64px;">
        <v-icon size="32" color="white" class="mr-3">mdi-domain</v-icon>
        <div v-if="!rail">
          <div class="text-white text-subtitle-2 font-weight-bold">KTX</div>
          <div class="text-caption" style="color: rgba(255,255,255,0.7);">Quản lý Ký túc xá</div>
        </div>
      </div>

      <v-divider class="mb-2" style="border-color: rgba(255,255,255,0.15);" />

      <!-- User Info -->
      <div v-if="!rail" class="px-4 pb-3">
        <div class="d-flex align-center">
          <v-avatar color="secondary" size="40" class="mr-3">
            <span class="text-white text-body-2">{{ userInitials }}</span>
          </v-avatar>
          <div>
            <div class="text-white text-body-2 font-weight-medium">{{ auth.user?.name }}</div>
            <v-chip size="x-small" :color="roleChipColor" variant="flat">
              {{ roleLabel }}
            </v-chip>
          </div>
        </div>
      </div>

      <v-divider class="mb-2" style="border-color: rgba(255,255,255,0.15);" />

      <!-- Menu Items -->
      <v-list density="compact" nav class="px-2">
        <template v-for="section in menuSections" :key="section.title">
          <v-list-subheader v-if="!rail" style="color: rgba(255,255,255,0.5);" class="text-uppercase">
            {{ section.title }}
          </v-list-subheader>
          <v-list-item
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            :prepend-icon="item.icon"
            :title="item.label"
            rounded="lg"
            color="white"
            class="mb-1"
            style="color: rgba(255,255,255,0.85);"
          />
        </template>
      </v-list>

      <template #append>
        <div class="pa-2">
          <v-btn
            block
            variant="text"
            color="white"
            prepend-icon="mdi-logout"
            :text="rail ? '' : 'Đăng xuất'"
            @click="handleLogout"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top Bar -->
    <v-app-bar color="primary" density="default" elevation="0">

      <v-app-bar-title class="text-body-1 font-weight-medium">
        {{ currentTitle }}
      </v-app-bar-title>
      <v-spacer />
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props" aria-label="User menu">
            <v-avatar color="secondary" size="32">
              <span class="text-white text-caption">{{ userInitials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list density="compact" min-width="180">
          <v-list-item prepend-icon="mdi-account" title="Hồ sơ" to="/contract/my-profile" />
          <v-list-item prepend-icon="mdi-lock-reset" title="Đổi mật khẩu" @click="showChangePassword = true" />
          <v-divider />
          <v-list-item prepend-icon="mdi-logout" title="Đăng xuất" @click="handleLogout" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Breadcrumb -->
    <v-main>
      <v-container fluid class="pa-4 pa-md-6" style="max-width: 1400px;">
        <v-breadcrumbs
          v-if="breadcrumbs.length > 1"
          :items="breadcrumbs"
          density="compact"
          class="px-0 pt-0 pb-2 text-caption"
        />
        <router-view />
      </v-container>
    </v-main>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="notifyState.show"
      :color="notifyState.color"
      :timeout="notifyState.timeout"
      location="top right"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ notifyState.icon }}</v-icon>
        {{ notifyState.message }}
      </div>
      <template #actions>
        <v-btn variant="text" @click="notifyState.show = false" aria-label="Đóng">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Change Password Dialog -->
    <v-dialog v-model="showChangePassword" max-width="440" persistent>
      <v-card style="position: relative;">
        <v-btn
          icon="mdi-close"
          variant="text"
          color="grey-darken-1"
          class="position-absolute top-0 right-0 ma-2"
          style="z-index: 10;"
          @click="closeChangePassword"
          aria-label="Đóng"
        />
        <v-card-title class="pt-5 px-6"><v-icon color="primary" class="mr-2">mdi-lock-reset</v-icon>Đổi mật khẩu</v-card-title>
        <v-card-text class="px-6">
          <v-form ref="passwordForm" v-model="isPasswordFormValid">
            <v-text-field
              v-model="oldPassword"
              label="Mật khẩu hiện tại *"
              type="password"
              variant="outlined"
              :rules="[v => !!v || 'Vui lòng nhập mật khẩu hiện tại']"
              class="mb-2"
            />
            <v-text-field
              v-model="newPassword"
              label="Mật khẩu mới *"
              type="password"
              variant="outlined"
              :rules="[
                v => !!v || 'Vui lòng nhập mật khẩu mới',
                v => v.length >= 4 || 'Mật khẩu phải từ 4 ký tự trở lên'
              ]"
              class="mb-2"
            />
            <v-text-field
              v-model="confirmPassword"
              label="Xác nhận mật khẩu mới *"
              type="password"
              variant="outlined"
              :rules="confirmPasswordRules"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeChangePassword">Hủy</v-btn>
          <v-btn color="primary" variant="flat" :loading="loadingChangePassword" :disabled="!isPasswordFormValid" @click="submitChangePassword">Đổi mật khẩu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/shared/stores/authStore'
import { useNotify } from '@/shared/composables/useNotify'
import { http } from '@/shared/http'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { lgAndUp } = useDisplay()
const { state: notifyState, success: successNotify, error: errorNotify } = useNotify()

const drawer = ref(true)
const rail = ref(false)

// Change password state
const passwordForm = ref<any>(null)
const showChangePassword = ref(false)
const isPasswordFormValid = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loadingChangePassword = ref(false)

const confirmPasswordRules = computed(() => [
  (v: string) => !!v || 'Vui lòng xác nhận mật khẩu mới',
  (v: string) => v === newPassword.value || 'Mật khẩu xác nhận không khớp'
])

const userInitials = computed(() => {
  const name = auth.user?.name || ''
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})

const currentTitle = computed(() => {
  return (route.meta?.title as string) || 'Dashboard'
})

const breadcrumbs = computed(() => {
  const crumbs: Array<{ title: string; to?: string; disabled?: boolean }> = []
  for (const matched of route.matched) {
    if (matched.meta?.title) {
      crumbs.push({
        title: matched.meta.title as string,
        to: matched.path,
        disabled: false,
      })
    }
  }
  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1].disabled = true
  }
  return crumbs
})

interface MenuItem { icon: string; label: string; path: string }
interface MenuSection { title: string; items: MenuItem[] }

const adminMenu: MenuSection[] = [
  {
    title: 'Billing & Maintenance',
    items: [
      { icon: 'mdi-view-dashboard', label: 'Dashboard', path: '/dashboard' },
      { icon: 'mdi-cash-multiple', label: 'Phiếu thu', path: '/billing/invoices' },
      { icon: 'mdi-wrench', label: 'Sự cố / Bảo trì', path: '/billing/maintenance' },
      { icon: 'mdi-shield-account', label: 'Quản lý Admin', path: '/billing/admins' },
    ],
  },
  {
    title: 'Room & Building',
    items: [
      { icon: 'mdi-office-building', label: 'Tòa nhà', path: '/room/buildings' },
      { icon: 'mdi-bed', label: 'Loại phòng', path: '/room/room-types' },
      { icon: 'mdi-door', label: 'Quản lý phòng', path: '/room/rooms' },

    ],
  },
  {
    title: 'Contract & Student',
    items: [
      { icon: 'mdi-account-group', label: 'Sinh viên', path: '/contract/students' },
      { icon: 'mdi-clipboard-text', label: 'Đơn đăng ký', path: '/contract/applications' },
      { icon: 'mdi-file-document', label: 'Hợp đồng', path: '/contract/contracts' },
      { icon: 'mdi-home-account', label: 'Lưu trú', path: '/contract/occupancies' },
    ],
  },
]

const managerMenu: MenuSection[] = [
  {
    title: 'Billing & Maintenance',
    items: [
      { icon: 'mdi-view-dashboard', label: 'Dashboard', path: '/dashboard' },
      { icon: 'mdi-cash-multiple', label: 'Phiếu thu', path: '/billing/invoices' },
      { icon: 'mdi-wrench', label: 'Sự cố / Bảo trì', path: '/billing/maintenance' },
    ],
  },
  {
    title: 'Room & Building',
    items: [
      { icon: 'mdi-office-building', label: 'Tòa nhà', path: '/room/buildings' },
      { icon: 'mdi-bed', label: 'Loại phòng', path: '/room/room-types' },
      { icon: 'mdi-door', label: 'Quản lý phòng', path: '/room/rooms' },

    ],
  },
  {
    title: 'Contract & Student',
    items: [
      { icon: 'mdi-account-group', label: 'Sinh viên', path: '/contract/students' },
      { icon: 'mdi-clipboard-text', label: 'Đơn đăng ký', path: '/contract/applications' },
      { icon: 'mdi-file-document', label: 'Hợp đồng', path: '/contract/contracts' },
      { icon: 'mdi-home-account', label: 'Lưu trú', path: '/contract/occupancies' },
    ],
  },
]

const studentMenu: MenuSection[] = [
  {
    title: 'Phòng',
    items: [
      { icon: 'mdi-floor-plan', label: 'Xem phòng trống', path: '/room/browse' },
    ],
  },
  {
    title: 'Hợp đồng',
    items: [
      { icon: 'mdi-account', label: 'Hồ sơ của tôi', path: '/contract/my-profile' },
      { icon: 'mdi-clipboard-text', label: 'Đăng ký phòng', path: '/contract/my-application' },
      { icon: 'mdi-file-document', label: 'Hợp đồng', path: '/contract/my-contract' },
    ],
  },
  {
    title: 'Thanh toán',
    items: [
      { icon: 'mdi-cash-multiple', label: 'Phiếu thu', path: '/billing/my-invoices' },
      { icon: 'mdi-wrench', label: 'Yêu cầu sửa chữa', path: '/billing/my-maintenance' },
    ],
  },
]

const menuSections = computed(() => {
  if (auth.isAdmin) return adminMenu
  if (auth.isManager) return managerMenu
  return studentMenu
})

const roleLabel = computed(() => {
  if (auth.isAdmin) return 'Quản trị viên'
  if (auth.isManager) return 'Quản lý'
  return 'Sinh viên'
})

const roleChipColor = computed(() => {
  if (auth.isAdmin) return 'deep-purple'
  if (auth.isManager) return 'amber'
  return 'teal'
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function closeChangePassword() {
  showChangePassword.value = false
  passwordForm.value?.resetValidation()
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

async function submitChangePassword() {
  if (!isPasswordFormValid.value) return
  loadingChangePassword.value = true
  try {
    await http.post('/api/auth/change-password', {
      userId: auth.user?.id,
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    successNotify('Đổi mật khẩu thành công!')
    closeChangePassword()
  } catch (e: any) {
    const msg = e.response?.data?.title || 'Mật khẩu cũ không chính xác'
    errorNotify(msg)
  } finally {
    loadingChangePassword.value = false
  }
}
</script>
