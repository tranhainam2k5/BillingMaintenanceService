<template>
  <v-app class="home-app">
    <!-- Fixed Navigation Header -->
    <v-app-bar flat class="custom-header px-4 px-md-10" height="70" color="transparent">
      <!-- Logo & Branding -->
      <div class="d-flex align-center">
        <v-avatar size="40" class="mr-3 brand-logo" color="primary">
          <v-icon size="24" color="white">mdi-school</v-icon>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-black text-white leading-none">ĐẠI HỌC ĐẠI NAM</div>
          <div class="text-caption text-teal-lighten-4 font-weight-bold tracking-wider uppercase">Ký túc xá Sinh viên</div>
        </div>
      </div>

      <v-spacer />

      <!-- Navigation Links (Desktop) -->
      <div class="d-none d-md-flex align-center gap-6 nav-links text-white mr-6">
        <a href="#intro" class="nav-link font-weight-medium">Giới thiệu</a>
        <a href="#amenities" class="nav-link font-weight-medium">Tiện ích</a>
        <a href="#pricing" class="nav-link font-weight-medium">Bảng giá</a>
        <a href="#process" class="nav-link font-weight-medium">Quy trình</a>
        <a href="#contact" class="nav-link font-weight-medium">Liên hệ</a>
      </div>

      <!-- Login Button in the top right -->
      <v-btn
        color="amber-accent-3"
        variant="flat"
        class="login-btn-header font-weight-bold px-6 text-indigo-darken-4"
        rounded="lg"
        @click="goToLogin"
      >
        Đăng nhập
        <v-icon right class="ml-1">mdi-login</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="pa-0">
      <!-- 1. Hero Section -->
      <section id="hero" class="hero-section">
        <div class="hero-bg" :style="{ backgroundImage: `url(${dnuGate})` }"></div>
        <div class="hero-overlay"></div>
        <div class="glow-orb glow-1"></div>
        <div class="glow-orb glow-2"></div>
        
        <v-container class="fill-height relative position-relative z-index-3">
          <v-row align="center" class="w-100">
            <v-col cols="12" md="8" class="text-white animate-fade-in">
              <v-chip color="amber-accent-3" text-color="indigo-darken-4" class="mb-4 font-weight-bold px-4 py-2 floating-element" size="large">
                <v-icon start class="mr-1">mdi-star</v-icon> Ký Túc Xá Tiêu Chuẩn Quốc Tế
              </v-chip>
              <h1 class="text-h2 font-weight-black leading-tight text-gradient mb-6 animate-fade-in animate-delay-1">
                Không Gian Sống Văn Minh,<br>
                <span class="text-accent-color">Học Tập & Trải Nghiệm Lý Tưởng</span>
              </h1>
              <p class="text-subtitle-1 text-slate-200 mb-8 max-width-600 animate-fade-in animate-delay-2">
                Ký túc xá Trường Đại học Đại Nam được thiết kế hiện đại, đầy đủ tiện nghi, mang lại cho sinh viên môi trường sinh hoạt an toàn, tiện lợi và năng động nhất.
              </p>
              <div class="d-flex gap-4 flex-wrap animate-fade-in animate-delay-3">
                <v-btn
                  color="amber-accent-3"
                  size="large"
                  class="font-weight-bold px-8 text-indigo-darken-4 hero-primary-btn"
                  rounded="lg"
                  href="#intro"
                  elevation="3"
                >
                  Khám phá ngay
                  <v-icon right class="ml-2">mdi-arrow-down</v-icon>
                </v-btn>
                <v-btn
                  color="white"
                  variant="outlined"
                  size="large"
                  class="font-weight-bold px-8 hero-secondary-btn"
                  rounded="lg"
                  @click="goToLogin"
                >
                  Đăng ký phòng
                </v-btn>
              </div>
            </v-col>
            
            <v-col cols="12" md="4" class="d-none d-md-block animate-fade-in animate-delay-2">
              <v-card class="pa-6 glass-panel text-white floating-element" flat>
                <div class="d-flex align-center mb-4">
                  <v-avatar size="48" color="amber-accent-3" class="mr-3 shadow">
                    <v-icon color="indigo-darken-4" size="26">mdi-home-heart</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-h6 font-weight-bold leading-tight">Chào mừng bạn!</h3>
                    <span class="text-caption text-slate-300">Hệ thống đăng ký trực tuyến</span>
                  </div>
                </div>
                
                <p class="text-body-2 text-slate-200 mb-4 leading-relaxed">
                  Nhà trường luôn đồng hành và hỗ trợ sinh viên trong hành trình học tập, mở ra không gian sinh hoạt năng động và tiện nghi nhất.
                </p>
                
                <v-divider class="mb-4 border-slate-700" />
                
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2 font-weight-medium text-slate-300">Phòng trống khả dụng</span>
                  <v-chip color="success" size="small" class="font-weight-bold">95+ phòng</v-chip>
                </div>
                
                <div class="d-flex justify-space-between align-center mb-4">
                  <span class="text-body-2 font-weight-medium text-slate-300">Hỗ trợ sinh viên</span>
                  <span class="text-body-2 font-weight-bold text-amber-accent-3">24/7 Hotline</span>
                </div>
                
                <v-btn
                  block
                  color="amber-accent-3"
                  class="font-weight-bold text-indigo-darken-4 py-6 hover-scale-btn"
                  rounded="lg"
                  @click="goToLogin"
                >
                  Bắt đầu đăng ký
                  <v-icon right class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- 2. About/Intro Section -->
      <section id="intro" class="section-padding bg-slate-50">
        <v-container>
          <div class="text-center mb-12">
            <h2 class="text-h4 font-weight-black text-slate-900 mb-2">Giới Thiệu Chung</h2>
            <div class="divider-center"></div>
            <p class="text-body-1 text-slate-600 max-width-800 mx-auto mt-4">
              Ký túc xá Đại học Đại Nam nằm trong khuôn viên xanh rộng rãi của trường, được đầu tư xây dựng khang trang nhằm kiến tạo một không gian nội trú văn minh, hiện đại, thúc đẩy phong trào học tập và nghiên cứu của học sinh sinh viên.
            </p>
          </div>

          <v-row class="align-center">
            <v-col cols="12" md="6">
              <v-card class="pa-6 border-0 shadow-lg rounded-xl" color="white">
                <h3 class="text-h5 font-weight-bold text-indigo-darken-4 mb-4">Môi trường sống lý tưởng cho Sinh viên</h3>
                <p class="text-body-1 text-slate-700 mb-4 leading-relaxed">
                  Với mô hình tự quản văn minh, Ban quản lý Ký túc xá luôn đồng hành, chăm lo và hỗ trợ sinh viên trong suốt quá trình học tập tại trường. Chúng tôi cung cấp nhiều loại phòng phù hợp với nhu cầu và điều kiện kinh tế của từng gia đình.
                </p>
                <div class="d-flex flex-column gap-3">
                  <div class="d-flex align-center">
                    <v-icon color="success" class="mr-2" size="24">mdi-check-circle</v-icon>
                    <span class="text-slate-800 font-weight-medium">An ninh, trật tự được đảm bảo tuyệt đối.</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon color="success" class="mr-2" size="24">mdi-check-circle</v-icon>
                    <span class="text-slate-800 font-weight-medium">Các hoạt động văn hóa, thể thao sôi nổi thường niên.</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon color="success" class="mr-2" size="24">mdi-check-circle</v-icon>
                    <span class="text-slate-800 font-weight-medium">Đội ngũ kỹ thuật hỗ trợ sửa chữa sự cố nhanh chóng.</span>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- Stats/Badges Column -->
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="6">
                  <v-card class="pa-6 text-center border-0 rounded-xl stat-card" color="indigo-lighten-5">
                    <v-icon size="40" color="primary" class="mb-3">mdi-office-building</v-icon>
                    <div class="text-h4 font-weight-black text-primary">3+</div>
                    <div class="text-caption font-weight-bold text-slate-600 uppercase mt-1">Tòa nhà hiện đại</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-6 text-center border-0 rounded-xl stat-card" color="teal-lighten-5">
                    <v-icon size="40" color="secondary" class="mb-3">mdi-bed-double</v-icon>
                    <div class="text-h4 font-weight-black text-secondary">1500+</div>
                    <div class="text-caption font-weight-bold text-slate-600 uppercase mt-1">Chỗ ở tiện nghi</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-6 text-center border-0 rounded-xl stat-card" color="amber-lighten-5">
                    <v-icon size="40" color="amber-darken-3" class="mb-3">mdi-shield-account</v-icon>
                    <div class="text-h4 font-weight-black text-amber-darken-3">24/7</div>
                    <div class="text-caption font-weight-bold text-slate-600 uppercase mt-1">An ninh giám sát</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-6 text-center border-0 rounded-xl stat-card" color="purple-lighten-5">
                    <v-icon size="40" color="purple" class="mb-3">mdi-heart-pulse</v-icon>
                    <div class="text-h4 font-weight-black text-purple">100%</div>
                    <div class="text-caption font-weight-bold text-slate-600 uppercase mt-1">Hài lòng sinh viên</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- 3. Amenities Section -->
      <section id="amenities" class="section-padding bg-white">
        <v-container>
          <div class="text-center mb-12">
            <h2 class="text-h4 font-weight-black text-slate-900 mb-2">Tiện Ích Nổi Bật</h2>
            <div class="divider-center"></div>
            <p class="text-body-1 text-slate-600 max-width-800 mx-auto mt-4">
              Không chỉ là nơi nghỉ ngơi, Ký túc xá mang đến hệ sinh thái tiện ích khép kín, phục vụ đầy đủ cuộc sống học tập và sinh hoạt của sinh viên.
            </p>
          </div>

          <v-row>
            <v-col cols="12" sm="6" md="4" v-for="(item, idx) in amenities" :key="idx">
              <v-card class="pa-6 border-0 shadow-sm rounded-xl h-100 amenity-card">
                <v-avatar :color="item.color" size="48" class="mb-4">
                  <v-icon size="24" color="white">{{ item.icon }}</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">{{ item.title }}</h3>
                <p class="text-body-2 text-slate-600 leading-relaxed">{{ item.desc }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- 4. Room Pricing Section -->
      <section id="pricing" class="section-padding bg-slate-50">
        <v-container>
          <div class="text-center mb-12">
            <h2 class="text-h4 font-weight-black text-slate-900 mb-2">Bảng Giá Phòng Dịch Vụ</h2>
            <div class="divider-center"></div>
            <p class="text-body-1 text-slate-600 max-width-800 mx-auto mt-4">
              Mức phí lưu trú ưu đãi được hỗ trợ một phần kinh phí bởi nhà trường để phù hợp với điều kiện sinh hoạt của sinh viên.
            </p>
          </div>

          <v-row justify="center">
            <!-- Room Type Standard 8 -->
            <v-col cols="12" md="4">
              <v-card class="pricing-card pa-6 text-center border-0 rounded-xl" color="white">
                <div class="text-subtitle-1 font-weight-bold text-slate-500 uppercase tracking-wide">Tiêu chuẩn</div>
                <h3 class="text-h5 font-weight-black text-indigo-darken-4 mt-2">Phòng 8 Giường</h3>
                <div class="price-box my-6">
                  <span class="currency">VNĐ</span>
                  <span class="price-val">200K</span>
                  <span class="period">/ tháng</span>
                </div>
                <v-divider class="mb-6" />
                <div class="d-flex flex-column gap-3 text-body-2 text-slate-700 text-left mb-6">
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Giường tầng cá nhân + tủ đồ riêng</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Bình nước nóng lạnh</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Wifi dùng chung ổn định</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Ban công phơi đồ thoáng mát</div>
                </div>
                <v-btn color="primary" block rounded="lg" class="font-weight-bold" @click="goToLogin">Đăng ký ngay</v-btn>
              </v-card>
            </v-col>

            <!-- Room Type Standard 6 -->
            <v-col cols="12" md="4">
              <v-card class="pricing-card pa-6 text-center border-0 rounded-xl popular-card" color="white" elevation="8">
                <div class="popular-badge">Được chọn nhiều nhất</div>
                <div class="text-subtitle-1 font-weight-bold text-indigo-accent-2 uppercase tracking-wide">Tiêu chuẩn</div>
                <h3 class="text-h5 font-weight-black text-indigo-darken-4 mt-2">Phòng 6 Giường</h3>
                <div class="price-box my-6">
                  <span class="currency">VNĐ</span>
                  <span class="price-val">250K</span>
                  <span class="period">/ tháng</span>
                </div>
                <v-divider class="mb-6" />
                <div class="d-flex flex-column gap-3 text-body-2 text-slate-700 text-left mb-6">
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Giường rộng hơn, trang bị quạt công suất lớn</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Bình nước nóng lạnh chất lượng cao</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Wifi tốc độ tốt</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Không gian học tập yên tĩnh hơn</div>
                </div>
                <v-btn color="primary" block rounded="lg" class="font-weight-bold" @click="goToLogin">Đăng ký ngay</v-btn>
              </v-card>
            </v-col>

            <!-- Room Type VIP -->
            <v-col cols="12" md="4">
              <v-card class="pricing-card pa-6 text-center border-0 rounded-xl" color="white">
                <div class="text-subtitle-1 font-weight-bold text-amber-darken-3 uppercase tracking-wide">Dịch vụ cao cấp</div>
                <h3 class="text-h5 font-weight-black text-indigo-darken-4 mt-2">Phòng VIP 4 Giường</h3>
                <div class="price-box my-6">
                  <span class="currency">VNĐ</span>
                  <span class="price-val">500K</span>
                  <span class="period">/ tháng</span>
                </div>
                <v-divider class="mb-6" />
                <div class="d-flex flex-column gap-3 text-body-2 text-slate-700 text-left mb-6">
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Trang bị máy điều hòa nhiệt độ</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Bình nước nóng lạnh + tủ lạnh mini</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Bàn ghế tự học cao cấp riêng lẻ</div>
                  <div class="d-flex align-center"><v-icon size="16" color="success" class="mr-2">mdi-check</v-icon>Số người ít, không gian sinh hoạt tối đa</div>
                </div>
                <v-btn color="amber-darken-3" dark block rounded="lg" class="font-weight-bold" @click="goToLogin">Đăng ký ngay</v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- 5. Registration Process Section -->
      <section id="process" class="section-padding bg-white">
        <v-container>
          <div class="text-center mb-12">
            <h2 class="text-h4 font-weight-black text-slate-900 mb-2">Quy Trình Đăng Ký</h2>
            <div class="divider-center"></div>
            <p class="text-body-1 text-slate-600 max-width-800 mx-auto mt-4">
              Sinh viên có thể dễ dàng thực hiện đăng ký phòng trực tuyến chỉ trong vài phút theo quy trình chuẩn sau.
            </p>
          </div>

          <div class="d-none d-md-flex align-center justify-space-between process-row mt-6">
            <div class="process-step-home text-center">
              <div class="step-icon-home"><v-icon size="28" color="primary">mdi-clipboard-text-outline</v-icon></div>
              <h4 class="text-subtitle-1 font-weight-black text-slate-900 mt-4">1. Đăng ký online</h4>
              <p class="text-caption text-slate-500 mt-2 px-4">Tạo tài khoản và điền mẫu phiếu đăng ký trực tuyến chọn tòa và loại phòng mong muốn.</p>
            </div>
            <v-icon color="grey-lighten-1" size="32">mdi-chevron-right</v-icon>
            <div class="process-step-home text-center">
              <div class="step-icon-home"><v-icon size="28" color="primary">mdi-account-check-outline</v-icon></div>
              <h4 class="text-subtitle-1 font-weight-black text-slate-900 mt-4">2. BQL Xét duyệt</h4>
              <p class="text-caption text-slate-500 mt-2 px-4">Ban quản lý KTX tiếp nhận hồ sơ, đối chiếu thông tin và phê duyệt phòng ở.</p>
            </div>
            <v-icon color="grey-lighten-1" size="32">mdi-chevron-right</v-icon>
            <div class="process-step-home text-center">
              <div class="step-icon-home"><v-icon size="28" color="primary">mdi-credit-card-outline</v-icon></div>
              <h4 class="text-subtitle-1 font-weight-black text-slate-900 mt-4">3. Nộp lệ phí</h4>
              <p class="text-caption text-slate-500 mt-2 px-4">Nhận thông báo lệ phí và thanh toán trực tuyến qua ngân hàng hoặc ví điện tử.</p>
            </div>
            <v-icon color="grey-lighten-1" size="32">mdi-chevron-right</v-icon>
            <div class="process-step-home text-center">
              <div class="step-icon-home"><v-icon size="28" color="primary">mdi-door-open</v-icon></div>
              <h4 class="text-subtitle-1 font-weight-black text-slate-900 mt-4">4. Nhận phòng ở</h4>
              <p class="text-caption text-slate-500 mt-2 px-4">Đến văn phòng KTX nhận chìa khóa, kiểm tra cơ sở vật chất phòng ở và dọn vào lưu trú.</p>
            </div>
          </div>

          <!-- Mobile Process View -->
          <div class="d-md-none mt-6">
            <v-timeline side="end" align="start">
              <v-timeline-item dot-color="primary" size="small">
                <h4 class="text-subtitle-1 font-weight-black text-slate-900">1. Đăng ký online</h4>
                <p class="text-caption text-slate-500 mt-1">Điền phiếu đăng ký trực tuyến chọn tòa và loại phòng mong muốn qua trang cá nhân sinh viên.</p>
              </v-timeline-item>
              <v-timeline-item dot-color="primary" size="small">
                <h4 class="text-subtitle-1 font-weight-black text-slate-900">2. Xét duyệt hồ sơ</h4>
                <p class="text-caption text-slate-500 mt-1">Ban quản lý tiếp nhận hồ sơ, kiểm tra điều kiện xét duyệt và xác nhận phòng.</p>
              </v-timeline-item>
              <v-timeline-item dot-color="primary" size="small">
                <h4 class="text-subtitle-1 font-weight-black text-slate-900">3. Thanh toán lệ phí</h4>
                <p class="text-caption text-slate-500 mt-1">Nhận phiếu thu số hóa, thanh toán an toàn qua chuyển khoản ngân hàng hoặc tiền mặt.</p>
              </v-timeline-item>
              <v-timeline-item dot-color="primary" size="small">
                <h4 class="text-subtitle-1 font-weight-black text-slate-900">4. Nhận phòng lưu trú</h4>
                <p class="text-caption text-slate-500 mt-1">Làm biên bản nhận phòng, bàn giao chìa khóa và bắt đầu cuộc sống sinh viên đầy trải nghiệm.</p>
              </v-timeline-item>
            </v-timeline>
          </div>
        </v-container>
      </section>

      <!-- 6. Contact Section -->
      <section id="contact" class="section-padding bg-slate-900 text-white">
        <v-container>
          <v-row>
            <v-col cols="12" md="5" class="pr-md-10">
              <h2 class="text-h4 font-weight-black mb-4">Thông Tin Liên Hệ</h2>
              <p class="text-body-1 text-slate-300 mb-6 leading-relaxed">
                Ban quản lý KTX Đại học Đại Nam luôn sẵn sàng lắng nghe, giải đáp các thắc mắc và tiếp nhận các yêu cầu đăng ký của học sinh sinh viên.
              </p>
              <div class="d-flex flex-column gap-4 text-body-1">
                <div class="d-flex align-center">
                  <v-icon color="amber-accent-3" class="mr-3" size="24">mdi-map-marker</v-icon>
                  <span>Số 1 Phố Xốm, Phú Lãm, Hà Đông, Hà Nội</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon color="amber-accent-3" class="mr-3" size="24">mdi-phone</v-icon>
                  <span>Điện thoại: 0978.777.999 - (024) 66.777.999</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon color="amber-accent-3" class="mr-3" size="24">mdi-email</v-icon>
                  <span>Email: ktx@dainam.edu.vn - banquanly@dainam.edu.vn</span>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="7" class="mt-8 mt-md-0">
              <v-card class="pa-6 border-0 rounded-xl" color="rgba(255, 255, 255, 0.05)" theme="dark" flat>
                <h3 class="text-h6 font-weight-bold text-white mb-4">Gửi tin nhắn phản hồi nhanh</h3>
                <v-form>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field label="Họ và tên" variant="outlined" density="comfortable" class="mb-2" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field label="Mã sinh viên (nếu có)" variant="outlined" density="comfortable" class="mb-2" />
                    </v-col>
                  </v-row>
                  <v-text-field label="Email liên hệ" variant="outlined" density="comfortable" class="mb-2" />
                  <v-textarea label="Nội dung tin nhắn / câu hỏi" variant="outlined" rows="3" density="comfortable" class="mb-4" />
                  <v-btn color="amber-accent-3" class="font-weight-bold text-indigo-darken-4 px-6" rounded="lg">
                    Gửi yêu cầu
                    <v-icon right class="ml-2">mdi-send</v-icon>
                  </v-btn>
                </v-form>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>
    </v-main>

    <!-- Simple Copy Footer -->
    <footer class="py-6 text-center text-body-2 text-slate-500 bg-slate-950 border-t border-slate-900">
      <v-container>
        &copy; 2026 Trường Đại học Đại Nam. Bản quyền hệ thống quản lý Ký túc xá thuộc về Ban quản trị DNU.
      </v-container>
    </footer>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import dnuGate from '@/assets/dnu-gate.png'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}

