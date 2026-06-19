# 📘 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ - NHÓM 3

> **Billing & Maintenance Service** — Quản lý hóa đơn, thanh toán và bảo trì KTX  
> Tích hợp với portal **Qly_ktx-main** (Nhóm 2) qua API

---

## 🚀 1. KHỞI ĐỘNG HỆ THỐNG

### Bước 1 — Khởi động Backend (C# .NET)

Mở terminal, chạy lệnh sau:

```powershell
cd C:\full_stack\nhom3\BillingMaintenanceService
dotnet run
```

✅ Backend chạy tại: **http://localhost:5300**  
✅ Swagger UI: **http://localhost:5300/swagger**

> Lần đầu chạy sẽ tự động:
> - Migrate database (PostgreSQL)
> - Tạo tài khoản `admin` (mật khẩu: `admin123`)
> - Tạo tài khoản `student` demo (mật khẩu: `123456`)
> - Tạo kỹ thuật viên mẫu
> - Đồng bộ sinh viên từ API Nhóm 2

---

### Bước 2 — Khởi động Frontend Nhóm 3 (QLKTX)

```powershell
cd C:\full_stack\nhom3\BillingMaintenanceService\QLKTX
npm run dev
```

✅ Chạy tại: **http://localhost:3001**

---

### Bước 3 — Khởi động Portal Nhóm 2 (Qly_ktx-main)

```powershell
cd C:\full_stack\kitucxa\kitucxa\Qly_ktx-main
npm run dev
```

✅ Chạy tại: **http://localhost:3000**

> **Lưu ý:** Backend (5300) phải chạy trước, sau đó mới khởi động frontend.

---

## 🔑 2. TÀI KHOẢN ĐĂNG NHẬP

### Frontend Nhóm 3 — http://localhost:3001

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Quản trị viên** | `admin` | `admin123` | Toàn quyền |
| **Sinh viên demo** | `student` | `123456` | Xem hóa đơn, gửi yêu cầu |
| **Sinh viên Nhóm 2** | `j97` | `123456` | Được tự động tạo khi đồng bộ |

---

### Portal Nhóm 2 — http://localhost:3000

| Vai trò | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| **Admin** | `admin` | `admin` | Kết nối real API Nhóm 3 |
| **Sinh viên** | `student` | `123456` | Tài khoản thật từ backend |

> Nếu backend offline, hệ thống tự động dùng bypass mock (dữ liệu tĩnh).

---

## 🖥️ 3. SỬ DỤNG FRONTEND NHÓM 3 (http://localhost:3001)

### Dành cho Admin

| Chức năng | Đường dẫn |
|---|---|
| Trang chủ tổng quan | `/app/billing-maintenance` |
| Danh sách hóa đơn | Tab "Quản lý Hóa đơn" |
| Danh sách yêu cầu bảo trì | Tab "Yêu cầu Bảo trì" |
| Quản lý công nợ | Tab "Công nợ" |

**Tạo hóa đơn mới:**
1. Đăng nhập với tài khoản `admin`
2. Vào tab **Quản lý Hóa đơn**
3. Nhấn **"Tạo hóa đơn"**
4. Chọn sinh viên → nhập tiền điện, nước, phòng → nhấn Lưu

**Cập nhật trạng thái yêu cầu bảo trì:**
1. Vào tab **Yêu cầu Bảo trì**
2. Chọn yêu cầu cần xử lý
3. Chọn trạng thái mới → Lưu

### Dành cho Sinh viên

| Chức năng | Hành động |
|---|---|
| Xem hóa đơn của mình | Vào tab "Hóa đơn của tôi" |
| Gửi yêu cầu sửa chữa | Nhấn "Gửi yêu cầu bảo trì" |
| Xem trạng thái yêu cầu | Tab "Yêu cầu của tôi" |
| Hủy yêu cầu (đang chờ) | Nhấn nút "Hủy" trên yêu cầu |

---

## 🌐 4. SỬ DỤNG PORTAL NHÓM 2 (http://localhost:3000)

### Đăng nhập admin → Quản lý Billing

1. Truy cập **http://localhost:3000/login**
2. Nhập `admin` / `admin` → nhấn **Xác nhận đăng nhập**
3. Hệ thống tự động kết nối API Nhóm 3 (port 5300)

**Các trang billing kết nối thực tế:**

