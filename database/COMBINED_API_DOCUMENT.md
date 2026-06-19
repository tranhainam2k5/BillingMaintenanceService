# 📘 Tài liệu Tổng hợp API, Cơ sở Dữ liệu & Tích hợp Hệ thống
## Hệ thống Quản lý Kí túc xá - Dịch vụ Hóa đơn & Bảo trì (Nhóm 3)

Tài liệu này tổng hợp toàn bộ thông tin về API, sơ đồ cơ sở dữ liệu, phân quyền tài khoản và các kịch bản luồng nghiệp vụ đầu cuối (end-to-end) của **Billing & Maintenance Service** (Nhóm 3).

---

## 🗄️ Tổng quan về Cơ sở Dữ liệu

Cơ sở dữ liệu của dịch vụ được xây dựng trên hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL (Render Cloud). Thiết kế dữ liệu tập trung vào việc quản lý thông tin sinh viên, phát hành hóa đơn hàng tháng, ghi nhận lịch sử giao dịch thanh toán và phân công xử lý các yêu cầu bảo trì thiết bị.

### Các bảng dữ liệu chính

1. **Users (Người dùng)**: Lưu trữ thông tin tài khoản, mật khẩu băm, họ tên, vai trò và số phòng.
2. **Invoices (Hóa đơn)**: Lưu trữ thông tin các khoản phí sinh hoạt cần thu (điện, nước, tiền phòng, dịch vụ).
3. **Payments (Thanh toán)**: Lưu trữ lịch sử giao dịch thanh toán hóa đơn.
4. **MaintenanceRequests (Yêu cầu sửa chữa)**: Ghi chép thông tin báo hỏng thiết bị và kết quả sửa chữa.
5. **Technicians (Kỹ thuật viên)**: Danh sách các nhân viên sửa chữa được hệ thống phân công.
6. **Contracts (Hợp đồng phòng)**: Thông tin các hợp đồng nội trú phòng kí túc xá của sinh viên.
7. **Debts (Công nợ)**: Thực thể logic dùng để theo dõi số tiền còn nợ của sinh viên, được truy xuất tối ưu qua Database View `View_Debts`.

---

## 📋 Bảng Tổng hợp Danh sách API

| Phân hệ | Phương thức | Endpoint Route | Mô tả chức năng | Quyền truy cập |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản mới | Mọi đối tượng |
| **Auth** | `POST` | `/api/auth/login` | Đăng nhập hệ thống & nhận JWT | Mọi đối tượng |
| **Auth** | `POST` | `/api/auth/refresh` | Làm mới JWT đã hết hạn | Mọi đối tượng |
| **Users** | `GET` | `/api/users` | Lấy danh sách tài khoản | Admin, Manager |
| **Users** | `GET` | `/api/users/{id}` | Lấy chi tiết tài khoản theo ID | Admin, Manager |
| **Users** | `PUT` | `/api/users/{id}` | Cập nhật thông tin tài khoản | Admin, Manager |
| **Users** | `DELETE`| `/api/users/{id}` | Xóa tài khoản khỏi hệ thống | Admin, Manager |
| **Invoices** | `GET` | `/api/invoices` | Lấy danh sách toàn bộ hóa đơn | Admin, Manager, Staff, Tech |
| **Invoices** | `GET` | `/api/invoices/my` | Lấy hóa đơn của sinh viên hiện tại| Student, Admin, Manager |
| **Invoices** | `GET` | `/api/invoices/{id}` | Lấy chi tiết hóa đơn theo ID | Student, Admin, Manager, Staff, Tech |
| **Invoices** | `POST` | `/api/invoices` | Tạo hóa đơn sinh hoạt mới | Admin, Manager, Staff |
| **Invoices** | `PUT` | `/api/invoices/{id}` | Cập nhật thông tin hóa đơn | Admin, Manager, Staff |
| **Invoices** | `DELETE`| `/api/invoices/{id}` | Xóa hóa đơn | Admin, Manager, Staff |
| **Payments** | `POST` | `/api/payments` | Thực hiện thanh toán hóa đơn | Student, Admin, Manager, Staff |
| **Payments** | `GET` | `/api/payments` | Xem toàn bộ lịch sử thanh toán | Admin, Manager, Staff, Tech |
| **Payments** | `GET` | `/api/payments/my` | Xem lịch sử thanh toán cá nhân | Student, Admin, Manager |
| **Maintenance**| `POST` | `/api/maintenance` | Gửi yêu cầu sửa chữa cơ sở vật chất| Student, Admin, Manager |
| **Maintenance**| `GET` | `/api/maintenance` | Xem toàn bộ danh sách yêu cầu | Admin, Manager, Staff, Tech |
| **Maintenance**| `GET` | `/api/maintenance/my` | Xem yêu cầu sửa chữa cá nhân | Student, Admin, Manager |
| **Maintenance**| `PUT` | `/api/maintenance/{id}/status` | Cập nhật trạng thái sửa chữa & phí | Admin, Manager, Staff, Tech |
| **Debts** | `GET` | `/api/debts` | Xem danh sách công nợ toàn hệ thống| Admin, Staff, Tech |
| **Debts** | `GET` | `/api/debts/student/{id}` | Xem chi tiết công nợ của sinh viên | Admin, Staff, Tech, Student |

