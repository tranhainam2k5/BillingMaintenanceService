<template>
  <v-app>
    <div class="login-wrapper">
      <!-- Background Image Layer -->
      <div class="bg-image" :style="{ backgroundImage: `url(${dnuGate})` }"></div>
      <!-- Dark Overlay Layer with blur -->
      <div class="bg-overlay"></div>

      <!-- Main Content Container -->
      <v-container fluid class="fill-height pa-4 position-relative z-index-3">
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4" class="d-flex align-center justify-center">
            <v-card class="login-card" :max-width="isRegister ? 480 : 420" width="100%" elevation="12">
              <!-- Close Button in Top Right of the Card -->
              <v-btn
                icon="mdi-close"
                variant="text"
                color="grey-darken-1"
                class="position-absolute top-0 right-0 ma-2"
                style="z-index: 10;"
                @click="goBackHome"
                aria-label="Đóng"
              />
              
              <div class="text-center mb-6">
                <!-- Logo & Title -->
                <v-avatar size="56" color="primary" class="mb-4" elevation="3">
                  <v-icon size="32" color="white">mdi-school</v-icon>
                </v-avatar>
                <h2 class="text-h5 font-weight-black text-slate-800">
                  {{ isRegister ? 'ĐĂNG KÝ TÀI KHOẢN' : 'ĐĂNG NHẬP HỆ THỐNG' }}
                </h2>
                <p class="text-caption text-indigo-darken-4 font-weight-black uppercase letter-spacing-1 mt-1">Ký túc xá Đại học Đại Nam</p>
              </div>

              <!-- LOGIN FORM -->
              <v-form v-if="!isRegister" @submit.prevent="handleLogin" ref="formRef">
                <v-text-field
                  v-model="username"
                  label="Tên đăng nhập / Mã SV"
                  placeholder="Nhập tài khoản"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  class="mb-3"
                  :rules="[v => !!v || 'Vui lòng nhập tên đăng nhập']"
                  required
                />
                
                <v-text-field
                  v-model="password"
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  prepend-inner-icon="mdi-lock"
                  :type="showPass ? 'text' : 'password'"
                  :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPass = !showPass"
                  variant="outlined"
                  class="mb-4"
                  :rules="[v => !!v || 'Vui lòng nhập mật khẩu']"
                  required
                />

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  class="login-btn py-3 font-weight-bold"
                  elevation="2"
                >
                  Xác nhận đăng nhập
                  <v-icon right class="ml-2">mdi-login</v-icon>
                </v-btn>

                <div class="text-center mt-6">
                  <span class="text-body-2 text-grey-darken-1">Chưa có tài khoản? </span>
                  <a href="#" @click.prevent="isRegister = true" class="text-body-2 font-weight-bold text-primary text-decoration-none">
                    Đăng ký ngay
                  </a>
                </div>
              </v-form>

              <!-- REGISTER FORM -->
              <v-form v-else @submit.prevent="handleRegister" ref="regFormRef">
                <v-text-field
                  v-model="regName"
                  label="Họ và tên"
                  placeholder="Nhập đầy đủ họ và tên"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  class="mb-2"
                  :rules="[v => !!v || 'Vui lòng nhập họ và tên']"
                  required
                />

                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="regStudentCode"
                      label="Mã sinh viên"
                      placeholder="Mã SV (nếu có)"
                      prepend-inner-icon="mdi-card-account-details"
                      variant="outlined"
                      class="mb-2"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="regPhone"
                      label="Số điện thoại"
                      placeholder="Số điện thoại"
                      prepend-inner-icon="mdi-phone"
                      variant="outlined"
                      class="mb-2"
                      :rules="[v => !!v || 'Vui lòng nhập số điện thoại']"
                      required
                    />
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="regUsername"
                  label="Tên đăng nhập mới"
                  placeholder="Nhập tên đăng nhập"
                  prepend-inner-icon="mdi-account-circle"
                  variant="outlined"
                  class="mb-2"
                  :rules="[v => !!v || 'Vui lòng nhập tên đăng nhập']"
                  required
                />

                <v-text-field
                  v-model="regPassword"
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  prepend-inner-icon="mdi-lock"
                  :type="regShowPass ? 'text' : 'password'"
                  :append-inner-icon="regShowPass ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="regShowPass = !regShowPass"
                  variant="outlined"
                  class="mb-2"
                  :rules="[v => !!v || 'Vui lòng nhập mật khẩu']"
                  required
                />

                <v-text-field
                  v-model="regConfirmPassword"
                  label="Xác nhận mật khẩu"
                  placeholder="Nhập lại mật khẩu"
                  prepend-inner-icon="mdi-lock-check"
                  :type="regShowConfirmPass ? 'text' : 'password'"
                  :append-inner-icon="regShowConfirmPass ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="regShowConfirmPass = !regShowConfirmPass"
                  variant="outlined"
                  class="mb-4"
                  :rules="[
                    v => !!v || 'Vui lòng nhập lại mật khẩu',
                    v => v === regPassword || 'Mật khẩu xác nhận không khớp'
                  ]"
                  required
                />

                <v-btn
                  type="submit"
                  color="teal"
                  size="large"
                  block
                  :loading="loading"
                  class="login-btn py-3 font-weight-bold text-white"
                  elevation="2"
                >
                  Xác nhận đăng ký
                  <v-icon right class="ml-2">mdi-account-plus</v-icon>
                </v-btn>

                <div class="text-center mt-6">
                  <span class="text-body-2 text-grey-darken-1">Đã có tài khoản? </span>
                  <a href="#" @click.prevent="isRegister = false" class="text-body-2 font-weight-bold text-teal text-decoration-none">
                    Đăng nhập ngay
                  </a>
                </div>
              </v-form>

              <!-- Alert on error -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                density="comfortable"
                class="mt-4"
                closable
                @click:close="error=''"
              >
                {{ error }}
              </v-alert>

              <!-- Alert on success -->
              <v-alert
                v-if="successMsg"
                type="success"
                variant="tonal"
                density="comfortable"
                class="mt-4"
                closable
                @click:close="successMsg=''"
              >
                {{ successMsg }}
              </v-alert>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/authStore'
