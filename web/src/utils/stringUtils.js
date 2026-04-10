/**
 * Parse năm từ các định dạng ngày khác nhau: "1945", "15/3/1945", "1945-03-15", ...
 * Trả về chuỗi 4 chữ số năm, hoặc null nếu không tìm thấy.
 */
export const parseYear = (dateStr) => {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (/^\d{4}$/.test(s)) return s;
  const isoMatch = s.match(/^(\d{4})-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[1];
  const dmyMatch = s.match(/^\d{1,2}\/\d{1,2}\/(\d{4})$/);
  if (dmyMatch) return dmyMatch[1];
  const anyYear = s.match(/(\d{4})/);
  if (anyYear) return anyYear[1];
  return null;
};

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
