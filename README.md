# Cờ Thú Rừng Xanh

Biến thể Cờ Thú Rừng Xanh dành cho hai người chơi cùng thiết bị hoặc trực tuyến. Bàn cờ 9 × 9 có đủ 8 loài thú cho mỗi đội, sông, bẫy, hang và địa hình thay đổi sức mạnh. Quân và ô chức năng được xáo ngẫu nhiên mỗi ván, rải đều trên hai bờ sông; quân luôn khởi đầu ở bờ của mình, ngoài hang và bẫy.

**[Chơi trên GitHub Pages](https://vietdinh2904.github.io/co-thu-rung-xanh/)**

## Chơi hai người từ xa

1. Người thứ nhất bấm **Tạo phòng** và sao chép link mời. Người này chơi đội Xanh.
2. Gửi link cho người thứ hai. Người đó mở link và bấm **Vào** để chơi đội Đỏ.
3. Cả hai giữ trang đang mở trong suốt ván. Chủ phòng xáo bàn, đồng bộ địa hình, thời điểm và vết thương cho khách, đồng thời kiểm tra nước đi; nếu mất kết nối, hãy tạo phòng mới.

Chế độ này dùng WebRTC qua [PeerJS](https://peerjs.com/) và dịch vụ kết nối miễn phí của PeerJS; không cần tài khoản hoặc máy chủ riêng cho game. Một số mạng hạn chế WebRTC có thể không kết nối được. Chế độ **Đi lại lượt trước** chỉ có khi chơi cùng thiết bị.

## Chơi trên máy

Chạy `npm run dev`, rồi mở `http://localhost:8000`. Chọn quân của đội đang đến lượt, rồi chọn ô được đánh dấu. Nút **Đi lại lượt trước** hoàn tác một nước; **Chơi ván mới** đặt lại bàn cờ.

## Kiểm tra

```bash
npm test
```

Không cần cài gói phụ thuộc để chơi. Tệp `rules.js` chứa luật chơi thuần JavaScript và được kiểm tra bằng `node:test`.

## Luật của biến thể

- Bẫy quanh hang đối thủ hạ bậc quân sa vào xuống **0**; bất kỳ thú nào cũng có thể bắt. Rời bẫy sẽ phục hồi bậc theo địa hình, thời điểm và vết thương hiện có.
- Rừng rậm: Voi miễn nhiễm Chuột; Hổ +1; Mèo, Chó, Chuột −1. Nhà: Mèo, Chó, Chuột +1; loài khác −2. Núi non: Báo, Sói +1; loài khác −1.
- Quân đang đứng trên ô cộng bậc được nhảy đúng 2 ô theo 8 hướng, bỏ qua ô giữa. Trăng tròn, Sói nhảy đúng 3 ô theo 8 hướng. Nước đi thường vẫn còn; điểm đáp phải hợp lệ theo luật sông, hang và bắt quân.
- Chu kỳ lượt: **Ngày → Ngày → Đêm → Trăng tròn** rồi lặp lại. Đêm, chỉ Mèo bắt được Chuột; Sói +2, Hổ +1. Trăng tròn, Sói +3 và Chuột trở về luật bắt thường.
- Bẫy chông gây vết thương vĩnh viễn −1 bậc cho thú có bậc hiện tại ít nhất 6 khi đáp xuống. Mỗi lần đáp là một lần xét vết thương; bậc không thấp hơn 0.

Luật được tham khảo từ [hướng dẫn Cờ Thú của Thế Giới Di Động](https://www.thegioididong.com/game-app/huong-dan-cach-choi-co-thu-thu-thuat-luat-choi-co-ban-1317796). Giao diện được thiết kế riêng; ảnh tham khảo của người yêu cầu chỉ dùng để định hướng phong cách.
