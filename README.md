# Cờ Thú Rừng Xanh

Trò chơi Cờ Thú (Jungle / Dou Shou Qi) dành cho hai người chơi cùng thiết bị, với giao diện minh họa khu rừng, sông, bẫy và hang. Bàn cờ 7 × 9 có đủ 8 loài thú cho mỗi đội.

## Chơi trên máy

Chạy `npm run dev`, rồi mở `http://localhost:8000`. Chọn quân của đội đang đến lượt, rồi chọn ô được đánh dấu. Nút **Đi lại lượt trước** hoàn tác một nước; **Chơi ván mới** đặt lại bàn cờ.

## Kiểm tra

```bash
npm test
```

Không cần cài gói phụ thuộc để chơi. Tệp `rules.js` chứa luật chơi thuần JavaScript và được kiểm tra bằng `node:test`.

Luật được tham khảo từ [hướng dẫn Cờ Thú của Thế Giới Di Động](https://www.thegioididong.com/game-app/huong-dan-cach-choi-co-thu-thu-thuat-luat-choi-co-ban-1317796). Giao diện được thiết kế riêng; ảnh tham khảo của người yêu cầu chỉ dùng để định hướng phong cách.
