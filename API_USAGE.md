# Tài liệu Hướng dẫn Sử dụng API - KTX Billing & Maintenance Service

Tài liệu này hướng dẫn cách gọi các API của dịch vụ **Billing & Maintenance Service** (Quản lý hóa đơn & Bảo trì KTX).

## 1. Thông tin chung
* **Base URL mặc định (Local)**: `http://localhost:5300`
* **Base URL (Production)**: Đường dẫn dịch vụ được cung cấp sau khi deploy lên Render (Ví dụ: `https://billingmaintenanceservice.onrender.com`).
* **Định dạng dữ liệu**: `application/json`
* **Xác thực**: Sử dụng cơ chế **JWT (JSON Web Token)**. Tất cả các API yêu cầu xác thực phải gửi kèm Header:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

---

## 2. Danh sách các vai trò (Roles) trong hệ thống
Các API phân quyền dựa trên các vai trò:
* `Admin`: Toàn quyền hệ thống.
* `Manager`: Quản lý.
* `Staff`: Nhân viên kế toán / hành chính.
* `MaintenanceStaff`: Nhân viên kỹ thuật / sửa chữa.
* `Student`: Sinh viên (chỉ có quyền xem thông tin của chính mình, tạo yêu cầu sửa chữa và thanh toán hóa đơn).

---

## 3. Các API Xác thực (Authentication)
Các API này không yêu cầu Token (`[AllowAnonymous]`).

### Đăng ký tài khoản (Register)
* **Endpoint**: `POST /api/auth/register`
* **Body request**:
  ```json
  {
    "username": "student_test",
    "password": "mypassword123",
    "email": "student@ktx.local",
    "fullName": "Nguyễn Văn Sinh Viên",
    "phoneNumber": "0987654321",
    "role": "Student",
    "roomNumber": "Phòng 302"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Đăng ký thành công",
    "user": {
      "id": 3,
      "username": "student_test",
      "email": "student@ktx.local",
      "fullName": "Nguyễn Văn Sinh Viên",
      "phoneNumber": "0987654321",
      "role": "Student",
      "roomNumber": "Phòng 302",
      "createdAt": "2026-06-18T07:50:00Z"
    }
  }
  ```

### Đăng nhập (Login)
* **Endpoint**: `POST /api/auth/login`
* **Body request**:
  ```json
  {
    "username": "student_test", 
    "password": "mypassword123"
  }
  ```
  *(Có thể đăng nhập bằng `username` hoặc `email`)*
* **Response (200 OK)**:
  ```json
  {
    "message": "Đăng nhập thành công",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "username": "student_test",
      "email": "student@ktx.local",
      "fullName": "Nguyễn Văn Sinh Viên",
      "phoneNumber": "0987654321",
      "role": "Student",
      "roomNumber": "Phòng 302",
      "createdAt": "2026-06-18T07:50:00Z"
    }
  }
  ```

---

## 4. Quản lý Tài khoản (Users API)
* **Yêu cầu xác thực**: Quyền `Admin` hoặc `Manager`.

### Lấy danh sách toàn bộ tài khoản
* **Endpoint**: `GET /api/users`
* **Response (200 OK)**: Danh sách chứa thông tin rút gọn các tài khoản.

### Lấy chi tiết tài khoản theo ID
* **Endpoint**: `GET /api/users/{id}`

### Tạo tài khoản mới
* **Endpoint**: `POST /api/users`
* **Body request**: (Tương tự thông tin Register)

### Cập nhật tài khoản theo ID
* **Endpoint**: `PUT /api/users/{id}`
* **Body request**:
  ```json
  {
    "username": "new_username",
    "email": "updated_email@ktx.local",
    "fullName": "Tên Mới",
    "phoneNumber": "0900000000",
    "role": "Student",
    "roomNumber": "Phòng 305",
    "password": "newpassword123"
  }
  ```
  *(Các trường đều không bắt buộc, chỉ gửi lên những trường cần cập nhật)*

### Xóa tài khoản
* **Endpoint**: `DELETE /api/users/{id}`

---

## 5. Quản lý Hóa đơn (Invoices API)

### Lấy toàn bộ hóa đơn
* **Endpoint**: `GET /api/invoices`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`, `MaintenanceStaff`

### Lấy danh sách hóa đơn của cá nhân tôi (Đang đăng nhập)
* **Endpoint**: `GET /api/invoices/my`
* **Yêu cầu vai trò**: `Student`, `Admin`, `Manager`

### Lấy chi tiết một hóa đơn theo ID
* **Endpoint**: `GET /api/invoices/{id}`
* **Yêu cầu vai trò**: Tất cả vai trò đều có thể xem nếu hợp lệ.

### Tạo hóa đơn mới
* **Endpoint**: `POST /api/invoices`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`
* **Body request**:
  ```json
  {
    "userId": 3,
    "title": "Hóa đơn dịch vụ tháng 6/2026",
    "description": "Tiền điện nước và vệ sinh định kỳ",
    "electricityFee": 150000.0,
    "waterFee": 40000.0,
    "roomFee": 1000000.0,
    "serviceFee": 30000.0,
    "dueDate": "2026-06-25T00:00:00Z",
    "status": "Pending"
  }
  ```
  *(Trạng thái mặc định là `Pending` nếu không truyền, hệ thống sẽ tự tính `Amount = electricityFee + waterFee + roomFee + serviceFee`)*

### Cập nhật hóa đơn
* **Endpoint**: `PUT /api/invoices/{id}`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`
* **Body request**: (Chỉ truyền các trường cần thay đổi)

### Xóa hóa đơn
* **Endpoint**: `DELETE /api/invoices/{id}`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`