---

## 👥 Ma trận Phân quyền Tài khoản (Permissions)

| Phân hệ API | Admin | Manager | Staff | Maintenance Staff | Student |
|---|:---:|:---:|:---:|:---:|:---:|
| **Auth** (Xác thực) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Users** (Tài khoản) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Invoices** (Hóa đơn) | ✅ | ✅ | ✅ | ✅ (Chỉ xem) | ✅ (Chỉ xem cá nhân) |
| **Payments** (Thanh toán) | ✅ | ✅ | ✅ | ❌ | ✅ (Chỉ trả cho mình) |
| **Maintenance** (Bảo trì) | ✅ | ✅ | ✅ | ✅ (Cập nhật sửa chữa) | ✅ (Chỉ tạo/xem cá nhân) |
| **Debts** (Công nợ) | ✅ | ✅ | ✅ | ✅ (Chỉ xem) | ✅ (Chỉ xem cá nhân) |

---

## 🔄 Các Kịch bản Luồng Nghiệp vụ Đầu - Cuối (End-to-End Workflows)

### 💳 Kịch bản 1: Sinh viên thanh toán hóa đơn trực tuyến
Sinh viên đăng nhập vào hệ thống, kiểm tra hóa đơn điện nước hàng tháng và thanh toán qua Chuyển khoản ngân hàng.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Sinh viên (User)
    participant FE as Vue 3 Giao diện
    participant API as ASP.NET Core API
    participant DB as PostgreSQL Database

    Student->>FE: Truy cập trang "Hóa đơn của tôi"
    FE->>API: GET /api/invoices/my (Gửi JWT Token)
    API->>DB: Truy vấn hóa đơn có UserId = UserId trong token
    DB-->>API: Trả về danh sách hóa đơn (Hóa đơn ID: 101, Status: Pending, Số tiền: 1,450,000)
    API-->>FE: Trả về JSON dữ liệu hóa đơn
    FE-->>Student: Hiển thị hóa đơn lên màn hình
    
    Student->>FE: Nhấp nút "Thanh toán" và chọn Chuyển khoản ngân hàng
    FE->>API: POST /api/payments { invoiceId: 101, amount: 1450000, paymentMethod: "BankTransfer", transactionId: "FT889102" }
    API->>DB: Thêm bản ghi Payment mới (Status: Success)
    API->>DB: Tính toán tổng số tiền đã thanh toán cho Hóa đơn 101
    alt Tổng tiền đóng >= Số tiền hóa đơn
        API->>DB: Cập nhật trạng thái Hóa đơn sang "Paid" (Đã thanh toán)
    end
    DB-->>API: Xác nhận lưu cơ sở dữ liệu thành công
    API-->>FE: Trả về kết quả: "Thanh toán thành công và hóa đơn đã cập nhật"
    FE-->>Student: Hiển thị thông báo thành công (Hóa đơn chuyển sang "Đã thanh toán", dư nợ giảm về 0)
