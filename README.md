# base-web — giao diện điều khiển quy trình Base (bản mẫu)

Một trang `index.html` duy nhất, chạy bằng **dữ liệu cứng** để thử cách dùng trước khi nối backend
([base-backend](../base-backend)). Không gọi API nào, không gửi gì lên Base.

## Có gì

- **Quy trình**: danh sách, bật/tắt, cấu hình từng bước (Block ID, tên/nội dung phiếu, trường, file, AI, Office, liên thông, cho phiếu khác đi tiếp), chạy thử, lưu đồ, hướng dẫn chuyển địa chỉ webhook.
- **Thêm quy trình từ Base**: dán link dịch vụ → **sơ đồ lưu đồ hiện ngay** (ô + mũi tên, rẽ nhánh và song song xếp ngang, bấm ô webhook để tới phần chọn việc) → chọn việc cho từng webhook → đặt tên và tạo bản nháp.
  Bản mẫu có sẵn lưu đồ đọc thật từ Base của 5 dịch vụ: 50316, 33975, 43945, 13681, 50986 (sinh bằng `tools/gen-samples.mjs` từ module `src/base/flow.js` của backend).
- **Từ điển**, **Nhật ký chạy**, xuất bản / lịch sử phiên bản (lưu trên trình duyệt).

## Chạy

Mở thẳng `index.html` bằng trình duyệt, hoặc:

```bash
npm run serve
```

rồi vào http://127.0.0.1:8765/index.html

## Kiểm thử

```bash
npm install
npm test
```

3 bộ kiểm thử chạy trang trong jsdom và bấm qua các luồng chính (thêm quy trình từ Base với dịch vụ kho 45 webhook và văn thư BHVN, cấu hình bước, lưu đồ, chuyển địa chỉ, xuất bản/khôi phục).

## Bước tiếp theo khi nối backend

| Trên trang | Gọi backend |
|---|---|
| Đọc lưu đồ (thêm quy trình) | `GET /api/base/luu-do?link=…` |
| Tạo bản nháp quy trình | `POST /api/quy-trinh/tu-base` |
| Đọc lại từ Base (tab Lưu đồ) | `GET /api/quy-trinh/:id/doi-chieu-base` |
| Danh sách / cấu hình quy trình, từ điển, nhật ký, xuất bản | chưa có API — cần làm |

Tất cả gọi kèm header `x-admin-key`.
