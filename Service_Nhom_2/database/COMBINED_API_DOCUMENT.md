# 📋 TÀI LIỆU CƠ SỞ DỮ LIỆU & API - HỆ THỐNG QUẢN LÝ HỢP ĐỒNG SINH VIÊN (NHÓM 2)

> **Ngày tạo:** 18/06/2026  
> **Project:** ContractStudentService  
> **Database:** PostgreSQL (Render Cloud)  
> **API Framework:** ASP.NET Core 8.0

---

## 📦 1. THÔNG TIN KẾT NỐI CƠ SỞ DỮ LIỆU

### PostgreSQL - Render Cloud

| Thông tin | Giá trị |
|-----------|---------|
| **Host** | `dpg-d8povc6gvqtc739d7s2g-a.singapore-postgres.render.com` |
| **Port** | `5432` |
| **Database** | `contractdb_2lwo` |
| **Username** | `contractuser` |
| **Password** | `PAy3YtgdJMlvxPacNBPrg2C9DaOO2Oob` |
| **SSL Mode** | `Require` |

### Connection String (dạng URL)
```
postgresql://contractuser:PAy3YtgdJMlvxPacNBPrg2C9DaOO2Oob@dpg-d8povc6gvqtc739d7s2g-a.singapore-postgres.render.com:5432/contractdb_2lwo
```

### Connection String (dạng .NET)
```
Host=dpg-d8povc6gvqtc739d7s2g-a.singapore-postgres.render.com;Port=5432;Database=contractdb_2lwo;Username=contractuser;Password=PAy3YtgdJMlvxPacNBPrg2C9DaOO2Oob;SSL Mode=Require;Trust Server Certificate=true
```

> ⚠️ **Lưu ý:** Database Render Free plan sẽ tự xóa sau 90 ngày không hoạt động.

---

## 🗄️ 2. SƠ ĐỒ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

### 2.1. Sơ đồ quan hệ (ER Diagram)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Students   │──1:N──│ RoomApplications │     │             │
│             │       └──────────────────┘     │             │
│             │──1:N──┌──────────────────┐     │ Contract    │
│             │       │    Contracts     │──1:N──│ Histories   │
│             │       │                  │     │             │
│             │       └──────────────────┘     └─────────────┘
│             │──1:N──┌──────────────────┐
│             │       │   Occupancies    │
└─────────────┘       └──────────────────┘
                             │
                      Contracts ──1:N── Occupancies
                      RoomApplications ──1:N── Contracts (qua ApplicationId)
```

---

### 2.2. Bảng: `Students` (Sinh viên)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|-------|
| `Id` | `uuid` | **PK** | ID sinh viên |
| `StudentCode` | `varchar(20)` | **UNIQUE, NOT NULL** | Mã sinh viên (VD: SV001) |
| `FullName` | `varchar(100)` | **NOT NULL** | Họ tên đầy đủ |
| `Gender` | `varchar(20)` | **NOT NULL** | Giới tính: `MALE`, `FEMALE`, `OTHER` |
| `DateOfBirth` | `timestamp` | **NOT NULL** | Ngày sinh |
| `CitizenId` | `varchar(20)` | **UNIQUE** (nullable) | Số CCCD |
| `Faculty` | `varchar(100)` | **NOT NULL** | Khoa |
| `ClassName` | `varchar(50)` | nullable | Lớp |
| `PhoneNumber` | `varchar(20)` | nullable | Số điện thoại |
| `Email` | `varchar(100)` | nullable | Email |
| `Address` | `varchar(255)` | nullable | Địa chỉ |
| `GuardianName` | `varchar(100)` | nullable | Tên phụ huynh |
| `GuardianPhone` | `varchar(20)` | nullable | SĐT phụ huynh |
| `Status` | `varchar(30)` | **NOT NULL** | Trạng thái: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED` |
| `CreatedAt` | `timestamp` | **NOT NULL** | Ngày tạo |
| `UpdatedAt` | `timestamp` | nullable | Ngày cập nhật |

**Indexes:**
- `IX_Students_StudentCode` (UNIQUE)
- `IX_Students_CitizenId` (UNIQUE)

---

