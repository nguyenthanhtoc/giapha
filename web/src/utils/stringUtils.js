/**
 * Chuyển đổi tên sang dạng Viết Hoa Chữ Cái Đầu Từng Từ
 * Ví dụ: "nguyễn thanh dung" -> "Nguyễn Thanh Dung"
 */
export const capitalizeName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
