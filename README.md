# Cờ Thú Rừng Xanh

Trò chơi Cờ Thú (Jungle / Dou Shou Qi) dành cho hai người chơi cùng thiết bị, với giao diện minh họa khu rừng, sông, bẫy và hang. Bàn cờ 7 × 9 có đủ 8 loài thú cho mỗi đội.

**[Chơi trên GitHub Pages](https://vietdinh2904.github.io/co-thu-rung-xanh/)**

## Chơi hai người từ xa

1. Người thứ nhất bấm **Tạo phòng** và sao chép link mời. Người này chơi đội Xanh.
2. Gửi link cho người thứ hai. Người đó mở link và bấm **Vào** để chơi đội Đỏ.
3. Cả hai giữ trang đang mở trong suốt ván. Chủ phòng giữ trạng thái ván và kiểm tra nước đi; nếu mất kết nối, hãy tạo phòng mới.

Chế độ này dùng WebRTC qua [PeerJS](https://peerjs.com/) và dịch vụ kết nối miễn phí của PeerJS; không cần tài khoản hoặc máy chủ riêng cho game. Một số mạng hạn chế WebRTC có thể không kết nối được. Chế độ **Đi lại lượt trước** chỉ có khi chơi cùng thiết bị.

## Chơi trên máy

Chạy `npm run dev`, rồi mở `http://localhost:8000`. Chọn quân của đội đang đến lượt, rồi chọn ô được đánh dấu. Nút **Đi lại lượt trước** hoàn tác một nước; **Chơi ván mới** đặt lại bàn cờ.

## Kiểm tra

```bash
npm test
```

Không cần cài gói phụ thuộc để chơi. Tệp `rules.js` chứa luật chơi thuần JavaScript và được kiểm tra bằng `node:test`.

Quân sa vào bẫy đối thủ hiện **bậc 0**, bất kỳ thú nào cũng có thể bắt; rời bẫy thì trở lại bậc gốc.

Luật được tham khảo từ [hướng dẫn Cờ Thú của Thế Giới Di Động](https://www.thegioididong.com/game-app/huong-dan-cach-choi-co-thu-thu-thuat-luat-choi-co-ban-1317796). Giao diện được thiết kế riêng; ảnh tham khảo của người yêu cầu chỉ dùng để định hướng phong cách.