### 2.3. Bảng: `RoomApplications` (Đơn đăng ký phòng)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|-------|
| `Id` | `uuid` | **PK** | ID đơn đăng ký |
| `StudentId` | `uuid` | **FK → Students.Id**, NOT NULL | ID sinh viên |
| `BuildingId` | `uuid` | **NOT NULL** | ID tòa nhà (từ Nhóm 1) |
| `RoomTypeId` | `uuid` | **NOT NULL** | ID loại phòng (từ Nhóm 1) |
| `PreferredFloor` | `integer` | nullable | Tầng ưu tiên |
| `ExpectedStartDate` | `timestamp` | **NOT NULL** | Ngày bắt đầu mong muốn |
| `ExpectedEndDate` | `timestamp` | **NOT NULL** | Ngày kết thúc mong muốn |
| `Note` | `varchar(500)` | nullable | Ghi chú |
| `Status` | `varchar(30)` | **NOT NULL** | Trạng thái: `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `SubmittedAt` | `timestamp` | nullable | Thời gian nộp |
| `ApprovedBy` | `varchar(100)` | nullable | Người duyệt |
| `ApprovedAt` | `timestamp` | nullable | Thời gian duyệt |
| `RejectedBy` | `varchar(100)` | nullable | Người từ chối |
| `RejectReason` | `varchar(500)` | nullable | Lý do từ chối |
| `CancelReason` | `varchar(500)` | nullable | Lý do hủy |
| `CreatedAt` | `timestamp` | **NOT NULL** | Ngày tạo |
| `UpdatedAt` | `timestamp` | nullable | Ngày cập nhật |

**Foreign Keys:**
- `FK_RoomApplications_Students_StudentId` → `Students.Id` (ON DELETE RESTRICT)

---

### 2.4. Bảng: `Contracts` (Hợp đồng)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|-------|
| `Id` | `uuid` | **PK** | ID hợp đồng |
| `ContractCode` | `varchar(30)` | **UNIQUE, NOT NULL** | Mã hợp đồng (VD: HD-2026-0001) |
| `ApplicationId` | `uuid` | **FK → RoomApplications.Id**, nullable | ID đơn đăng ký liên quan |
| `StudentId` | `uuid` | **FK → Students.Id**, NOT NULL | ID sinh viên |
| `StudentCodeSnapshot` | `varchar(20)` | **NOT NULL** | Snapshot mã SV tại thời điểm tạo HĐ |
| `StudentNameSnapshot` | `varchar(100)` | **NOT NULL** | Snapshot tên SV tại thời điểm tạo HĐ |
| `BuildingId` | `uuid` | **NOT NULL** | ID tòa nhà |
| `RoomTypeId` | `uuid` | **NOT NULL** | ID loại phòng |
| `RoomId` | `uuid` | **NOT NULL** | ID phòng |
| `BedId` | `uuid` | **NOT NULL** | ID giường |
| `BuildingNameSnapshot` | `varchar(100)` | nullable | Snapshot tên tòa nhà |
| `RoomNumberSnapshot` | `varchar(20)` | nullable | Snapshot số phòng |
| `BedNumberSnapshot` | `varchar(20)` | nullable | Snapshot số giường |
| `RoomTypeNameSnapshot` | `varchar(50)` | nullable | Snapshot tên loại phòng |
| `StartDate` | `timestamp` | **NOT NULL** | Ngày bắt đầu hợp đồng |
| `EndDate` | `timestamp` | **NOT NULL** | Ngày kết thúc hợp đồng |
| `MonthlyPrice` | `decimal(18,2)` | **NOT NULL** | Giá phòng hàng tháng (VNĐ) |
| `DepositAmount` | `decimal(18,2)` | **NOT NULL** | Tiền đặt cọc (VNĐ) |
| `PaymentCycle` | `varchar(20)` | **NOT NULL** | Chu kỳ thanh toán: `MONTHLY`, `SEMESTER`, `YEARLY` |
| `Status` | `varchar(30)` | **NOT NULL** | Trạng thái: `PENDING`, `ACTIVE`, `EXPIRED`, `TERMINATED`, `CANCELLED` |
| `SignedAt` | `timestamp` | nullable | Thời gian ký HĐ |
| `TerminatedAt` | `timestamp` | nullable | Thời gian chấm dứt HĐ |
| `TerminateReason` | `varchar(500)` | nullable | Lý do chấm dứt |
| `Note` | `varchar(500)` | nullable | Ghi chú |
| `CreatedAt` | `timestamp` | **NOT NULL** | Ngày tạo |
| `UpdatedAt` | `timestamp` | nullable | Ngày cập nhật |

**Foreign Keys:**
- `FK_Contracts_Students_StudentId` → `Students.Id` (ON DELETE RESTRICT)
- `FK_Contracts_RoomApplications_ApplicationId` → `RoomApplications.Id` (ON DELETE SET NULL)

**Indexes:**
- `IX_Contracts_ContractCode` (UNIQUE)
- `IX_Contracts_StudentId`
- `IX_Contracts_ApplicationId`

---

### 2.5. Bảng: `Occupancies` (Lịch sử ở)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|-------|
| `Id` | `uuid` | **PK** | ID bản ghi |
| `StudentId` | `uuid` | **FK → Students.Id**, NOT NULL | ID sinh viên |
| `ContractId` | `uuid` | **FK → Contracts.Id**, NOT NULL | ID hợp đồng |
| `RoomId` | `uuid` | **NOT NULL** | ID phòng |
| `BedId` | `uuid` | **NOT NULL** | ID giường |
| `RoomNumberSnapshot` | `varchar(20)` | nullable | Snapshot số phòng |
| `BedNumberSnapshot` | `varchar(20)` | nullable | Snapshot số giường |
| `CheckInDate` | `timestamp` | **NOT NULL** | Ngày nhận phòng |
| `CheckOutDate` | `timestamp` | nullable | Ngày trả phòng |
| `Status` | `varchar(30)` | **NOT NULL** | Trạng thái: `ACTIVE`, `CHECKED_OUT` |
| `CreatedAt` | `timestamp` | **NOT NULL** | Ngày tạo |
| `UpdatedAt` | `timestamp` | nullable | Ngày cập nhật |

**Foreign Keys:**
- `FK_Occupancies_Students_StudentId` → `Students.Id` (ON DELETE RESTRICT)
- `FK_Occupancies_Contracts_ContractId` → `Contracts.Id` (ON DELETE RESTRICT)

---

### 2.6. Bảng: `ContractHistories` (Lịch sử thay đổi hợp đồng)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|-------|
| `Id` | `uuid` | **PK** | ID bản ghi |
| `ContractId` | `uuid` | **FK → Contracts.Id**, NOT NULL | ID hợp đồng |
| `Action` | `varchar(50)` | **NOT NULL** | Hành động (VD: CREATE, ACTIVATE, TERMINATE) |
| `OldValue` | `text` | nullable | Giá trị cũ (JSON) |
| `NewValue` | `text` | nullable | Giá trị mới (JSON) |
| `Reason` | `varchar(500)` | nullable | Lý do thay đổi |
| `ChangedBy` | `varchar(100)` | nullable | Người thay đổi |
| `ChangedAt` | `timestamp` | **NOT NULL** | Thời gian thay đổi |

**Foreign Keys:**
- `FK_ContractHistories_Contracts_ContractId` → `Contracts.Id` (ON DELETE CASCADE)

---

## 📊 3. ENUM VALUES (Giá trị trạng thái)

### Gender (Giới tính)
| Giá trị | Mô tả |
|---------|-------|
| `MALE` | Nam |
| `FEMALE` | Nữ |
| `OTHER` | Khác |

### StudentStatus (Trạng thái sinh viên)
| Giá trị | Mô tả |
|---------|-------|
| `ACTIVE` | Đang hoạt động |
| `INACTIVE` | Ngừng hoạt động |
| `SUSPENDED` | Đình chỉ |
| `GRADUATED` | Đã tốt nghiệp |

### ApplicationStatus (Trạng thái đơn đăng ký)
| Giá trị | Mô tả |
|---------|-------|
| `DRAFT` | Bản nháp |
| `SUBMITTED` | Đã nộp |
| `APPROVED` | Đã duyệt |
| `REJECTED` | Bị từ chối |
| `CANCELLED` | Đã hủy |

### ContractStatus (Trạng thái hợp đồng)
| Giá trị | Mô tả |
|---------|-------|
| `PENDING` | Chờ xử lý |
| `ACTIVE` | Đang hiệu lực |
| `EXPIRED` | Hết hạn |
| `TERMINATED` | Đã chấm dứt |
| `CANCELLED` | Đã hủy |

### OccupancyStatus (Trạng thái ở)
| Giá trị | Mô tả |
|---------|-------|
| `ACTIVE` | Đang ở |
| `CHECKED_OUT` | Đã trả phòng |

### PaymentCycle (Chu kỳ thanh toán)
| Giá trị | Mô tả |
|---------|-------|
| `MONTHLY` | Hàng tháng |
| `SEMESTER` | Theo học kỳ |
| `YEARLY` | Hàng năm |

---

## 🌐 4. API ENDPOINTS

### Base URL
```
http://localhost:5000
```

### Swagger UI (Tài liệu API tương tác)
```
http://localhost:5000/swagger
```

### CORS
API đã cấu hình **AllowAll** - cho phép mọi origin, method, header.

---

### 4.1. Students API (Quản lý sinh viên)

#### `GET /api/students` — Danh sách sinh viên (có phân trang & filter)

**Query Parameters:**

| Param | Type | Mô tả |
|-------|------|-------|
| `keyword` | string | Tìm theo mã SV, tên, email, SĐT, CCCD |
| `faculty` | string | Lọc theo khoa |
| `className` | string | Lọc theo lớp |
| `gender` | string | Lọc theo giới tính: `MALE`, `FEMALE`, `OTHER` |
| `status` | string | Lọc theo trạng thái: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED` |
| `hasActiveContract` | boolean | Lọc SV có hợp đồng active |
| `page` | int | Số trang (mặc định: 1) |
| `pageSize` | int | Số item/trang (mặc định: 10) |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "930b5e14-1813-4711-b8fe-ab8b27ef2f84",
      "studentCode": "SV001",
      "fullName": "Nguyen Van A",
      "gender": "MALE",
      "dateOfBirth": "2004-05-20",
      "faculty": "Cong nghe thong tin",
      "className": "CNTT15A",
      "phoneNumber": "0987654321",
      "email": "sva@example.com",
      "status": "ACTIVE",
      "hasActiveContract": true,
      "activeRoomId": "5d28a292-2aac-4391-b9f4-9d4854d8d709",
      "activeRoomNumber": "A101",
      "createdAt": "2026-05-18T08:00:00Z",
      "updatedAt": null
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalItems": 5,
  "totalPages": 1
}
```

---

#### `GET /api/students/{id}` — Chi tiết sinh viên theo ID

**Response (200 OK):**
```json
{
  "id": "930b5e14-1813-4711-b8fe-ab8b27ef2f84",
  "studentCode": "SV001",
  "fullName": "Nguyen Van A",
  "gender": "MALE",
  "dateOfBirth": "2004-05-20",
  "citizenId": "001204000001",
  "faculty": "Cong nghe thong tin",
  "className": "CNTT15A",
  "phoneNumber": "0987654321",
  "email": "sva@example.com",
  "address": "Ha Noi",
  "guardianName": "Nguyen Van B",
  "guardianPhone": "0912345678",
  "status": "ACTIVE",
  "createdAt": "2026-05-18T08:00:00Z",
  "updatedAt": null
}
```

**Response (404 Not Found):**
```json
{ "message": "Student not found." }
```

---

#### `GET /api/students/code/{studentCode}` — Tìm sinh viên theo mã SV

**Ví dụ:** `GET /api/students/code/SV001`

**Response:** Giống `GET /api/students/{id}`

---

#### `GET /api/students/{id}/summary` — Tóm tắt sinh viên (bao gồm HĐ & đơn đăng ký)

**Response (200 OK):**
```json
{
  "student": {
    "id": "930b5e14-...",
    "studentCode": "SV001",
    "fullName": "Nguyen Van A",
    "gender": "MALE",
    "faculty": "Cong nghe thong tin",
    "className": "CNTT15A",
    "status": "ACTIVE"
  },
  "activeContract": {
    "id": "0b27af9e-...",
    "contractCode": "HD-2026-0001",
    "roomId": "5d28a292-...",
    "roomNumberSnapshot": "A101",
    "bedNumberSnapshot": "A101-01",
    "startDate": "2026-09-01",
    "endDate": "2027-06-30",
    "status": "ACTIVE"
  },
  "latestApplication": {
    "id": "f43c7d6d-...",
    "status": "APPROVED",
    "expectedStartDate": "2026-09-01",
    "expectedEndDate": "2027-06-30"
  }
}
```

---

#### `POST /api/students` — Tạo sinh viên mới

**Request Body:**
```json
{
  "studentCode": "SV006",
  "fullName": "Vo Thi F",
  "gender": "FEMALE",
  "dateOfBirth": "2004-08-15",
  "citizenId": "001204000006",
  "faculty": "Ngoai ngu",
  "className": "NN15A",
  "phoneNumber": "0932109876",
  "email": "vtf@example.com",
  "address": "Hue",
  "guardianName": "Vo Van G",
  "guardianPhone": "0967890123"
}
```

**Response (201 Created):** Trả về `StudentResponse` (giống GET by ID)

**Response (400 Bad Request):**
```json
{ "message": "StudentCode 'SV006' da ton tai." }
```

**Validation Rules:**
- `studentCode`: Bắt buộc, tối đa 20 ký tự, **UNIQUE**
- `fullName`: Bắt buộc, tối đa 100 ký tự
- `gender`: Bắt buộc, giá trị: `MALE`, `FEMALE`, `OTHER`
- `dateOfBirth`: Bắt buộc, không lớn hơn ngày hiện tại
- `citizenId`: Tối đa 20 ký tự, **UNIQUE** (nếu có)
- `faculty`: Bắt buộc, tối đa 100 ký tự
- `email`: Phải đúng format email

---

#### `PUT /api/students/{id}` — Cập nhật sinh viên

**Request Body:** Giống `POST` (tất cả trường bắt buộc)

**Business Rules:**
- Không cập nhật được SV đã tốt nghiệp (`GRADUATED`)
- Không đổi `StudentCode` nếu SV đã có hợp đồng
- `citizenId` phải unique

---

#### `PATCH /api/students/{id}/contact` — Cập nhật thông tin liên hệ

**Request Body:**
```json
{
  "phoneNumber": "0999888777",
  "email": "newemail@example.com",
  "address": "Da Nang",
  "guardianName": "Nguyen Van New",
  "guardianPhone": "0911222333"
}
```

---

#### `PATCH /api/students/{id}/status` — Cập nhật trạng thái sinh viên

**Request Body:**
```json
{
  "status": "SUSPENDED",
  "reason": "Vi pham noi quy"
}
```

**Business Rules:**
- `status`: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED`
- `reason` bắt buộc khi `status = SUSPENDED`
- Không chuyển `INACTIVE`/`GRADUATED` nếu SV có hợp đồng ACTIVE

