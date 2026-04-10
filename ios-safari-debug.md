# iOS Safari Mobile UI Debug Log

## Triệu chứng
- Title banner "Nguyễn Thanh Tộc" không hiển thị / bị cắt ở trên
- Bottom buttons (THU PHÓNG, TỪ ĐỂ 15) bị lệch vị trí
- Trên PC mobile mode OK, chỉ lỗi trên Safari iOS thật

---

## Lần 1 — `export const viewport` (commit 4c0e0e3)
**Giả thuyết:** Thiếu viewport meta tag → Safari iOS render sai layout  
**Thay đổi:**
- Thêm `export const viewport = { width, initialScale, viewportFit: "cover" }` vào `layout.js`
- Thêm `env(safe-area-inset-*)` padding vào `body` trong `globals.css`
- Thêm `env(safe-area-inset-top/bottom)` vào title và bottom buttons (dùng `max()`)

**Kết quả:** Không thay đổi  
**Lý do thất bại:** Next.js static export (`output: 'export'`) KHÔNG generate meta tag từ `export const viewport` — cần thêm trực tiếp vào `<head>`

---

## Lần 2 — Hardcode `<meta viewport>` vào `<head>` (commit c743178)
**Giả thuyết:** Static export cần meta tag trực tiếp trong JSX  
**Thay đổi:**
- Thêm `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` trực tiếp vào `<head>` trong `RootLayout`

**Kết quả:** Không thay đổi  
**Lý do thất bại:** Cả 2 (export viewport + hardcode head) cùng tồn tại → 2 viewport meta tags conflict nhau

---

## Lần 3 — z-index, safe-area calc, dvh, maximum-scale (commit 72ca551 + c7300cb)
**Giả thuyết:** Title bị SVG canvas che (z-index thấp), bottom buttons bị home indicator che, layout bị shift khi keyboard mở  
**Thay đổi:**
- Tăng title z-index từ `z-20` lên `z-30`
- Đổi `max()` sang `calc()` cho safe-area bottom
- Dùng `100dvh` thay `h-screen` trong `page.js`
- Thêm `maximum-scale=1` vào viewport (chặn auto-zoom khi focus input)
- Fix `bg_parchment.png` path từ `./` sang `/giapha/` (absolute path cho GitHub Pages)

**Kết quả:** Title lộ ra 1 chút nhưng vẫn bị cắt ở trên  
**Lý do thất bại (nghi ngờ):** `body` có `padding-top: env(safe-area-inset-top)` nhưng title dùng `absolute` positioning từ container — double offset

---

## Lần 4 — Bỏ body padding, calc top cho title (commit 4ebfe9f)
**Giả thuyết:** Body padding gây double offset với absolute title  
**Thay đổi:**
- Bỏ toàn bộ `padding: env(safe-area-inset-*)` khỏi `body`
- Title: `top: calc(env(safe-area-inset-top, 0px) + 0.5rem)`
- Xóa `export const viewport` (chỉ giữ hardcode `<meta>` trong head)

**Kết quả:** Vẫn không đổi  
**Lý do thất bại (nghi ngờ):** `absolute` positioning bị ảnh hưởng bởi `overflow-hidden` trên `<main>`, `env()` có thể trả về 0 vì viewport-fit chưa kích hoạt đúng

---

## Lần 5 — Đổi sang `fixed` positioning (commit 61863e0)
**Giả thuyết:** `absolute` bị parent `overflow-hidden` clip, `fixed` tính từ viewport nên không bị ảnh hưởng  
**Thay đổi:**
- Đổi tất cả UI overlay (title, zoom indicator, gen filter, minimal mode button) từ `absolute` → `fixed`
- Xóa duplicate viewport tag (bỏ `export const viewport`)

**Kết quả:** Vẫn không đổi  
**Trạng thái:** Chưa rõ nguyên nhân gốc

---

## Hiện trạng code

| File | Trạng thái |
|------|-----------|
| `layout.js` | `<meta viewport>` hardcode trong `<head>`, có `maximum-scale=1` |
| `page.js` | `height: 100dvh`, `overflow-hidden` |
| `globals.css` | Không còn safe-area padding |
| `FamilyTree.jsx` | Title và buttons dùng `fixed` + `calc(env(safe-area-inset-*))` |
| `PasswordGate.jsx` | `fixed inset-0 z-[9999]`, bg path đã fix |

## Câu hỏi cần trả lời
1. `env(safe-area-inset-top)` trên Safari iOS thực tế trả về bao nhiêu px?
2. Title có bị PasswordGate overlay che không khi đang ở màn hình password?
3. Có thể test bằng cách hardcode `top: 60px` thay vì dùng `env()` để xác nhận vấn đề là safe-area?
4. Safari iOS có cache HTML cũ không? (cần hard refresh)

## Bước tiếp theo đề xuất
- Hardcode `top: 60px` cho title (bỏ qua safe-area hoàn toàn) để xác nhận xem vấn đề là positioning hay rendering
- Hoặc thêm `border: 3px solid red` vào title div để xem nó có render không (chỉ invisible hay thực sự không có)
