# HKPĐ ONLINE - WEBSITE REALTIME

## Kiến trúc
- Frontend: HTML/CSS/JavaScript
- Backend: Supabase PostgreSQL
- Đăng nhập: Supabase Auth email/password
- Realtime: Supabase Realtime
- Phân quyền: Row Level Security (RLS)

Supabase khuyến nghị dùng publishable/anon key ở trình duyệt và tuyệt đối không đưa service_role key vào client.

## 1. Tạo backend
1. Tạo một project Supabase.
2. Mở SQL Editor.
3. Dán toàn bộ `schema.sql` và chạy.
4. Vào Authentication > Users > Add user, tạo email + mật khẩu cho Ban tổ chức.
5. Sao chép UUID của user.
6. Chạy:
   insert into public.profiles(id, full_name, role)
   values ('UUID_CUA_USER', 'Ban tổ chức HKPĐ', 'admin');
7. Mở `config.js`, thay:
   SUPABASE_URL
   SUPABASE_KEY
   bằng Project URL và Publishable/Anon key của project.

## 2. Chạy website
Có thể mở `index.html` qua hosting tĩnh. Không cần Node.js.

Các file phải nằm cùng thư mục:
- index.html
- app.js
- config.js

## 3. Realtime
Khi Ban tổ chức sửa tỷ số, đổi trạng thái hoặc thêm tin/huy chương, các trình duyệt đang mở website sẽ tự nhận thay đổi từ Supabase Realtime.

## 4. Vòng đấu tự động
Trường `next_match_id` và `next_slot` đã được chuẩn bị.
Ví dụ:
- trận A có `next_match_id` trỏ tới trận bán kết
- `next_slot='a'`
Khi trận A kết thúc và có tỷ số, trigger database sẽ đưa đội thắng vào đội A của trận kế tiếp.

## 5. Livestream
Ban tổ chức nhập URL YouTube/Facebook vào `live_url`. Website hiển thị nút mở livestream. Với Facebook/YouTube, việc nhúng trực tiếp còn phụ thuộc URL/embed và chính sách của nền tảng; nút mở livestream luôn hoạt động nếu URL hợp lệ.

## 6. Bảo mật
- Người xem không cần tài khoản.
- Chỉ user có `profiles.role='admin'` mới được thêm/sửa/xóa dữ liệu.
- Không đưa service_role key vào website.
- Nên tắt đăng ký tài khoản công khai sau khi tạo các tài khoản quản trị cần thiết.

## 7. Đưa lên Internet
Có thể đưa bộ HTML này lên bất kỳ static hosting nào mà trường đang dùng. Supabase cũng hỗ trợ quy trình triển khai qua GitHub/CLI; việc triển khai không bắt buộc gói trả phí theo tài liệu hiện tại.