---

#### `DELETE /api/students/{id}` — Xóa sinh viên

**Business Rules:**
- Không xóa được SV có hợp đồng ACTIVE
- Nếu SV có hợp đồng/đơn cũ → **Soft delete** (chuyển status = INACTIVE)
- Nếu SV chưa có hợp đồng/đơn → **Hard delete** (xóa hẳn)

**Response (204 No Content):** Thành công

---

## 🗃️ 5. DỮ LIỆU MẪU (SEED DATA)

Database hiện có sẵn dữ liệu mẫu sau:

### 5 Sinh viên

| STT | Mã SV | Họ tên | Giới tính | Khoa | Lớp | Trạng thái |
|-----|-------|--------|-----------|------|-----|------------|
| 1 | SV001 | Nguyen Van A | MALE | Cong nghe thong tin | CNTT15A | ACTIVE |
| 2 | SV002 | Tran Thi B | FEMALE | Kinh te | KT15B | ACTIVE |
| 3 | SV003 | Le Van C | MALE | Co khi | CK14A | ACTIVE |
| 4 | SV004 | Pham Thi D | FEMALE | Cong nghe thong tin | CNTT15B | ACTIVE |
| 5 | SV005 | Hoang Van E | MALE | Dien tu | DT14C | INACTIVE |

