# 📋 Tài liệu Hướng dẫn Sử dụng API - Dịch vụ Hóa đơn & Bảo trì (Billing & Maintenance Service)
## Hệ thống Quản lý Kí túc xá (Nhóm 3)

Tài liệu này cung cấp mô tả chi tiết, đầy đủ về các API của dịch vụ **Billing & Maintenance Service** (Quản lý hóa đơn & Bảo trì KTX), bao gồm thông tin chi tiết về các endpoint, phân quyền vai trò, cơ chế xác thực và cấu trúc dữ liệu gửi/nhận (JSON).

---

## 🔍 Tổng quan Dịch vụ

Dịch vụ **Billing & Maintenance Service** phụ trách các nghiệp vụ cốt lõi sau:
* **Quản lý Tài khoản & Xác thực**: Đăng ký, đăng nhập, cấp phát JWT Token và bảo mật mật khẩu.
* **Quản lý Hóa đơn**: Tạo và theo dõi các khoản phí sinh hoạt hàng tháng (điện, nước, tiền phòng, và các dịch vụ đi kèm) cho từng phòng kí túc xá.
* **Xử lý Thanh toán**: Ghi nhận và đối soát lịch sử giao dịch (tiền mặt, chuyển khoản ngân hàng, ví điện tử) cho các hóa đơn đã phát hành.
* **Yêu cầu Sửa chữa / Bảo trì**: Cho phép sinh viên tạo báo cáo hỏng hóc cơ sở vật chất (thiết bị điện, nước, điều hòa...) và cho phép quản trị viên phân công nhân viên kỹ thuật xử lý, cập nhật tiến độ, tính toán chi phí sửa chữa.
* **Quản lý Công nợ (Debts)**: Theo dõi các hóa đơn chưa hoàn thành thanh toán, tính toán tổng dư nợ của sinh viên và thống kê tài chính.

---

## 🌐 Địa chỉ Base URL

* **Môi trường Phát triển (Local)**: `http://localhost:5300` (hoặc `https://localhost:5301`)
* **Môi trường Production (Render)**: `https://billing-maintenance-backend.onrender.com`

---

## 🔒 Cơ chế Xác thực (Authentication)

Tất cả các API yêu cầu bảo mật bắt buộc phải gửi kèm **JSON Web Token (JWT) Bearer Token** trong header của HTTP Request.
* **Phương thức**: JWT được truyền qua Header `Authorization`.
* **Định dạng Header**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

---

## 👥 Ma trận Phân quyền Vai trò (Role Permissions Matrix)

Hệ thống phân quyền dựa trên 5 vai trò chính:
1. **Admin**: Toàn quyền hệ thống (Tạo tài khoản, quản trị toàn bộ hóa đơn/thanh toán, xem báo cáo thống kê công nợ tổng).
2. **Manager**: Quản lý nghiệp vụ (Xem danh sách hóa đơn, phân công yêu cầu sửa chữa, giám sát báo cáo tài chính).
3. **Staff**: Nhân viên hành chính/kế toán (Lập hóa đơn mới, ghi nhận thanh toán tiền mặt, cập nhật thông tin hóa đơn).
4. **MaintenanceStaff**: Nhân viên kỹ thuật/sửa chữa (Xem danh sách các yêu cầu sửa chữa được phân công, cập nhật trạng thái sửa chữa, ghi nhận chi phí vật tư).
5. **Student**: Sinh viên nội trú (Xem hóa đơn cá nhân, thanh toán hóa đơn trực tuyến, tạo yêu cầu sửa chữa phòng).

### Ma trận Phân quyền cụ thể

