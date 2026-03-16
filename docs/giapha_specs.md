# 📜 Tài liệu Yêu cầu & Giải pháp: Website Gia Phả Nội Bộ

Tài liệu này xác định các yêu cầu và giải pháp kỹ thuật để xây dựng một trang web phả hệ (Gia Phả) đơn giản, tập trung vào trải nghiệm xem (viewer) trực quan và quản lý dữ liệu thông qua cấu hình cấu trúc tĩnh.

---

## 🎯 1. Yêu cầu (Requirements)

### **a. Phạm vi & Mục tiêu**
- **Xử lý nội bộ dòng họ**: Trang web không có các chức năng đăng ký/đăng nhập công khai đại trà.
- **Xem tĩnh (Viewer-only)**: Không có giao diện chỉnh sửa trên front-end. Mọi thay đổi dữ liệu sẽ được thực hiện trực tiếp thông qua tệp cấu hình.
- **Tính năng độc lập**: Dữ liệu có thể được đọc từ một file tĩnh tập trung dễ quản lý.

### **b. Tính năng sản phẩm (Product Features)**
- **Hiển thị Sơ đồ cây**: Trực quan hóa mối quan hệ tổ tông & hậu duệ.
- **Thông tin cơ bản**:
  - Tên đầy đủ
  - Năm sinh - Năm mất (Thọ/Hưởng dương)
  - Thông tin vợ/chồng (Spouse), con cái.
  - Ảnh đại diện (*Avatar* - Optional).
- **Phân loại đặc thù (Highlighting)**:
  - Điểm danh và làm nổi bật các thành viên có vai trò quan trọng (ví dụ: Trưởng tộc, Công thần, Người làm rạng danh dòng họ).
- **Trải nghiệm tương tác**:
  - **Zoom & Pan**: Thu phóng và di chuyển góc nhìn sơ đồ một cách mượt mà.
  - **Click-to-view**: Nhấp vào một thành viên để mở bảng/modal thông tin chi tiết (không cần chuyển trang).

### **c. Yêu cầu về Thiết kế & Khả dụng (UI/UX)**
- **Giao diện đa nền tảng**: Responsive hoàn hảo cho cả Web màn hình rộng (PC) và Điện thoại di động (Mobile).
- **Thiết kế Sang trọng (Premium vibe)**:
  - Phù hợp với tính tôn nghiêm/lịch sử của gia phả (Ví dụ: Nền tối/Dark mode cao cấp kết hợp ánh vàng Gold hoặc thiết kế Canvas cổ kính).
  - Micro-animations mượt mà khi di chuột qua các Node.

---

## 🛠 2. Giải pháp kỹ thuật (Solution)

### **a. Kiến trúc Hệ thống**
- **Kiểu mô hình**: Static Web (Single Page Application) hoặc Next.js static export.
- **Tiện ích Hosting**: Dễ dàng deploy miễn phí lên Vercel, Netlify hoặc GitHub Pages.

### **b. Tech Stack Đề xuất**
| Công nghệ | Thành phần | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Next.js / React** | Framework chính | Hỗ trợ chia tách Component tốt, render nhanh và dễ dàng nâng cấp nếu sau này cần tích hợp Database. |
| **D3.js** | Visual Library | Thư viện hàng đầu cho đồ họa dữ liệu SVG/Canvas. Hỗ trợ hiển thị dạng cây (Tree layouts), xử lý Zoom và Pan cực kỳ mượt mà trên cả PC và Mobile (Touch handles). |
| **Tailwind CSS** | Styling | Tốc độ xây dựng giao diện nhanh, dễ tùy biến giao diện cao cấp. |

### **c. Quản lý Dữ liệu (Data Definition)**
Dữ liệu sẽ được lưu trữ dưới dạng **JSON Flat Array** để bạn dễ dàng sửa đổi thêm bớt mà không bị rối như cấu trúc lồng nhau (Nested tree).

**Ví dụ cấu trúc `data/giapha.json`**:
```json
[
  {
    "id": "1",
    "name": "Nguyễn Văn A",
    "role": "Cụ Tổ",
    "born": "1880",
    "death": "1950",
    "highlight": true,
    "highlightDesc": "Người khai sinh dòng họ",
    "children": ["2", "3"]
  },
  {
    "id": "2",
    "name": "Nguyễn Văn B",
    "parentId": "1",
    "born": "1910",
    "death": "1980",
    "children": ["4"]
  },
  {
    "id": "3",
    "name": "Nguyễn Thị C",
    "parentId": "1",
    "born": "1912",
    "death": "1995"
  }
]
```
*Lưu ý: Mối quan hệ Spouse (vợ/chồng) có thể được định nghĩa bằng một trường `spouseId` để hiển thị các cụ bên cạnh nhau.*

---

## 🗺 3. Kế hoạch triển khai (Roadmap)

- [ ] **Bước 1**: Tạo cấu trúc dự án (React/Next.js) và setup thư viện D3.js.
- [ ] **Bước 2**: Định nghĩa Schema dữ liệu JSON chuẩn nhất, bao gồm cả Spouse handling.
- [ ] **Bước 3**: Tạo Component `FamilyTree` xử lý logic render Cây phả hệ thông qua D3.js (bao gồm Drag, Zoom).
- [ ] **Bước 4**: Xây dựng UI Component cho Modal thông tin chi tiết và Hệ thống phím điều khiển (Zoom in/out, Reset view).
- [ ] **Bước 5**: Tối ưu giao diện Mobile (Double touch handling).
- [ ] **Bước 6**: Hướng dẫn bạn nhập liệu thử và Build đẩy lên hệ thống.

---
*(Tài liệu này được tạo tự động để thiết lập nền tảng dự án. Sẽ được cập nhật khi các bước thực thi hoàn tất)*
