# 🗺️ Kế hoạch xây dựng Website Gia Phả (`giapha-build`)

**Trạng thái**: 📝 Đang lập kế hoạch

---

## 📅 1. Tổng quan & Bản ghi nhớ
- **Mục tiêu**: Xây dựng website hiển thị phả hệ cho dòng họ, xem tĩnh, cấu hình dữ liệu thông qua file JSON, hỗ trợ Zoom/Pan và thích ứng Mobile.
- **Tài liệu đặc tả**: [docs/giapha_specs.md](docs/giapha_specs.md)

---

## 📌 2. Danh sách Công việc (Task Breakdown)

### 🏗️ Pha 1: Khởi tạo Dễ dàng & Cấu hình (Setup & Config)
- [x] **1.1 Khởi tạo dự án Next.js/React**: Setup cấu trúc thư mục, Tailwind CSS. (`.agent/scripts/lint_runner.py`)
- [x] **1.2 Định dạng Schema Dữ liệu**: Tạo tệp `data/family.json` chuẩn mô hình phả hệ (Node-based link).
- [x] **1.3 Khởi tạo Mock Data**: Thêm tối thiểu 3 thế hệ để test render tree.

### 🎨 Pha 2: Hệ thống Hiển thị Sơ đồ (Render Engine)
- [x] **2.1 Tích hợp D3.js**: Tạo Component hiển thị sơ đồ (Nodes & Lines) cơ bản.
- [x] **2.2 Chức năng Zoom & Pan**: Thiết lập `d3-zoom` để hỗ trợ thao tác kéo-thả, cuộn chuột trên PC và Touch-zoom trên Mobile.
- [x] **2.3 Định dạng trực quan NODE**: Vẽ các hộp/vòng tròn thông tin cho từng người (Highlight những thành viên đặc biệt).

### 📱 Pha 3: Giao diện Người dùng & Trải nghiệm (UI/UX)
- [x] **3.1 Chế độ hiển thị chi tiết (Modal)**: Khi nhấp vào một node bất kỳ, hiển thị Popup chứa Tiểu sử đầy đủ & Avatar (nếu có).
- [x] **3.2 Nâng cấp Thẩm mỹ (Premium View)**: Áp dụng Dark mode, hiệu ứng hover, gradient line cổ kính nhưng hiện đại.
- [x] **3.3 Response optimization**: Test & Tối ưu hóa viewport trên màn hình tỷ lệ hẹp (Mobile dọc).

### 🚀 Pha 4: Kiểm thử & Khởi động (Test & Wrap up)
- [x] **4.1 Kiểm thử Micro-testing**: Chạy thử xem mượt độ mượt mà khi số lượng Node tăng lên (Gia phả ~100 người).
- [x] **4.2 Hướng dẫn người dùng**: Tạo file `README.md` hướng dẫn chi tiết cách thêm/sửa thành viên trong file JSON.

---

## ✅ 3. Xác nhận để bắt đầu
*Nhấn "Ok" hoặc xác nhận để khởi chạy **Pha 1** ngay lập tức.*