| Module | Endpoint | Admin | Manager | Staff | Maintenance Staff | Student |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Auth** | Đăng ký (Register) | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Đăng nhập (Login) | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Làm mới Token (Refresh) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Users** | Lấy DS tài khoản | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Lấy tài khoản theo ID | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Cập nhật tài khoản | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Invoices**| Lấy tất cả hóa đơn | ✅ | ✅ | ✅ | ✅ | ❌ |
| | Lấy chi tiết hóa đơn | ✅ | ✅ | ✅ | ✅ | ✅ (Cá nhân) |
| | Tạo hóa đơn mới | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Cập nhật hóa đơn | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Xóa hóa đơn | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Đánh dấu Đã thanh toán | ✅ | ✅ | ✅ | ❌ | ✅ (Cá nhân) |
| **Payments**| Tạo thanh toán mới | ✅ | ✅ | ✅ | ❌ | ✅ (Cá nhân) |
| | Xem lịch sử thanh toán | ✅ | ✅ | ✅ | ✅ | ✅ (Cá nhân) |
| | Xác minh thanh toán | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Maintenance**| Tạo yêu cầu sửa chữa | ✅ | ✅ | ❌ | ❌ | ✅ (Cá nhân) |
| | Xem danh sách yêu cầu | ✅ | ✅ | ✅ | ✅ | ✅ (Cá nhân) |
| | Cập nhật trạng thái | ✅ | ✅ | ✅ | ✅ | ❌ |
| | Phân công nhân sự | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Hoàn thành sửa chữa | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Debts** | Xem danh sách công nợ | ✅ | ❌ | ✅ | ✅ | ✅ (Cá nhân) |
| | Thống kê công nợ tổng | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 📡 Chi tiết các Endpoint API

### 1. Auth (Xác thực tài khoản)

#### Đăng ký tài khoản (Register)
* **HTTP Method**: `POST`
* **Route**: `/api/auth/register`
* **Quyền hạn**: `AllowAnonymous` (Mọi người dùng)
* **Request Body (JSON)**:
  ```json
  {
    "username": "sinhvien_test",
    "password": "StrongPassword123!",
    "email": "sinhvien@example.com",
    "fullName": "Nguyễn Văn Sinh Viên",
    "phoneNumber": "0987654321",
    "role": "Student",
    "roomNumber": "A302"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "message": "Đăng ký thành công",
    "user": {
      "id": 12,
      "username": "sinhvien_test",
      "email": "sinhvien@example.com",
      "fullName": "Nguyễn Văn Sinh Viên",
      "phoneNumber": "0987654321",
      "role": "Student",
      "roomNumber": "A302",
      "createdAt": "2026-06-19T04:20:00.000Z"
    }
  }
  ```

#### Đăng nhập (Login)
* **HTTP Method**: `POST`
* **Route**: `/api/auth/login`
* **Quyền hạn**: `AllowAnonymous` (Mọi người dùng)
* **Request Body (JSON)**:
  ```json
  {
    "username": "sinhvien_test",
    "password": "StrongPassword123!"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "message": "Đăng nhập thành công",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMiIsInVzZXJuYW1lIjoic2luaHZpZW5fdGVzdCIsImVtYWlsIjoic2luaHZpZW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiU3R1ZGVudCIsImV4cCI6MTc4NTEyMDAwMH0.signature",
    "user": {
      "id": 12,
      "username": "sinhvien_test",
      "email": "sinhvien@example.com",
      "fullName": "Nguyễn Văn Sinh Viên",
      "phoneNumber": "0987654321",
      "role": "Student",
      "roomNumber": "A302",
      "createdAt": "2026-06-19T04:20:00.000Z"
    }
  }
  ```

#### Làm mới Token (Refresh Token)
* **HTTP Method**: `POST`
* **Route**: `/api/auth/refresh`
* **Quyền hạn**: `AllowAnonymous`
* **Request Body (JSON)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "7c9803b2-db4f-4d44-9041-e948f9fa02ea"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "token": "new_jwt_token_string_here",
    "refreshToken": "new_refresh_token_uuid_here"
  }
  ```

---

### 2. Users (Quản lý Người dùng)

#### Lấy danh sách người dùng (Get Users)
* **HTTP Method**: `GET`
* **Route**: `/api/users`
* **Quyền hạn**: `Admin, Manager`
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@ktx.local",
      "fullName": "Quản trị viên hệ thống",
      "phoneNumber": "0123456789",
      "role": "Admin",
      "roomNumber": null,
      "createdAt": "2026-06-18T08:00:00.000Z"
    },
    {
      "id": 12,
      "username": "sinhvien_test",
      "email": "sinhvien@example.com",
      "fullName": "Nguyễn Văn Sinh Viên",
      "phoneNumber": "0987654321",
      "role": "Student",
      "roomNumber": "A302",
      "createdAt": "2026-06-19T04:20:00.000Z"
    }
  ]
  ```