### 3 Đơn đăng ký phòng

| Sinh viên | Trạng thái | Ghi chú |
|-----------|------------|---------|
| SV001 | APPROVED | Muon o tang thap |
| SV002 | SUBMITTED | Muon o phong 4 nguoi |
| SV003 | DRAFT | - |

### 1 Hợp đồng

| Mã HĐ | Sinh viên | Phòng | Giường | Giá/tháng | Đặt cọc | Trạng thái |
|--------|-----------|-------|--------|-----------|---------|------------|
| HD-2026-0001 | SV001 | A101 | A101-01 | 1,200,000 VNĐ | 500,000 VNĐ | ACTIVE |

### 1 Bản ghi Occupancy

| Sinh viên | Phòng | Giường | Ngày nhận phòng | Trạng thái |
|-----------|-------|--------|-----------------|------------|
| SV001 | A101 | A101-01 | 01/09/2026 | ACTIVE |

---

## 🔧 6. HƯỚNG DẪN CHẠY API LOCAL

### Yêu cầu
- .NET SDK 8.0+
- Internet (để kết nối PostgreSQL trên Render)

### Chạy API
```bash
cd API_CONTRACT_NHOM2_FULL
dotnet run --urls "http://localhost:5000"
```

### Test nhanh
```bash
# Lấy danh sách sinh viên
curl http://localhost:5000/api/students

# Tìm sinh viên theo mã
curl http://localhost:5000/api/students/code/SV001

# Mở Swagger UI
# Truy cập: http://localhost:5000/swagger
```