| Trang | URL | Nguồn dữ liệu |
|---|---|---|
| Dashboard tổng quan | `/dashboard` | API Nhóm 3 (thực tế) |
| Danh sách hóa đơn | `/billing/invoices` | API Nhóm 3 (thực tế) |
| Yêu cầu bảo trì (Kanban) | `/billing/maintenance` | API Nhóm 3 (thực tế) |
| Chi tiết yêu cầu | `/billing/maintenance/:id` | API Nhóm 3 (thực tế) |
| Quản lý nhân viên | `/billing/admins` | API Nhóm 3 (thực tế) |

### Tạo hóa đơn từ Portal Nhóm 2

1. Vào `/billing/invoices`
2. Nhấn **"Tạo phiếu thu"**
3. Chọn sinh viên từ danh sách (tải từ API Nhóm 2)
4. Nhập số tiền, kỳ đóng (VD: `06/2026`), hạn nộp
5. Nhấn **"Tạo phiếu"** → lưu vào database Nhóm 3

### Thu tiền hóa đơn

1. Vào `/billing/invoices`
2. Tìm hóa đơn chưa thanh toán (trạng thái UNPAID/OVERDUE)
3. Nhấn icon 💰 (Thu tiền)
4. Chọn phương thức → nhấn **"Xác nhận thu tiền"**

### Cập nhật trạng thái bảo trì (Admin)

1. Vào `/billing/maintenance`
2. Chọn tab **Table** (bảng) hoặc xem Kanban
3. Click vào yêu cầu để xem chi tiết
4. Chọn trạng thái mới (Đang xử lý / Hoàn thành / Đã hủy)
5. Nhấn **"Cập nhật"**

---

## 💳 5. ĐẶC TẢ TÍCH HỢP NHÓM 3 VỚI NHÓM 2

### 5.1. Đồng bộ hóa tài khoản sinh viên

> Nhóm 3 gọi API Nhóm 2 (`GET http://localhost:5000/api/students`) để tạo tài khoản sinh viên tương ứng.

| Thông tin | Giá trị |
|---|---|
| **Phương thức** | `GET` |
| **Endpoint (kích hoạt)** | `/api/users/sync` |
| **Mục đích** | Đồng bộ thủ công hoặc tự động tài khoản sinh viên |

**Phản hồi (200 OK):**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `syncedCount` | `number` | Số tài khoản đã đồng bộ |
| `message` | `string` | Thông báo kết quả |

---

### 5.2. Tạo hóa đơn tiền phòng

> Admin tạo hóa đơn liên kết với sinh viên (Nhóm 2) và phòng (Nhóm 1).

| Thông tin | Giá trị |
|---|---|
| **Phương thức** | `POST` |
| **Endpoint** | `/api/invoices` |

**Yêu cầu (Request Body):**

| Trường | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|
| `studentId` | `string (UUID)` | Mã sinh viên từ Nhóm 2 | `930b5e14-...` |
| `roomId` | `string (UUID)` | Mã phòng từ Nhóm 1 | `401219e9-...` |
| `title` | `string` | Tiêu đề hóa đơn | `Hóa đơn tiền phòng tháng 06/2026` |
| `amount` | `number` | Số tiền (VNĐ) | `1200000.0` |
| `type` | `string` | Loại hóa đơn | `ROOM` |
| `dueDate` | `string (ISO8601)` | Hạn nộp | `2026-06-30T00:00:00Z` |

**Phản hồi (201 Created):**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `string` | Mã hóa đơn tự sinh |
| `studentId` | `string` | Mã sinh viên |
| `roomId` | `string` | Mã phòng |
| `title` | `string` | Tiêu đề |
| `amount` | `number` | Số tiền |
| `type` | `string` | Loại hóa đơn |
| `status` | `string` | Trạng thái (`UNPAID`) |
| `dueDate` | `string` | Hạn nộp |
| `createdAt` | `string` | Thời điểm tạo |

---

### 5.3. Tạo yêu cầu bảo trì

> Sinh viên gửi yêu cầu sửa chữa liên kết với phòng (Nhóm 1) và tài khoản (Nhóm 2).

| Thông tin | Giá trị |
|---|---|
| **Phương thức** | `POST` |
| **Endpoint** | `/api/maintenance` |

**Yêu cầu (Request Body):**