#### Lấy tài khoản theo ID (Get User By Id)
* **HTTP Method**: `GET`
* **Route**: `/api/users/{id}`
* **Quyền hạn**: `Admin, Manager`
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  {
    "id": 12,
    "username": "sinhvien_test",
    "email": "sinhvien@example.com",
    "fullName": "Nguyễn Văn Sinh Viên",
    "phoneNumber": "0987654321",
    "role": "Student",
    "roomNumber": "A302",
    "createdAt": "2026-06-19T04:20:00.000Z"
  }
  ```

#### Cập nhật thông tin tài khoản (Update User)
* **HTTP Method**: `PUT`
* **Route**: `/api/users/{id}`
* **Quyền hạn**: `Admin, Manager`
* **Request Body (JSON)**:
  ```json
  {
    "username": "sinhvien_updated",
    "password": "NewStrongPassword123!",
    "email": "sinhvien_new@example.com",
    "fullName": "Nguyễn Văn Sinh Viên Cập Nhật",
    "phoneNumber": "0987654999",
    "role": "Student",
    "roomNumber": "A305"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "id": 12,
    "username": "sinhvien_updated",
    "email": "sinhvien_new@example.com",
    "fullName": "Nguyễn Văn Sinh Viên Cập Nhật",
    "phoneNumber": "0987654999",
    "role": "Student",
    "roomNumber": "A305",
    "createdAt": "2026-06-19T04:20:00.000Z"
  }
  ```

---

### 3. Invoices (Quản lý Hóa đơn)

#### Lấy tất cả hóa đơn (Get All Invoices)
* **HTTP Method**: `GET`
* **Route**: `/api/invoices`
* **Quyền hạn**: `Admin, Manager, Staff, MaintenanceStaff`
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  [
    {
      "id": 101,
      "userId": 12,
      "user": {
        "id": 12,
        "username": "sinhvien_updated",
        "fullName": "Nguyễn Văn Sinh Viên Cập Nhật"
      },
      "title": "Hóa đơn tháng 06/2026 phòng A305",
      "amount": 1450000.00,
      "description": "Tiền điện nước và phí phòng tháng 06/2026",
      "dueDate": "2026-06-30T00:00:00.000Z",
      "createdAt": "2026-06-19T05:00:00.000Z",
      "status": "Pending",
      "electricityFee": 350000.00,
      "waterFee": 100000.00,
      "roomFee": 900000.00,
      "serviceFee": 100000.00
    }
  ]
  ```