---

## 📌 7. LƯU Ý CHO NHÓM WEB

1. **CORS đã mở**: API cho phép gọi từ mọi origin, không cần cấu hình thêm.

2. **Phân trang**: API GET danh sách trả về object `PagedResult` với `items`, `page`, `pageSize`, `totalItems`, `totalPages`.

3. **Date Format**: Các trường ngày trong response được format dạng `yyyy-MM-dd` (ví dụ: `2026-09-01`).

4. **Error Handling**:
   - `400 Bad Request`: Lỗi validation hoặc business logic → `{ "message": "..." }`
   - `404 Not Found`: Không tìm thấy resource → `{ "message": "Student not found." }`
   - `204 No Content`: Thao tác thành công (PATCH status, DELETE)
   - `201 Created`: Tạo mới thành công

5. **ID Format**: Tất cả ID đều là `UUID/GUID` (ví dụ: `930b5e14-1813-4711-b8fe-ab8b27ef2f84`).

6. **BuildingId, RoomId, BedId, RoomTypeId**: Các ID này tham chiếu đến dữ liệu từ **Nhóm 1** (quản lý cơ sở vật chất). Trong database hiện tại, các ID này là random GUIDs.


# Room & Building API Guide

Tai lieu nay tong hop API cua nhom 1 - `RoomBuildingService`, dung de:

