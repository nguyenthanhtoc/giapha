# 🌳 Website Gia Phả Nội Bộ (`giapha-web`)

Website phả hệ trực quan được xây dựng bằng **Next.js** và **D3.js**, tập trung vào trải nghiệm mượt mà, trực quan với hiệu ứng Zoom/Pan hỗ trợ đa nền tảng (PC/Mobile).

---

## 🛠️ Trực quan hóa & Thao tác
- **Kéo/Thả (Pan)**: Nhấp giữ vào chỗ trống và kéo để di chuyển vùng nhìn sơ đồ.
- **Cuộn phóng (Zoom)**: Dùng con lăn chuột hoặc bấm phím `+` / `-` ở góc trái màn hình.
- **Xem chi tiết**: Nhấp vào vòng tròn Node của người bất kỳ để hiển thị Popup tiểu sử (Thông tin, năm sinh/năm mất).

---

## 📝 Hướng dẫn Nhập liệu & Chỉnh sửa (Data Config)

Mọi dữ liệu dòng họ được quản lý gọn gàng trong file:
👉 `web/src/data/family.json`

### 💡 Quy tắc cấu trúc đối tượng (Schema)

Mỗi người là một đối tượng `{}` trong danh sách `[]` có cấu trúc sau:

```json
{
  "id": "1",                     // [Bắt buộc] ID duy nhất (Ví dụ: "1", "2", "3")
  "name": "Nguyễn Văn A",        // [Bắt buộc] Họ và Tên
  "gender": "male",              // Giới tính: "male" (Nam) | "female" (Nữ)
  "born": "1880",                // Năm sinh
  "death": "1950",                // Năm mất (Nếu còn sống thì nhập "Hiện tại")
  "role": "Cụ Tổ",               // Chức danh / Vai trò trong họ (Optional)
  
  // 🔗 Liên kết huyết thống
  "parentId": "X",               // ID của Bố/Mẹ (Bỏ qua nếu là Cụ Tổ - Đời 1)
  
  // 💍 Liên kết phu thê (Vợ/Chồng)
  "spouseId": "Y",               // Bố trí cặp đối sánh: Nhập ID của Vợ/Chồng vào đây
  
  // ⭐ Làm nổi bật (Highlight)
  "highlight": true,              // Nhập true nếu muốn tô vạch vàng cho người này
  "highlightDesc": "Gốc gác..."   // Mô tả lý do highlight
}
```

### ⚠️ Một số lưu ý quan trọng để tránh lỗi tree:
1. **Duy nhất ID**: Không được đặt trùng `id` giữa các thành viên.
2. **Tránh chồng vòng (Cycle check)**: Đảm bảo `parentId` chỉ hướng về thế hệ TRƯỚC (Không sinh con mâu thuẫn lặp).
3. **Hiển thị Spouse**: Thành viên có `spouseId` (ví dụ: Vợ) sẽ không tính là nút phả hệ độc lập mà tự động đính kèm liên kết ngay bên cạnh chồng của họ trên cây.

---

## 🚀 Cách chạy Dự án (Dành cho DEV)

1. Đi vào thư mục: `cd web`
2. Cài đặt dependency: `npm install`
3. Khởi động local: `npm run dev`
4. Truy cập: `http://localhost:3000`