#### Lấy chi tiết hóa đơn (Get Invoice Details)
* **HTTP Method**: `GET`
* **Route**: `/api/invoices/{id}`
* **Quyền hạn**: `Admin, Manager, Staff, MaintenanceStaff, Student` (Sinh viên chỉ xem được hóa đơn của chính mình)
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  {
    "id": 101,
    "userId": 12,
    "user": {
      "id": 12,
      "username": "sinhvien_updated",
      "fullName": "Nguyễn Văn Sinh Viên Cập Nhật",
      "roomNumber": "A305"
    },
    "title": "Hóa đơn tháng 06/2026 phòng A305",
    "amount": 1450000.00,
    "description": "Tiền điện nước và phí phòng tháng 06/2026",
    "dueDate": "2026-06-30T00:00:00.000Z",
    "createdAt": "2026-06-19T05:00:00.000Z",
    "status": "Pending",
    "electricityFee": 350000.00,
    "waterFee": 100000.00,
    "roomFee": 900000.00,
    "serviceFee": 100000.00,
    "payments": []
  }
  ```

#### Tạo hóa đơn mới (Create Invoice)
* **HTTP Method**: `POST`
* **Route**: `/api/invoices`
* **Quyền hạn**: `Admin, Manager, Staff`
* **Request Body (JSON)**:
  ```json
  {
    "userId": 12,
    "title": "Hóa đơn dịch vụ tháng 06/2026",
    "description": "Chi tiết tiền phòng dịch vụ",
    "electricityFee": 300000,
    "waterFee": 150000,
    "roomFee": 800000,
    "serviceFee": 50000,
    "dueDate": "2026-06-30T17:00:00.000Z",
    "status": "Pending"
  }
  ```
* **Response Body (201 Created)**:
  ```json
  {
    "id": 102,
    "userId": 12,
    "title": "Hóa đơn dịch vụ tháng 06/2026",
    "amount": 1300000.00,
    "description": "Chi tiết tiền phòng dịch vụ",
    "dueDate": "2026-06-30T17:00:00.000Z",
    "createdAt": "2026-06-19T05:15:00.000Z",
    "status": "Pending",
    "electricityFee": 300000.00,
    "waterFee": 150000.00,
    "roomFee": 800000.00,
    "serviceFee": 50000.00
  }
  ```

#### Cập nhật hóa đơn (Update Invoice)
* **HTTP Method**: `PUT`
* **Route**: `/api/invoices/{id}`
* **Quyền hạn**: `Admin, Manager, Staff`
* **Request Body (JSON)**:
  ```json
  {
    "title": "Hóa đơn dịch vụ cập nhật tháng 06/2026",
    "description": "Cập nhật chỉ số điện nước thực tế",
    "electricityFee": 320000,
    "waterFee": 150000,
    "roomFee": 800000,
    "serviceFee": 50000,
    "dueDate": "2026-06-30T17:00:00.000Z",
    "status": "Pending"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "id": 102,
    "userId": 12,
    "title": "Hóa đơn dịch vụ cập nhật tháng 06/2026",
    "amount": 1320000.00,
    "description": "Cập nhật chỉ số điện nước thực tế",
    "dueDate": "2026-06-30T17:00:00.000Z",
    "createdAt": "2026-06-19T05:15:00.000Z",
    "status": "Pending",
    "electricityFee": 320000.00,
    "waterFee": 150000.00,
    "roomFee": 800000.00,
    "serviceFee": 50000.00
  }
  ```

#### Xóa hóa đơn (Delete Invoice)
* **HTTP Method**: `DELETE`
* **Route**: `/api/invoices/{id}`
* **Quyền hạn**: `Admin, Manager, Staff`
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  {
    "message": "Xóa hóa đơn thành công."
  }
  ```

#### Đánh dấu Đã thanh toán (Mark Invoice Paid)
* **HTTP Method**: `POST`
* **Route**: `/api/payments` (Gửi thanh toán với số tiền còn thiếu sẽ tự động đổi trạng thái hóa đơn thành "Paid")
* **Quyền hạn**: `Admin, Manager, Staff, Student`
* **Request Body (JSON)**:
  ```json
  {
    "invoiceId": 102,
    "amount": 1320000.00,
    "paymentMethod": "Cash",
    "transactionId": "TXN_CASH_001",
    "status": "Success"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "message": "Thực hiện thanh toán thành công và cập nhật trạng thái hóa đơn.",
    "payment": {
      "id": 50,
      "invoiceId": 102,
      "amount": 1320000.00,
      "paymentDate": "2026-06-19T05:30:00.000Z",
      "paymentMethod": "Cash",
      "transactionId": "TXN_CASH_001",
      "status": "Success"
    }
  }
  ```

---

### 4. Payments (Xử lý Thanh toán)

#### Tạo thanh toán mới (Create Payment)
* **HTTP Method**: `POST`
* **Route**: `/api/payments`
* **Quyền hạn**: `Admin, Manager, Staff, Student` (Sinh viên chỉ được thanh toán hóa đơn của chính mình)
* **Request Body (JSON)**:
  ```json
  {
    "invoiceId": 101,
    "amount": 1450000.00,
    "paymentMethod": "BankTransfer",
    "transactionId": "FT26170X112456",
    "status": "Success"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "message": "Thực hiện thanh toán thành công và cập nhật trạng thái hóa đơn.",
    "payment": {
      "id": 51,
      "invoiceId": 101,
      "amount": 1450000.00,
      "paymentDate": "2026-06-19T05:35:00.000Z",
      "paymentMethod": "BankTransfer",
      "transactionId": "FT26170X112456",
      "status": "Success"
    }
  }
  ```