- demo chuc nang
- ket noi frontend `Qly_ktx`
- cho 2 nhom con lai goi du lieu
- doi chieu nhanh request/response

## 1. Tong quan

Service phu trach cac nghiep vu:

- CRUD toa nha
- CRUD loai phong va tien nghi
- CRUD phong
- Quan ly giuong trong phong
- Quan ly thiet bi trong phong
- Tra cuu phong kha dung
- Xem so do phong theo tang
- Cap nhat trang thai phong

Base URL hien tai tren Render:

```txt
https://roombuildingservice-1ijx.onrender.com
```

Swagger:

```txt
https://roombuildingservice-1ijx.onrender.com/swagger/index.html
```

## 2. So do nghiep vu

```mermaid
flowchart TD
    B[Building] --> R[Room]
    RT[RoomType] --> R
    R --> BD[Bed]
    R --> EQ[Equipment]
    RT --> AM[Amenities]

    B --> AV[Tra cuu phong kha dung]
    RT --> AV
    R --> FM[So do tang]
```

## 3. So do quan he du lieu

```mermaid
erDiagram
    BUILDING ||--o{ ROOM : contains
    ROOM_TYPE ||--o{ ROOM : classifies
    ROOM ||--o{ BED : has
    ROOM ||--o{ ROOM_EQUIPMENT : has
    ROOM_TYPE ||--o{ ROOM_AMENITY : has

    BUILDING {
        guid Id
        string Name
        int TotalFloors
        string GenderType
        string Status
        string Description
    }

    ROOM_TYPE {
        guid Id
        string TypeName
        int Capacity
        decimal BasePrice
        string ImageUrl
        string Description
    }

    ROOM {
        guid Id
        guid BuildingId
        guid RoomTypeId
        string RoomNumber
        int FloorNumber
        string ImageUrl
        string Status
        string MaintenanceReason
    }

    BED {
        guid Id
        guid RoomId
        string BedNumber
        string Status
    }

    ROOM_EQUIPMENT {
        guid Id
        guid RoomId
        string EquipmentName
        int EquipmentIndex
        string Status
    }
```

## 4. Chuan gia tri dung trong API

### GenderType

- `MALE`
- `FEMALE`
- `MIXED`

Backend cung chap nhan:

- `Nam` -> `MALE`
- `Nu` -> `FEMALE`
- `HonHop` -> `MIXED`

### Building Status

- `ACTIVE`
- `INACTIVE`
- `UNDER_MAINTENANCE`

### Room Status

- `AVAILABLE`
- `FULL`
- `UNDER_MAINTENANCE`
- `INACTIVE`

### Bed Status

- `AVAILABLE`
- `OCCUPIED`
- `UNDER_MAINTENANCE`

### Equipment Status

- `ACTIVE`
- `UNDER_MAINTENANCE`
- `BROKEN`
- `RETIRED`

## 5. Bang tong hop API

| Nhom | Method | Endpoint | Muc dich |
|---|---|---|---|
| Building | `GET` | `/api/buildings` | Lay danh sach toa nha |
| Building | `GET` | `/api/buildings/{id}` | Lay chi tiet toa nha |
| Building | `POST` | `/api/buildings` | Tao toa nha |
| Building | `PUT` | `/api/buildings/{id}` | Sua toa nha |
| Building | `DELETE` | `/api/buildings/{id}` | Xoa toa nha |
| RoomType | `GET` | `/api/roomtypes` | Lay danh sach loai phong |
| RoomType | `GET` | `/api/roomtypes/{id}` | Lay chi tiet loai phong |
| RoomType | `POST` | `/api/roomtypes` | Tao loai phong |
| RoomType | `PUT` | `/api/roomtypes/{id}` | Sua loai phong |
| RoomType | `DELETE` | `/api/roomtypes/{id}` | Xoa loai phong |
| Room | `GET` | `/api/rooms` | Lay danh sach phong, co bo loc |
| Room | `GET` | `/api/rooms/{id}` | Lay chi tiet phong |
| Room | `GET` | `/api/rooms/floormap` | Lay phong theo tang |
| Room | `GET` | `/api/rooms/available` | Tra cuu phong kha dung |
| Room | `POST` | `/api/rooms` | Tao phong |
| Room | `PUT` | `/api/rooms/{id}` | Sua phong |
| Room | `PATCH` | `/api/rooms/{id}/status` | Cap nhat trang thai phong |
| Room | `DELETE` | `/api/rooms/{id}` | Xoa phong |
| Bed | `GET` | `/api/beds?roomId=...` | Lay danh sach giuong theo phong |
| Bed | `GET` | `/api/beds/{id}` | Lay chi tiet giuong |
| Bed | `POST` | `/api/beds` | Tao giuong |
| Bed | `PUT` | `/api/beds/{id}` | Sua giuong |
| Bed | `DELETE` | `/api/beds/{id}` | Xoa giuong |
| Equipment | `GET` | `/api/equipments?roomId=...` | Lay thiet bi theo phong |
| Equipment | `GET` | `/api/equipments/{id}` | Lay chi tiet thiet bi |
| Equipment | `POST` | `/api/equipments` | Tao thiet bi |
| Equipment | `PATCH` | `/api/equipments/{id}/status` | Cap nhat trang thai thiet bi |
| Equipment | `DELETE` | `/api/equipments/{id}` | Xoa thiet bi |