```

---

### 🔧 Kịch bản 2: Sinh viên gửi yêu cầu sửa chữa thiết bị phòng
Sinh viên báo cáo sự cố hư hỏng điều hòa trong phòng lên ban quản lý.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Sinh viên (User)
    participant FE as Vue 3 Giao diện
    participant API as ASP.NET Core API
    participant DB as PostgreSQL Database

    Student->>FE: Mở biểu mẫu "Gửi yêu cầu sửa chữa"
    Student->>FE: Nhập Tiêu đề: "Rò rỉ nước điều hòa", Mô tả: "Điều hòa phòng A305 chảy nước", Phòng: "A305"
    FE->>API: POST /api/maintenance { title: "Rò rỉ nước điều hòa", description: "Điều hòa phòng A305...", roomNumber: "A305" }
    API->>DB: Tạo bản ghi MaintenanceRequest mới (UserId, title, roomNumber, Status="Pending")
    DB-->>API: Yêu cầu được lưu thành công với ID: 201
    API-->>FE: Trả về JSON thông tin yêu cầu vừa tạo
    FE-->>Student: Hiển thị thông báo gửi thành công (Trạng thái: Đang chờ duyệt)
```

---

### 📝 Kịch bản 3: Admin quản trị hóa đơn hệ thống
Người quản trị lập hóa đơn sinh hoạt định kỳ cho phòng của sinh viên.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin (Quản trị viên)
    participant FE as Vue 3 Giao diện
    participant API as ASP.NET Core API
    participant DB as PostgreSQL Database

    Admin->>FE: Nhập thông tin lập hóa đơn (Mã SV: 12, Tiền phòng: 900k, Điện: 300k, Nước: 100k, Phí dịch vụ: 50k)
    FE->>API: POST /api/invoices { userId: 12, electricityFee: 300000, waterFee: 100000, roomFee: 900000, serviceFee: 50000, dueDate: "2026-06-30" }
    API->>DB: Kiểm tra sinh viên có ID 12 có tồn tại trong hệ thống
    DB-->>API: Xác nhận tồn tại (Sinh viên Nguyễn Văn A)
    API->>DB: Lưu hóa đơn mới (Tổng tiền = 1350000, Trạng thái = "Pending")
    DB-->>API: Hóa đơn được tạo thành công với ID: 102
    API-->>FE: Trả về HTTP 201 Created kèm dữ liệu hóa đơn
    FE-->>Admin: Hiển thị thông báo "Tạo hóa đơn thành công" trên bảng quản trị
```

---

### 🛠️ Kịch bản 4: Nhân viên kỹ thuật cập nhật trạng thái sửa chữa
Kỹ thuật viên kiểm tra công việc được phân công, thực hiện sửa chữa và hoàn thành kèm theo chi phí vật tư.

```mermaid
sequenceDiagram
    autonumber
    actor Tech as Nhân viên kỹ thuật (Kỹ thuật viên)
    participant FE as Vue 3 Giao diện
    participant API as ASP.NET Core API
    participant DB as PostgreSQL Database

    Tech->>FE: Xem danh sách công việc sửa chữa được phân công
    FE->>API: GET /api/maintenance (Gửi JWT Token của kỹ thuật viên)
    API->>DB: Truy vấn các yêu cầu có trạng thái 'Pending' hoặc được phân công cho mình
    DB-->>API: Trả về danh sách (Yêu cầu ID: 201)
    API-->>FE: Trả về JSON danh sách yêu cầu
    FE-->>Tech: Hiển thị sự cố "Rò rỉ nước điều hòa phòng A305"
    
    Tech->>FE: Nhấp nút "Bắt đầu sửa chữa" (Chuyển trạng thái sang InProgress)
    FE->>API: PUT /api/maintenance/201/status { status: "InProgress", technicianId: 2 }
    API->>DB: Cập nhật bản ghi MaintenanceRequest 201 (Status = "InProgress", TechnicianId = 2)
    DB-->>API: Xác nhận cập nhật
    API-->>FE: Trả về thông tin yêu cầu mới cập nhật
    FE-->>Tech: Màn hình chuyển trạng thái công việc thành "Đang thực hiện"

    Note over Tech, DB: Kỹ thuật viên tiến hành khắc phục sự cố tại phòng...
    
    Tech->>FE: Nhập báo cáo hoàn thành & chi phí vật tư phát sinh (150,000 VNĐ)
    FE->>API: PUT /api/maintenance/201/status { status: "Completed", technicianId: 2, repairCost: 150000 }
    API->>DB: Cập nhật bản ghi MaintenanceRequest 201 (Status="Completed", ResolvedAt=NOW(), RepairCost=150000)
    DB-->>API: Xác nhận lưu cơ sở dữ liệu
    API-->>FE: Trả về kết quả thành công
    FE-->>Tech: Giao diện cập nhật công việc thành "Hoàn thành thành công"
```