#### Xem lịch sử thanh toán (Get Payment History)
* **HTTP Method**: `GET`
* **Route**: `/api/payments` (Sinh viên sử dụng đường dẫn `/api/payments/my` để xem lịch sử của mình)
* **Quyền hạn**: `Admin, Manager, Staff, MaintenanceStaff` (Hoặc `Student` đối với `/api/payments/my`)
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  [
    {
      "id": 51,
      "invoiceId": 101,
      "invoice": {
        "id": 101,
        "title": "Hóa đơn tháng 06/2026 phòng A305",
        "user": {
          "id": 12,
          "username": "sinhvien_updated",
          "fullName": "Nguyễn Văn Sinh Viên Cập Nhật"
        }
      },
      "amount": 1450000.00,
      "paymentDate": "2026-06-19T05:35:00.000Z",
      "paymentMethod": "BankTransfer",
      "transactionId": "FT26170X112456",
      "status": "Success"
    }
  ]
  ```

#### Xác minh thanh toán (Verify Payment)
* **HTTP Method**: `POST`
* **Route**: `/api/payments/verify`
* **Quyền hạn**: `Admin, Manager, Staff`
* **Request Body (JSON)**:
  ```json
  {
    "paymentId": 51,
    "isVerified": true,
    "remarks": "Đối soát thành công với sao kê ngân hàng"
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "message": "Xác minh thanh toán thành công.",
    "paymentId": 51,
    "status": "Success",
    "verifiedAt": "2026-06-19T05:40:00.000Z"
  }
  ```

---

### 5. Maintenance Requests (Yêu cầu Sửa chữa / Bảo trì)

#### Tạo yêu cầu sửa chữa (Create Request)
* **HTTP Method**: `POST`
* **Route**: `/api/maintenance`
* **Quyền hạn**: `Student, Admin, Manager` (Sinh viên tạo cho chính phòng của mình)
* **Request Body (JSON)**:
  ```json
  {
    "title": "Hỏng điều hòa nhiệt độ",
    "description": "Điều hòa chảy nước và không làm lạnh phòng",
    "roomNumber": "A305",
    "repairCost": null
  }
  ```
* **Response Body (201 Created)**:
  ```json
  {
    "id": 201,
    "userId": 12,
    "title": "Hỏng điều hòa nhiệt độ",
    "description": "Điều hòa chảy nước và không làm lạnh phòng",
    "roomNumber": "A305",
    "status": "Pending",
    "createdAt": "2026-06-19T06:00:00.000Z",
    "resolvedAt": null,
    "technicianId": null,
    "repairCost": null
  }
  ```

#### Xem danh sách yêu cầu (Get Requests)
* **HTTP Method**: `GET`
* **Route**: `/api/maintenance` (Sinh viên dùng `/api/maintenance/my` để xem các yêu cầu của cá nhân)
* **Quyền hạn**: `Admin, Manager, Staff, MaintenanceStaff` (Hoặc `Student` đối với `/api/maintenance/my`)
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  [
    {
      "id": 201,
      "userId": 12,
      "user": {
        "id": 12,
        "fullName": "Nguyễn Văn Sinh Viên Cập Nhật",
        "roomNumber": "A305"
      },
      "title": "Hỏng điều hòa nhiệt độ",
      "description": "Điều hòa chảy nước và không làm lạnh phòng",
      "roomNumber": "A305",
      "status": "Pending",
      "createdAt": "2026-06-19T06:00:00.000Z",
      "resolvedAt": null,
      "technician": null,
      "repairCost": null
    }
  ]
  ```

