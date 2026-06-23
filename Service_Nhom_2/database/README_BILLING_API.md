# Tài liệu Hướng dẫn Sử dụng API - KTX Billing & Maintenance Service

Tài liệu này hướng dẫn cách gọi các API của dịch vụ **Billing & Maintenance Service** (Quản lý hóa đơn & Báo trì KTX).

## 1. Thông tin chung
* **Base URL mặc định (Local)**: `http://localhost:5300`
* **Base URL (Production)**: `https://billing-maintenance-backend.onrender.com`
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

### Đăng nhập (Login)
* **Endpoint**: `POST /api/auth/login`
* **Body request**:
  ```json
  {
    "username": "student_test", 
    "password": "mypassword123"
  }
  ```

---

## 4. Quản lý Tài khoản (Users API)
* `GET /api/users`
* `GET /api/users/{id}`
* `POST /api/users`
* `PUT /api/users/{id}`
* `DELETE /api/users/{id}`

---

## 5. Quản lý Hóa đơn (Invoices API)
* `GET /api/invoices`
* `GET /api/invoices/my`
* `GET /api/invoices/{id}`
* `POST /api/invoices`
* `PUT /api/invoices/{id}`
* `DELETE /api/invoices/{id}`

---

## 6. Quản lý Thanh toán (Payments API)
* `GET /api/payments`
* `GET /api/payments/my`
* `POST /api/payments`

---

## 7. Quản lý Yêu cầu Sửa chữa / Bảo trì (Maintenance API)
* `GET /api/maintenance` (hoặc `/api/maintenancerequests`)
* `GET /api/maintenance/my`
* `POST /api/maintenance`
* `PUT /api/maintenance/{id}/status`

---

## 8. Quản lý Công nợ (Debts API)
* `GET /api/debts`
* `GET /api/debts/student/{studentId}`