interface AmenityItem {
  icon: string
  title: string
  desc: string
  color: string
}

const amenities: AmenityItem[] = [
  {
    icon: 'mdi-wifi',
    title: 'Wifi Miễn Phí',
    desc: 'Hệ thống phát sóng Wifi băng thông rộng phủ kín toàn bộ phòng ở sinh viên, canteen và khuôn viên sinh hoạt chung.',
    color: 'indigo'
  },
  {
    icon: 'mdi-security',
    title: 'An Ninh 24/7',
    desc: 'Đội ngũ bảo vệ chuyên nghiệp kết hợp hệ thống camera an ninh giám sát liên tục, quản lý ra vào nghiêm ngặt bằng thẻ sinh viên.',
    color: 'teal'
  },
  {
    icon: 'mdi-storefront',
    title: 'Canteen & Cửa Hàng',
    desc: 'Khu vực canteen rộng rãi phục vụ ăn uống hợp vệ sinh cùng siêu thị mini tiện ích cung cấp nhu yếu phẩm thiết yếu.',
    color: 'amber-darken-3'
  },
  {
    icon: 'mdi-dumbbell',
    title: 'Khu Vực Thể Thao',
    desc: 'Hỗ trợ nâng cao sức khỏe sinh viên với sân bóng rổ, bàn bóng bàn và khu tập thể dục thể thao ngoài trời hiện đại.',
    color: 'purple'
  },
  {
    icon: 'mdi-book-open-page-variant',
    title: 'Phòng Tự Học',
    desc: 'Không gian học tập yên tĩnh, thoáng mát được trang bị đầy đủ bàn ghế, bảng viết giúp sinh viên học nhóm hiệu quả.',
    color: 'cyan-darken-1'
  },
  {
    icon: 'mdi-tshirt-crew',
    title: 'Khu Giặt Tự Động',
    desc: 'Hệ thống máy giặt, máy sấy thông minh hoạt động bằng thẻ từ tiện lợi giúp việc giặt giũ nhanh chóng và tiết kiệm.',
    color: 'deep-orange'
  }
]
</script>