## 6. Chi tiet cach goi

### 6.1 Building

#### `GET /api/buildings`

Lay danh sach tat ca toa nha.

```bash
curl https://roombuildingservice-1ijx.onrender.com/api/buildings
```

#### `POST /api/buildings`

Tao toa nha moi.

Request body:

```json
{
  "name": "Toa A",
  "totalFloors": 15,
  "genderType": "MIXED",
  "description": "KTX trung tam"
}
```

#### `PUT /api/buildings/{id}`

Cap nhat toa nha.

```json
{
  "name": "Toa A1",
  "totalFloors": 15,
  "genderType": "MALE",
  "status": "ACTIVE",
  "description": "Da cap nhat"
}
```

Response chinh:

```json
{
  "id": "guid",
  "name": "Toa A",
  "totalFloors": 15,
  "floors": [1, 2, 3],
  "genderType": "MIXED",
  "status": "ACTIVE",
  "description": "KTX trung tam"
}
```

### 6.2 Room Type

#### `GET /api/roomtypes`

Lay danh sach loai phong va danh sach tien nghi.

#### `POST /api/roomtypes`

```json
{
  "typeName": "Phong 4 nguoi",
  "capacity": 4,
  "basePrice": 1200000,
  "imageUrl": "https://example.com/room-4.jpg",
  "description": "Phong tieu chuan",
  "amenities": ["May lanh", "WC rieng", "Ban hoc"]
}
```

#### `PUT /api/roomtypes/{id}`

Body giong `POST`.

Response chinh:

```json
{
  "id": "guid",
  "typeName": "Phong 4 nguoi",
  "capacity": 4,
  "basePrice": 1200000,
  "imageUrl": "https://example.com/room-4.jpg",
  "description": "Phong tieu chuan",
  "amenities": ["May lanh", "WC rieng", "Ban hoc"]
}
```

### 6.3 Room

#### `GET /api/rooms`

Co the loc theo:

- `buildingId`
- `floor`
- `status`

Vi du:

```bash
curl "https://roombuildingservice-1ijx.onrender.com/api/rooms?buildingId=GUID&floor=3&status=AVAILABLE"
```

#### `GET /api/rooms/{id}`

Lay chi tiet phong, kem:

- building
- roomType
- beds
- equipments

#### `GET /api/rooms/floormap`

Dung de ve so do phong theo tang.

Query:

- `buildingId`
- `floor`

Vi du:

```bash
curl "https://roombuildingservice-1ijx.onrender.com/api/rooms/floormap?buildingId=GUID&floor=5"
```

#### `GET /api/rooms/available`

Dung de tra cuu phong kha dung.

Query ho tro:

- `buildingId`
- `roomTypeId`
- `genderType`
- `expectedStartDate`
- `expectedEndDate`

Vi du:

```bash
curl "https://roombuildingservice-1ijx.onrender.com/api/rooms/available?buildingId=GUID&roomTypeId=GUID&genderType=MIXED&expectedStartDate=2026-06-20&expectedEndDate=2026-12-31"
```

Response se tra:

- thong tin phong
- thong tin toa nha
- thong tin loai phong
- `currentOccupancy`
- `availableSlots`

#### `POST /api/rooms`

```json
{
  "buildingId": "guid",
  "roomTypeId": "guid",
  "roomNumber": "A101",
  "floorNumber": 1,
  "imageUrl": "https://example.com/room-a101.jpg"
}
```

#### `PUT /api/rooms/{id}`

```json
{
  "roomTypeId": "guid",
  "roomNumber": "A102",
  "floorNumber": 1,
  "imageUrl": "https://example.com/room-a102.jpg"
}
```

#### `PATCH /api/rooms/{id}/status`

```json
{
  "status": "UNDER_MAINTENANCE",
  "maintenanceReason": "Sua dieu hoa"
}
```

Luu y:

- neu `status = UNDER_MAINTENANCE` thi `maintenanceReason` bat buoc co

### 6.4 Bed

#### `GET /api/beds?roomId={roomId}`

Lay danh sach giuong trong 1 phong.

#### `POST /api/beds`

```json
{
  "roomId": "guid",
  "bedNumber": "101-01"
}
```

#### `PUT /api/beds/{id}`