#### Cập nhật trạng thái (Update Status)
* **HTTP Method**: `PUT`
* **Route**: `/api/maintenance/{id}/status`
* **Quyền hạn**: `Admin, Manager, Staff, MaintenanceStaff`
* **Request Body (JSON)**:
  ```json
  {
    "status": "InProgress",
    "technicianId": 2,
    "repairCost": 0.00
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "id": 201,
    "userId": 12,
    "title": "Hỏng điều hòa nhiệt độ",
    "description": "Điều hòa chảy nước và không làm lạnh phòng",
    "roomNumber": "A305",
    "status": "InProgress",
    "createdAt": "2026-06-19T06:00:00.000Z",
    "resolvedAt": null,
    "technicianId": 2,
    "repairCost": 0.00
  }
  ```

#### Phân công nhân sự (Assign Staff)
* **HTTP Method**: `PUT`
* **Route**: `/api/maintenance/{id}/status`
* **Quyền hạn**: `Admin, Manager, Staff`
* **Request Body (JSON)**:
  ```json
  {
    "status": "Approved",
    "technicianId": 2,
    "repairCost": null
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "id": 201,
    "userId": 12,
    "title": "Hỏng điều hòa nhiệt độ",
    "status": "Approved",
    "createdAt": "2026-06-19T06:00:00.000Z",
    "resolvedAt": null,
    "technicianId": 2,
    "repairCost": null
  }
  ```

#### Hoàn thành sửa chữa (Complete Request)
* **HTTP Method**: `PUT`
* **Route**: `/api/maintenance/{id}/status`
* **Quyền hạn**: `Admin, Manager, Staff, MaintenanceStaff`
* **Request Body (JSON)**:
  ```json
  {
    "status": "Completed",
    "technicianId": 2,
    "repairCost": 150000.00
  }
  ```
* **Response Body (200 OK)**:
  ```json
  {
    "id": 201,
    "userId": 12,
    "title": "Hỏng điều hòa nhiệt độ",
    "description": "Điều hòa chảy nước và không làm lạnh phòng",
    "roomNumber": "A305",
    "status": "Completed",
    "createdAt": "2026-06-19T06:00:00.000Z",
    "resolvedAt": "2026-06-19T08:30:00.000Z",
    "technicianId": 2,
    "repairCost": 150000.00
  }
  ```

---

### 6. Debts (Quản lý Công nợ)

#### Xem danh sách công nợ (Get Outstanding Debts)
* **HTTP Method**: `GET`
* **Route**: `/api/debts` (Sinh viên dùng `/api/debts/student/{studentId}` để tra cứu dư nợ cá nhân)
* **Quyền hạn**: `Admin, Staff, MaintenanceStaff` (Hoặc `Student` đối với `/api/debts/student/{studentId}`)
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  [
    {
      "userId": 12,
      "username": "sinhvien_updated",
      "fullName": "Nguyễn Văn Sinh Viên Cập Nhật",
      "email": "sinhvien_new@example.com",
      "totalInvoiceAmount": 2770000.00,
      "totalPaidAmount": 1450000.00,
      "remainingDebt": 1320000.00,
      "unpaidInvoices": [
        {
          "id": 102,
          "userId": 12,
          "title": "Hóa đơn dịch vụ cập nhật tháng 06/2026",
          "amount": 1320000.00,
          "description": "Cập nhật chỉ số điện nước thực tế",
          "dueDate": "2026-06-30T17:00:00.000Z",
          "createdAt": "2026-06-19T05:15:00.000Z",
          "status": "Pending"
        }
      ]
    }
  ]
  ```

#### Thống kê công nợ hệ thống (Debt Statistics)
* **HTTP Method**: `GET`
* **Route**: `/api/debts/stats`
* **Quyền hạn**: `Admin, Manager, Staff`
* **Request Body**: *Không có*
* **Response Body (200 OK)**:
  ```json
  {
    "totalOutstandingDebt": 18450000.00,
    "totalInvoicedAmount": 85000000.00,
    "totalCollectedAmount": 66550000.00,
    "unpaidInvoiceCount": 14,
    "overdueInvoiceCount": 5,
    "debtPercentage": 21.70
  }
  ```