<style scoped>
/* Reset and global values inside view */
.home-app {
  font-family: 'Inter', sans-serif !important;
  background-color: #F8FAFC !important;
}

/* Header */
.custom-header {
  backdrop-filter: blur(12px);
  background: rgba(15, 23, 42, 0.65) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  z-index: 1000 !important;
}

.brand-logo {
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
}

.nav-links {
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  transition: color 0.2s ease;
  position: relative;
  padding: 6px 0;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #FFB300;
  transition: width 0.2s ease;
}

.nav-link:hover {
  color: #FFFFFF;
}

.nav-link:hover::after {
  width: 100%;
}

.login-btn-header {
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn-header:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 179, 0, 0.4);
}

/* 1. Hero Section */
.hero-section {
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transform: scale(1.05);
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(26, 35, 126, 0.75) 100%);
  z-index: 2;
}

.text-gradient {
  background: linear-gradient(90deg, #FFFFFF 0%, #E2F1F8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 4rem !important;
}

.text-accent-color {
  color: #FFB300;
  text-shadow: 0 2px 15px rgba(255, 179, 0, 0.25);
}

.max-width-600 {
  max-width: 600px;
}

.max-width-800 {
  max-width: 800px;
}

/* Sections Global */
.section-padding {
  padding: 100px 0;
}

.divider-center {
  width: 60px;
  height: 4px;
  background: #3949AB;
  margin: 0 auto;
  border-radius: 2px;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

/* Amenity Cards */
.amenity-card {
  background: #FFFFFF !important;
  border: 1px solid #EEF2F6 !important;
  transition: all 0.3s ease;
}

.amenity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05) !important;
  border-color: #E2E8F0 !important;
}