```json
{
  "bedNumber": "101-01",
  "status": "OCCUPIED"
}
```

### 6.5 Equipment

#### `GET /api/equipments?roomId={roomId}`

Lay danh sach thiet bi theo phong.

#### `POST /api/equipments`

```json
{
  "roomId": "guid",
  "equipmentName": "May lanh"
}
```

#### `PATCH /api/equipments/{id}/status`

```json
{
  "status": "UNDER_MAINTENANCE"
}
```

## 7. Cach frontend dang goi API

Frontend `Qly_ktx` dang goi theo base URL:

```txt
https://roombuildingservice-1ijx.onrender.com
```

Cac file FE chinh:

- `Qly_ktx/src/modules/room-building/api/buildingApi.ts`
- `Qly_ktx/src/modules/room-building/api/roomTypeApi.ts`
- `Qly_ktx/src/modules/room-building/api/roomApi.ts`
- `Qly_ktx/src/modules/room-building/api/bedApi.ts`
- `Qly_ktx/src/modules/room-building/api/equipmentApi.ts`

Luong goi:

```mermaid
sequenceDiagram
    participant FE as Qly_ktx Frontend
    participant API as RoomBuildingService API
    participant DB as PostgreSQL

    FE->>API: GET /api/buildings
    API->>DB: Query buildings
    DB-->>API: Data
    API-->>FE: JSON response

    FE->>API: POST /api/rooms
    API->>DB: Insert room
    DB-->>API: Created room
    API-->>FE: 201 Created
```

## 8. Thu tu goi de demo

Neu demo tu dau, nen goi theo thu tu nay:

1. Tao `Building`
2. Tao `RoomType`
3. Tao `Room`
4. Tao `Bed`
5. Tao `Equipment`
6. Goi `GET /api/rooms`
7. Goi `GET /api/rooms/floormap`
8. Goi `GET /api/rooms/available`
9. Goi `PATCH /api/rooms/{id}/status`

## 9. Luu y nghiep vu

- `Building.TotalFloors` tu dong sinh danh sach `floors`
- `Room.availableSlots` duoc tinh tu `RoomType.Capacity - so giuong OCCUPIED`
- `RoomType.Amenities` la danh sach tien nghi mac dinh cua loai phong
- frontend dang tu them `Equipment` mac dinh theo `Amenities` sau khi tao phong
- `Room status = UNDER_MAINTENANCE` bat buoc co ly do
- `GET /api/rooms/available` co check `expectedStartDate <= expectedEndDate`

## 10. Goi nhanh bang JavaScript

```js
const API_BASE = 'https://roombuildingservice-1ijx.onrender.com'

async function getBuildings() {
  const res = await fetch(`${API_BASE}/api/buildings`)
  return res.json()
}

async function createRoomType() {
  const res = await fetch(`${API_BASE}/api/roomtypes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      typeName: 'Phong 4 nguoi',
      capacity: 4,
      basePrice: 1200000,
      imageUrl: 'https://example.com/room.jpg',
      description: 'Phong tieu chuan',
      amenities: ['May lanh', 'Ban hoc']
    })
  })

  return res.json()
}
```

## 11. Link file code lien quan

- Backend API: [Program.cs](/abs/path/c:/Users/quang/OneDrive/Desktop/Code/QLKTX/RoomBuildingService/src/RoomBuildingService.Api/Program.cs:1)
- Buildings: [BuildingsController.cs](/abs/path/c:/Users/quang/OneDrive/Desktop/Code/QLKTX/RoomBuildingService/src/RoomBuildingService.Api/Controllers/BuildingsController.cs:1)
- RoomTypes: [RoomTypesController.cs](/abs/path/c:/Users/quang/OneDrive/Desktop/Code/QLKTX/RoomBuildingService/src/RoomBuildingService.Api/Controllers/RoomTypesController.cs:1)
- Rooms: [RoomsController.cs](/abs/path/c:/Users/quang/OneDrive/Desktop/Code/QLKTX/RoomBuildingService/src/RoomBuildingService.Api/Controllers/RoomsController.cs:1)
- Beds: [BedsController.cs](/abs/path/c:/Users/quang/OneDrive/Desktop/Code/QLKTX/RoomBuildingService/src/RoomBuildingService.Api/Controllers/BedsController.cs:1)
- Equipments: [EquipmentsController.cs](/abs/path/c:/Users/quang/OneDrive/Desktop/Code/QLKTX/RoomBuildingService/src/RoomBuildingService.Api/Controllers/EquipmentsController.cs:1)

---

Neu can, buoc tiep theo toi co the lam tiep cho ban:

- mot file Postman Collection JSON
- bang mapping API <-> man hinh frontend
- tai lieu ngan gon de nop bao cao/thuyet trinh
