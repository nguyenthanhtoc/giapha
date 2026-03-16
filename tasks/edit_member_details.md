# 🗺️ Kế hoạch chỉnh sửa thông tin thành viên Admin (`edit_member_details`)

**Trạng thái**: 📝 Đang lập kế hoạch

---

## 📅 1. Tổng quan & Bản ghi nhớ
- **Mục tiêu**: Cho phép Admin chỉnh sửa `Tên` và `Năm sinh` trực tiếp trên giao diện website khi truy cập qua link ẩn. Lưu trữ dữ liệu vào một file tách biệt (`overrides.json`) thay vì sửa file `family.json` để không bị đè dữ liệu khi chạy tập lệnh sửa cấu trúc Python.
- **Tính năng**:
    - Truy cập thông qua URL parameter ẩn (VD: `?admin=true`).
    - API endpoint xử lý cập nhật dữ liệu.
    - Hiển thị ô nhập dữ liệu (Input) thay vì Text trên Modal chi tiết.

---

## 📌 2. Danh sách Công việc (Task Breakdown)

### 🏗️ Pha 1: Xây dựng hệ thống Backend API & Lưu trữ
- [x] **1.1 Tạo file lưu trữ rỗng**: Tạo `web/src/data/overrides.json` mặc định `{}` để chứa các thông tin bị đè.
- [x] **1.2 Viết API Route `/api/overrides`**:
    - `GET`: Trả về dữ liệu `overrides.json`.
    - `POST`: Nhận `id` và update object thông tin mới (`name`, `born`) lưu lại vào file.

### 🎨 Pha 2: Cập nhật Dynamic Data Binding trong Frontend
- [x] **2.1 Nhập và gộp dữ liệu động**:
    - Chuyển logic vẽ d3 từ mảng tĩnh `familyData` sang mảng reactive state `mergedData`.
    - Gọi API GET `/api/overrides` trong `useEffect` để merge thông tin từ overrides vào `familyData` trước khi render d3.
- [x] **2.2 Nhận diện Admin check**:
    - Dùng `useSearchParams()` hoặc `window.location` để lấy `admin=true`.
    - Thiết lập trạng thái `isAdmin` trên website.

### 📱 Pha 3: Giao diện Sửa đổi (Admin Tooling) ở Modal
- [x] **3.1 Chế độ Input trong Details Card**:
    - Khi `isAdmin === true`, nút bấm Tên và Năm sinh sẽ hiển thị dưới dạng `<input type="text" />`.
- [x] **3.2 Nút hành động "Lưu" (Save Action)**:
    - Thêm một nút **Lưu thay đổi** gọi API cập nhật thông tin.
    - Sau khi lưu thành công, cập nhật dữ liệu state để d3 cập nhật thông tin ngay lập tức (Real-time).

---

## ✅ 3. Xác nhận để bắt đầu
*Nhấn "Ok" hoặc xác nhận để mình bắt đầu triển khai **Pha 1** ngay lập tức.*