/* Pricing Cards */
.pricing-card {
  border: 1px solid #E2E8F0 !important;
  transition: all 0.3s ease;
  position: relative;
}

.pricing-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.08) !important;
}

.popular-card {
  border: 2px solid #3949AB !important;
  position: relative;
  z-index: 2;
}

.popular-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #3949AB;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 16px;
  border-radius: 20px;
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(57, 73, 171, 0.3);
}

.price-box {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency {
  font-size: 14px;
  font-weight: 700;
  color: #64748B;
  margin-right: 4px;
}

.price-val {
  font-size: 48px;
  font-weight: 900;
  color: #1E293B;
  line-height: 1;
}

.period {
  font-size: 14px;
  color: #64748B;
  margin-left: 4px;
}

/* Process Timeline & Steps */
.process-row {
  max-width: 1000px;
  margin: 0 auto;
}

.process-step-home {
  flex: 1;
}

.step-icon-home {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #EEF2F6;
  border: 2px dashed #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.process-step-home:hover .step-icon-home {
  background: #3949AB;
  border-color: #3949AB;
  transform: scale(1.05);
}

.process-step-home:hover .step-icon-home :deep(.v-icon) {
  color: #FFFFFF !important;
}

.bg-slate-50 {
  background-color: #F8FAFC !important;
}

.bg-slate-900 {
  background-color: #0F172A !important;
}

.bg-slate-950 {
  background-color: #020617 !important;
}

.text-slate-200 {
  color: #E2E8F0 !important;
}

.text-slate-300 {
  color: #CBD5E1 !important;
}

.text-slate-500 {
  color: #64748B !important;
}

.text-slate-600 {
  color: #475569 !important;
}

.text-slate-700 {
  color: #334155 !important;
}

.text-slate-800 {
  color: #1E293B !important;
}

.text-slate-900 {
  color: #0F172A !important;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.gap-6 {
  gap: 24px;
}

@media (max-width: 960px) {
  .text-gradient {
    font-size: 2.8rem !important;
  }
  .section-padding {
    padding: 60px 0;
  }
}

/* Custom CSS Helpers and Animations */
.relative, .position-relative {
  position: relative !important;
}

.z-index-3 {
  z-index: 3 !important;
}

/* Glassmorphism Panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 24px !important;
  box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.35) !important;
  position: relative;
  overflow: hidden;
}

.glass-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%);
  transition: all 0.6s ease;
}

.glass-panel:hover::before {
  left: 150%;
}

/* Glowing Background Orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.25;
  z-index: 2;
  pointer-events: none;
}

.glow-1 {
  top: -10%;
  right: 15%;
  width: 350px;
  height: 350px;
  background: #3949AB;
}

.glow-2 {
  bottom: 5%;
  left: 10%;
  width: 450px;
  height: 450px;
  background: #00897B;
}

/* Keyframes for animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(35px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Classes to apply animations */
.animate-fade-in {
  opacity: 0;
  animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-delay-1 {
  animation-delay: 0.15s;
}

.animate-delay-2 {
  animation-delay: 0.3s;
}

.animate-delay-3 {
  animation-delay: 0.45s;
}

.floating-element {
  animation: float 6s ease-in-out infinite;
}

/* Buttons micro-interactions */
.hero-primary-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.hero-primary-btn:hover {
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: 0 8px 25px rgba(255, 179, 0, 0.5) !important;
}

.hero-secondary-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.5) !important;
}

.hero-secondary-btn:hover {
  transform: translateY(-3px) !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffffff !important;
}

.hover-scale-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.hover-scale-btn:hover {
  transform: scale(1.02) !important;
  box-shadow: 0 6px 20px rgba(255, 179, 0, 0.3) !important;
}
</style>