---

## 6. Quản lý Thanh toán (Payments API)

### Lấy lịch sử thanh toán toàn hệ thống
* **Endpoint**: `GET /api/payments`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`, `MaintenanceStaff`

### Lấy lịch sử thanh toán của cá nhân tôi (Đang đăng nhập)
* **Endpoint**: `GET /api/payments/my`
* **Yêu cầu vai trò**: `Student`, `Admin`, `Manager`

### Thanh toán hóa đơn
* **Endpoint**: `POST /api/payments`
* **Yêu cầu vai trò**: `Student`, `Admin`, `Manager`, `Staff`
* **Body request**:
  ```json
  {
    "invoiceId": 1,
    "amount": 1220000.0,
    "paymentMethod": "Momo",
    "transactionId": "TX10023948293",
    "status": "Success"
  }
  ```
  *(Khi tổng số tiền thanh toán `amount` của các giao dịch thành công bằng hoặc lớn hơn số tiền hóa đơn cần đóng, trạng thái của hóa đơn sẽ tự động chuyển từ `Pending` sang `Paid`)*

---

## 7. Quản lý Yêu cầu Sửa chữa / Bảo trì (Maintenance API)

### Lấy toàn bộ danh sách yêu cầu bảo trì
* **Endpoint**: `GET /api/maintenance` (hoặc `/api/maintenancerequests`)
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`, `MaintenanceStaff`

### Lấy các yêu cầu bảo trì của tôi
* **Endpoint**: `GET /api/maintenance/my`
* **Yêu cầu vai trò**: `Student`, `Admin`, `Manager`

### Tạo yêu cầu sửa chữa mới
* **Endpoint**: `POST /api/maintenance` (hoặc `/api/maintenancerequests`)
* **Yêu cầu vai trò**: `Student`, `Admin`, `Manager`
* **Body request**:
  ```json
  {
    "title": "Bóng đèn phòng học bị cháy",
    "description": "Bóng đèn huỳnh quang nhấp nháy liên tục rồi tắt hẳn.",
    "roomNumber": "Phòng 102",
    "repairCost": 0.0
  }
  ```
  *(Sinh viên không cần truyền `userId`, hệ thống tự lấy của người đang đăng nhập)*

### Cập nhật trạng thái yêu cầu bảo trì (Phân công & Ghi nhận chi phí)
* **Endpoint**: `PUT /api/maintenance/{id}/status`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`, `MaintenanceStaff`
* **Body request**:
  ```json
  {
    "status": "Processing",
    "technicianId": 2,
    "repairCost": 50000.0
  }
  ```
  *(Trạng thái có thể cập nhật: `Pending`, `Processing`, `Completed`, `Cancelled`)*

---

## 8. Quản lý Công nợ (Debts API)

### Xem tổng quan nợ và hóa đơn chưa thanh toán của tất cả sinh viên
* **Endpoint**: `GET /api/debts`
* **Yêu cầu vai trò**: `Admin`, `Staff`, `MaintenanceStaff`

### Xem công nợ chi tiết của một sinh viên cụ thể
* **Endpoint**: `GET /api/debts/student/{studentId}`
* **Yêu cầu vai trò**: `Admin`, `Staff`, `MaintenanceStaff`, `Student`

---

## 9. Quản lý Hợp đồng nội trú (Contracts API)

### Lấy toàn bộ danh sách hợp đồng
* **Endpoint**: `GET /api/contracts`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`

### Lấy danh sách hợp đồng của tôi
* **Endpoint**: `GET /api/contracts/my`
* **Yêu cầu vai trò**: `Student`, `Admin`, `Manager`

### Lấy chi tiết hợp đồng theo ID
* **Endpoint**: `GET /api/contracts/{id}`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`, `Student` (Sinh viên chỉ được xem hợp đồng của chính mình)

### Tạo hợp đồng mới cho sinh viên
* **Endpoint**: `POST /api/contracts`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`
* **Body request**:
  ```json
  {
    "userId": 3,
    "roomNumber": "Room 302",
    "startDate": "2026-09-01T00:00:00Z",
    "endDate": "2027-06-30T00:00:00Z",
    "roomFee": 1200000.0,
    "status": "Active"
  }
  ```
  *(Khi tạo mới hợp đồng, hệ thống sẽ tự động cập nhật số phòng `roomNumber` vào thông tin của sinh viên tương ứng).*

### Cập nhật hợp đồng theo ID
* **Endpoint**: `PUT /api/contracts/{id}`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`
* **Body request**: (Truyền các trường cần cập nhật)
  ```json
  {
    "roomNumber": "Room 305",
    "roomFee": 1300000.0,
    "status": "Active"
  }
  ```

### Xóa hợp đồng
* **Endpoint**: `DELETE /api/contracts/{id}`
* **Yêu cầu vai trò**: `Admin`, `Manager`, `Staff`

---

## 10. Danh sách Kỹ thuật viên (Technicians API)

### Lấy danh sách toàn bộ kỹ thuật viên sửa chữa
* **Endpoint**: `GET /api/technicians`
* **Yêu cầu vai trò**: Tất cả vai trò đã đăng nhập đều có thể gọi (để chọn khi phân công bảo trì).
* **Response (200 OK)**:
  ```json
  [
    { "id": 1, "name": "Nguyễn Văn Hùng" },
    { "id": 2, "name": "Trần Minh Tuấn" },
    { "id": 3, "name": "Lê Quốc Bảo" },
    { "id": 4, "name": "Phạm Văn Nam" }
  ]
  ```