| Trường | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|
| `studentId` | `string (UUID)` | Mã sinh viên từ Nhóm 2 | `930b5e14-...` |
| `roomId` | `string (UUID)` | Mã phòng từ Nhóm 1 | `401219e9-...` |
| `description` | `string` | Mô tả sự cố | `Điều hòa chảy nước và bóng đèn bị hỏng` |
| `imageUrl` | `string (URL)` | Ảnh đính kèm (tùy chọn) | `https://example.com/broken-ac.jpg` |

**Phản hồi (201 Created):**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `string` | Mã yêu cầu tự sinh |
| `studentId` | `string` | Mã sinh viên |
| `roomId` | `string` | Mã phòng |
| `description` | `string` | Mô tả sự cố |
| `status` | `string` | Trạng thái ban đầu (`Pending`) |
| `imageUrl` | `string` | URL ảnh đính kèm |
| `createdAt` | `string` | Thời điểm tạo |

---

## ⚙️ 6. CẤU HÌNH KẾT NỐI

### Proxy Qly_ktx-main → Backend Nhóm 3

File: `Qly_ktx-main/vite.config.ts`

```typescript
'/billing-api': {
  target: 'http://localhost:5300',   // ← Trỏ đến backend Nhóm 3
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/billing-api/, ''),
}
```

### Kết nối Database

File: `appsettings.json` hoặc biến môi trường `DATABASE_URL`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=billing_db;Username=...;Password=..."
  }
}
```

---

## 🗺️ 7. SƠ ĐỒ HỆ THỐNG

```
┌─────────────────────┐     ┌──────────────────────┐
│  Qly_ktx-main       │     │  QLKTX (Nhóm 3)       │
│  http://3000        │     │  http://3001           │
│  (Nhóm 2 portal)    │     │  (Frontend riêng)     │
└────────┬────────────┘     └──────────┬─────────────┘
         │ /billing-api proxy          │ /api (direct)
         ▼                             ▼
┌─────────────────────────────────────────────────────┐
│        BACKEND C# — http://localhost:5300            │
│        Billing & Maintenance Service (Nhóm 3)        │
│                                                      │
│  Controllers: Auth, Invoices, Maintenance,           │
│               Payments, Debts, Dashboard, Admins     │
└───────────────────────┬─────────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │   PostgreSQL DB    │
              │   (Render.com)     │
              └────────────────────┘
                        │
              ┌─────────▼──────────┐
              │  API Nhóm 2        │
              │  (Student & Room)  │
              │  Render.com        │
              └────────────────────┘
```

---

## ❓ 8. XỬ LÝ LỖI THƯỜNG GẶP

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `net::ERR_CONNECTION_REFUSED` trên port 5300 | Backend chưa chạy | Chạy `dotnet run` trong thư mục BillingMaintenanceService |
| Port 3000 is in use | Có tiến trình khác đang dùng port | Dùng `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force` |
| Đăng nhập thất bại "Tài khoản không đúng" | Sai mật khẩu | Mật khẩu admin là `admin123`, sinh viên là `123456` |
| Kanban board trống sau đăng nhập | Token mock không hợp lệ | Xóa localStorage (F12 → Application → Clear All) rồi đăng nhập lại |
| API trả về 401 Unauthorized | Token hết hạn | Đăng xuất và đăng nhập lại |
| Không thấy sinh viên mới trong danh sách | Chưa đồng bộ | Gọi `GET /api/users` một lần để trigger đồng bộ từ Nhóm 2 |

---

## 🔄 9. QUY TRÌNH TÍCH HỢP VỚI NHÓM 2

### Khi sinh viên Nhóm 2 đăng ký phòng:
1. Sinh viên có mã SV → lưu trong database Nhóm 2
2. Khi admin Nhóm 3 gọi `GET /api/users`, hệ thống tự động:
   - Lấy danh sách sinh viên từ API Nhóm 2
   - Tạo tài khoản đăng nhập Nhóm 3 cho sinh viên chưa có
   - Mật khẩu mặc định: `123456`
3. Sinh viên có thể đăng nhập vào **cả hai** frontend

### Trạng thái yêu cầu bảo trì:

| Trạng thái (DB) | Hiển thị Portal Nhóm 2 | Hiển thị QLKTX |
|---|---|---|
| `Pending` | `NEW` (Mới) | `Pending` |
| `InProgress` | `IN_PROGRESS` (Đang xử lý) | `InProgress` |
| `Completed` | `COMPLETED` (Hoàn thành) | `Completed` |
| `Cancelled` | `CANCELLED` (Đã hủy) | `Cancelled` |

---

*Cập nhật lần cuối: 19/06/2026 — Nhóm 3*
