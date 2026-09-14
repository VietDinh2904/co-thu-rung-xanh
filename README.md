# Cờ Thú Rừng Xanh

Hai phiên bản Cờ Thú Rừng Xanh cho hai người chơi cùng thiết bị hoặc trực tuyến:

- **[Phiên bản 1 · Đơn giản 7×9](https://vietdinh2904.github.io/co-thu-rung-xanh/simple/index.html)** giữ luật Cờ Thú cơ bản, sông, bẫy và hang, với cách xếp quân cố định.
- **[Phiên bản 2 · Nâng cấp 9×9](https://vietdinh2904.github.io/co-thu-rung-xanh/)** thêm địa hình, hai dòng sông ngẫu nhiên, vết thương do chông và xáo quân mỗi ván.

Mỗi trang có nút chuyển phiên bản. Phòng trực tuyến chỉ dùng trong đúng phiên bản được tạo; người được mời mở link phòng của phiên bản đó.

## Chơi hai người từ xa

1. Người thứ nhất bấm **Tạo phòng** và sao chép link mời. Người này chơi đội Xanh.
2. Gửi link cho người thứ hai. Người đó mở link và bấm **Vào** để chơi đội Đỏ.
3. Cả hai giữ trang đang mở trong suốt ván. Chủ phòng xáo bàn, đồng bộ địa hình, sông và vết thương cho khách, đồng thời kiểm tra nước đi; nếu mất kết nối, hãy tạo phòng mới.

Chế độ này dùng WebRTC qua [PeerJS](https://peerjs.com/) và dịch vụ kết nối miễn phí của PeerJS; không cần tài khoản hoặc máy chủ riêng cho game. Một số mạng hạn chế WebRTC có thể không kết nối được. Chế độ **Đi lại lượt trước** chỉ có khi chơi cùng thiết bị.

## Chơi trên máy

Chạy `npm run dev`, rồi mở `http://localhost:8000` cho bản nâng cấp hoặc `http://localhost:8000/simple/index.html` cho bản đơn giản. Chọn quân của đội đang đến lượt, rồi chọn ô được đánh dấu. Nút **Đi lại lượt trước** hoàn tác một nước; **Chơi ván mới** đặt lại bàn cờ.

## Kiểm tra

```bash
npm test
```

Không cần cài gói phụ thuộc để chơi. Tệp `rules.js` chứa luật chơi thuần JavaScript và được kiểm tra bằng `node:test`.

## Luật của phiên bản nâng cấp

- Mỗi loại Rừng rậm, Nhà, Núi non và Chông chỉ có **một ô** trên toàn bàn, chia đều hai bờ. Hai dòng sông ở ba hàng giữa, mỗi dòng có 6 ô dạng 2×3 hoặc 3×2; vị trí và hình dạng xáo lại mỗi ván.
- Bẫy quanh hang đối thủ hạ bậc quân sa vào xuống **0**; bất kỳ thú nào cũng có thể bắt. Rời bẫy sẽ phục hồi bậc theo địa hình và vết thương hiện có.
- Rừng rậm: Voi miễn nhiễm Chuột; Hổ +1; Mèo, Chó, Chuột −1. Nhà: Mèo, Chó, Chuột +1; loài khác −2. Núi non: Báo, Sói +1; loài khác −1.
- Quân đang đứng trên ô cộng bậc được nhảy đúng 2 ô theo 8 hướng, bỏ qua ô giữa. Nước đi thường vẫn còn; điểm đáp hợp lệ theo luật sông, hang và bắt quân. Ô Chông cũng có thể là điểm đáp.
- Bẫy chông gây vết thương vĩnh viễn −1 bậc cho thú có bậc hiện tại ít nhất 6 khi đáp xuống. Mỗi lần đáp là một lần xét vết thương; bậc không thấp hơn 0. Số sức mạnh trên quân hiện màu xanh khi cao hơn bậc gốc và màu đỏ khi thấp hơn.

Luật được tham khảo từ [hướng dẫn Cờ Thú của Thế Giới Di Động](https://www.thegioididong.com/game-app/huong-dan-cach-choi-co-thu-thu-thuat-luat-choi-co-ban-1317796). Giao diện được thiết kế riêng; ảnh tham khảo của người yêu cầu chỉ dùng để định hướng phong cách.