import { http } from '@/shared/http'
import dnuGate from '@/assets/dnu-gate.png'

const router = useRouter()
const auth = useAuthStore()

// Login States
const username = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

// Register States
const isRegister = ref(false)
const regName = ref('')
const regStudentCode = ref('')
const regPhone = ref('')
const regUsername = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')
const regShowPass = ref(false)
const regShowConfirmPass = ref(false)
const successMsg = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  successMsg.value = ''
  try {
    // TẠO BYPASS LOGIN VÌ BILLING API SERVER ĐÃ CHẾT (OFFLINE)
    if (username.value === 'admin' && password.value === 'admin') {
      auth.setAuth('mock-jwt-token-admin', {
        id: '1',
        username: 'admin',
        fullName: 'Quản trị viên (Bypass)',
        role: 'ADMIN',
        email: 'admin@local.com',
      } as any)
      router.push('/dashboard')
      return
    }

    if (username.value === 'sv' && password.value === 'sv') {
      auth.setAuth('mock-jwt-token-sv', {
        id: '2',
        studentId: 'st-006', // ID mock của Vũ Thị Mai (không có hợp đồng)
        username: 'sv',
        fullName: 'Sinh viên (Bypass)',
        role: 'STUDENT',
        email: 'sv@local.com',
      } as any)
      router.push('/room/browse')
      return
    }

    // Kiểm tra các tài khoản đã được đăng ký tạm thời vào LocalStorage
    const existingUsers = JSON.parse(localStorage.getItem('mock_users') || '[]')
    const foundUser = existingUsers.find((u: any) => u.username === username.value && u.password === password.value)
    
    if (foundUser) {
      auth.setAuth('mock-jwt-token-custom', {
        id: foundUser.id,
        studentId: foundUser.studentCode || foundUser.id, // Use actual registered code
        username: foundUser.username,
        fullName: foundUser.fullName,
        role: foundUser.role,
        studentCode: foundUser.studentCode,
        email: foundUser.email,
        phone: foundUser.phone,
      } as any)
      router.push('/room/browse')
      return
    }

    // Luồng gọi API thực tế (sẽ báo 404 nếu server chết)
    const { data } = await http.post('/api/auth/login', { username: username.value, password: password.value })
    auth.setAuth(data.token, data.user)
    
    // MANAGER và ADMIN về dashboard, STUDENT về trang phòng
    if (auth.isStudent) {
      router.push('/room/browse')
    } else {
      router.push('/dashboard')
    }
  } catch (e: any) {
    error.value = e.response?.data?.title || e.response?.data?.message || 'Đăng nhập thất bại (Server Offline)'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  error.value = ''
  successMsg.value = ''
  try {
    // BYPASS ĐĂNG KÝ VÌ SERVER ĐÃ CHẾT
    // Lưu tài khoản giả lập vào LocalStorage để có thể đăng nhập được ngay
    const mockUser = {
      id: 'mock-' + Date.now(),
      username: regUsername.value,
      password: regPassword.value, // Không an toàn thực tế, nhưng dùng để bypass test
      fullName: regName.value || 'Sinh viên mới',
      role: 'STUDENT',
      email: regStudentCode.value + '@local.com',
      studentCode: regStudentCode.value,
      phone: regPhone.value
    }
    
    // Đọc danh sách user đã mock hoặc tạo mới
    const existingUsers = JSON.parse(localStorage.getItem('mock_users') || '[]')
    existingUsers.push(mockUser)
    localStorage.setItem('mock_users', JSON.stringify(existingUsers))

    successMsg.value = 'Đăng ký thành công (Lưu nội bộ tạm thời do Server offline). Vui lòng qua tab Đăng nhập!'
    
    // Reset form
    regName.value = ''
    regStudentCode.value = ''
    regPhone.value = ''
    regUsername.value = ''
    regPassword.value = ''
    regConfirmPassword.value = ''
    
    // Switch to login view
    isRegister.value = false
  } catch (e: any) {
    error.value = e.response?.data?.title || 'Đăng ký thất bại'
  } finally {
    loading.value = false
  }
}

function goBackHome() {
  router.push('/')
}
</script>

<style scoped>
.login-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(26, 35, 126, 0.7) 100%);
  backdrop-filter: blur(4px);
  z-index: 2;
}

.z-index-3 {
  z-index: 3 !important;
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 20px !important;
  padding: 32px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25) !important;
}

.login-btn {
  border-radius: 12px;
  transition: all 0.25s ease;
}

.login-btn:hover {
  background: #1A237E !important;
}

@media (max-width: 600px) {
  .login-card {
    padding: 20px 16px;
  }
}
</style>

