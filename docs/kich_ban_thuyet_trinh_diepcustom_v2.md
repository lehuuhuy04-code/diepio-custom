# KỊCH BẢN THUYẾT TRÌNH BÀI TẬP LỚN CUỐI KỲ (BẢN V2 - VĂN NÓI SINH VIÊN TỰ NHIÊN)
## Đề tài: DIEPCUSTOM - CUSTOM TANK GAME SERVER TRIỂN KHAI TRÊN MICROSOFT AZURE CLOUD
**Nhóm thực hiện**: Nhóm 2 | **Giảng viên hướng dẫn**: ThS. Lê Minh Hiếu
**Thời lượng nói**: Khoảng 12 - 14 phút (khoảng 45 - 60 giây/slide, chừa 3 - 5 phút để Q&A phản biện)
**Phong cách**: Tự nhiên, lưu loát, dễ hiểu, xưng "nhóm em" / "tụi em", gọi giảng viên là "thầy/cô" [14, 24].

---

### Slide 1: Trang tiêu đề & Giới thiệu đồ án
*(Thời lượng đọc: ~45 giây)*

**Lời nói tự nhiên:**
> "Dạ, em xin chào thầy và các bạn đang có mặt trong buổi báo cáo Bài tập lớn môn Điện toán đám mây hôm nay! Nhóm em là **Nhóm 2** [14]. Hôm nay, tụi em rất vui được đại diện nhóm để giới thiệu đến thầy và các bạn đề tài thực hiện trong đợt này, đó là: **'DiepCustom - Custom Tank Game Server triển khai trên hạ tầng Microsoft Azure Cloud'** [14, 24]. Dự án này tụi em tự lên ý tưởng, tự tay đóng gói và vận hành thực tế một hệ thống server game multiplayer thời gian thực [26]. Trong khoảng 12 phút tới, nhóm em sẽ lần lượt đi qua 13 slide, chia sẻ toàn bộ quá trình tụi em thiết kế kiến trúc, cấu hình 13 dịch vụ Azure, cũng như những khó khăn thực tế mà nhóm đã cùng nhau vượt qua [14, 25, 26]. Giờ thì em xin phép bắt đầu luôn nha thầy và các bạn!"

---

### Slide 2: Bối cảnh & Ý tưởng Ứng dụng
*(Thời lượng đọc: ~55 giây)*

**Lời nói tự nhiên:**
> "Đầu tiên, về bối cảnh của đồ án [26]. Khi làm bài tập lớn môn Điện toán đám mây, tụi em thấy các nhóm thường chọn làm web CRUD cơ bản, khá là quen thuộc rồi [26]. Vì thế, nhóm em muốn thử thách bản thân với một bài toán khó và thực tế hơn nhiều: **Triển khai một Game Server multiplayer thời gian thực** dựa trên game diep.io mã nguồn mở [14, 26]. Bài toán này cực kỳ hóc búa vì nó đòi hỏi đường truyền WebSocket liên tục, độ trễ phải siêu thấp tính bằng mili-giây, và phải giữ được trạng thái kết nối ổn định [14, 26]. Thay vì chỉ thuê một con máy chủ ảo (VM) đơn thuần rồi chạy tất cả trên đó, tụi em đã quyết định tận dụng sức mạnh của **kiến trúc đa dịch vụ trên Azure** [14, 26]. Điều này giúp tụi em giải quyết triệt để các vấn đề từ quản lý phiên chơi khi đứt mạng, xử lý database NoSQL, cho tới tự động gửi thông báo hệ thống [26]."

---

### Slide 3: Kiến trúc Hệ thống Lõi: Luồng Thời gian thực (Real-time Loop)
*(Thời lượng đọc: ~60 giây)*

**Lời nói tự nhiên:**
> "Tiếp theo, em xin giới thiệu **Sơ đồ kiến trúc lõi** của hệ thống, thể hiện luồng xử lý thời gian thực [15, 31]. Nhìn vào sơ đồ, thầy và các bạn có thể thấy luồng đi rất rõ ràng:
> *   **Đầu tiên (Luồng 1)**: Máy của người chơi truy cập vào trang web game được host tĩnh trên **Azure Blob Static Website** [15, 34]. Trình duyệt sẽ tải các file tĩnh và engine WebAssembly về máy [15, 34].
> *   **Tiếp theo (Luồng 2)**: Trình duyệt của client sẽ mở một kết nối WebSocket trực tiếp đến **Azure Container Apps** — đây chính là 'trái tim' của hệ thống, nơi chạy game server Node.js/TypeScript [15].
> *   **Cuối cùng (Luồng 3)**: Khi server khởi động hoặc chạy game, nó sẽ nạp cấu hình động từ **App Configuration** và lấy chuỗi kết nối an toàn từ **Azure Key Vault** mà không hề lộ mật khẩu [15, 31]. Khi người chơi ghi điểm cao, điểm số này sẽ được ghi thẳng vào **Azure Cosmos DB** [15, 31]. Còn trạng thái phiên chơi tạm thời sẽ được lưu trên **Azure Cache for Redis** để lỡ người chơi có bị rớt mạng thì vẫn kết nối lại được ngay [15]."

---

### Slide 4: Kiến trúc Mở rộng: Luồng Sự kiện & Serverless
*(Thời lượng đọc: ~60 giây)*

**Lời nói tự nhiên:**
> "Bên cạnh luồng game chính, tụi em còn thiết kế thêm một **Luồng mở rộng** chạy song song theo kiến trúc Serverless và Event-Driven để hệ thống không bị quá tải [16, 33]. Sơ đồ này chia làm 2 nhánh rất thú vị:
> *   **Nhánh thứ nhất bên trên là Luồng bất đồng bộ**: Khi game server phát hiện có sự kiện lớn cần thông báo, nó sẽ bắn một bản tin vào **Azure Service Bus Topic** [16, 33]. Bản tin này được nhân bản thành hai nhánh: một nhánh gửi đến các phòng chơi khác để hiển thị cho game thủ, nhánh còn lại kích hoạt **Azure Logic Apps** thực hiện cuộc gọi Webhook, tự động bắn thông báo thẳng về kênh chat Discord của tụi em [16, 33].
> *   **Nhánh thứ hai bên dưới là Luồng đọc bảng xếp hạng**: Thay vì để người chơi truy vấn trực tiếp vào game server chính gây giật lag game, tụi em tách riêng tác vụ này ra [16, 33]. Tụi em dùng **Azure Functions** chạy Serverless để đọc bảng xếp hạng từ **Cosmos DB** và trả về dữ liệu dạng JSON cho người dùng [16, 33]. Cách làm này giúp bảo vệ tối đa tài nguyên tính toán cho server game chính [16, 33]."

---

### Slide 5: Ma trận Hệ sinh thái 13 Dịch vụ Azure
*(Thời lượng đọc: ~45 giây)*

**Lời nói tự nhiên:**
> "Để hiện thực hóa hai sơ đồ kiến trúc vừa rồi, nhóm em đã tích hợp thành công tổng cộng **13 dịch vụ Azure độc lập** [17]. Trên slide là bảng ma trận phân loại các dịch vụ mà tụi em đã sử dụng, chia làm 4 nhóm chính:
> *   **Về Tính toán (Compute)**: có Container Apps, Container Registry để quản lý Docker Image, và Azure Functions [17].
> *   **Về Dữ liệu & Trạng thái**: có Cosmos DB, Blob Storage lưu ảnh avatar, Redis lưu cache, và Functions Storage [17].
> *   **Về Tự động hóa & Giao tiếp**: có Service Bus và Logic Apps [17].
> *   **Về Bảo mật & Vận hành**: gồm Key Vault bảo mật, App Configuration quản lý tham số, App Insights đo lường hiệu năng và Entra ID phục vụ xác thực [17].
> Nhìn sơ qua thì thấy khá nhiều dịch vụ, nhưng mỗi dịch vụ đều được tụi em chọn lọc kỹ càng để phục vụ đúng một vai trò nhất định trong game [28]."

---

### Slide 6: Mục đích Dịch vụ: Tính toán & Lưu trữ Dữ liệu
*(Thời lượng đọc: ~50 giây)*

**Lời nói tự nhiên:**
> "Ở slide này và slide tiếp theo, tụi em xin đi sâu hơn một chút về vai trò cụ thể của từng dịch vụ [18]. Để tiết kiệm thời gian, em xin phép nhấn mạnh vào các dịch vụ lưu trữ và tính toán cốt lõi:
> *   Đầu tiên là **Azure Container Apps**: Đây là nơi host server game chạy Node.js/TypeScript và gánh toàn bộ kết nối WebSocket thời gian thực của người chơi [18].
> *   Thứ hai là **Azure Cosmos DB**: Tụi em dùng database NoSQL này để lưu hồ sơ người chơi và điểm số cao nhất (HighScore) [18]. Nhờ Cosmos DB có tốc độ ghi siêu nhanh, độ trễ dưới 35ms và schema linh hoạt nên rất thích hợp cho dạng dữ liệu không cần quan hệ bảng phức tạp này [18, 28].
> *   Thứ ba là **Azure Cache for Redis**: Dịch vụ này lưu trữ trạng thái phiên chơi tạm thời [18]. Lỡ như mạng của các bạn bị chập chờn, Redis sẽ lưu session với thời gian sống (TTL) 60 giây để các bạn kịp kết nối lại mà không bị mất phòng [18, 28]."

---

### Slide 7: Mục đích Dịch vụ: Vận hành, Tự động hóa & Bảo mật
*(Thời lượng đọc: ~55 giây)*

**Lời nói tự nhiên:**
> "Tiếp theo là các dịch vụ về vận hành, tự động hóa và bảo mật hệ thống [19]. Ở mảng này, tụi em tâm đắc nhất là cụm **Azure Service Bus và Azure Logic Apps** [19]. Hai dịch vụ này hoạt động theo mô hình Pub/Sub, giúp tụi em tự động hóa quy trình đẩy thông báo sự kiện ra các kênh ngoài như Discord Webhook mà không cần viết một dòng code server nào [19, 29]. Bên cạnh đó, chúng em cũng sử dụng **Azure Key Vault** làm nơi lưu trữ tập trung cực kỳ an toàn cho 6 secret quan trọng của hệ thống như connection string của database hay mật khẩu dev [19, 59]. Mọi thông số cấu hình của game như số người chơi tối đa hay chế độ chơi đấu trường đều được tụi em tách riêng ra **Azure App Configuration** [19]. Nhờ vậy, mỗi lần muốn đổi luật chơi hay chỉnh thông số game, tụi em chỉ cần sửa trên Azure Portal là xong, không cần phải build lại code rất mất thời gian [19, 37]."

---

### Slide 8: Tích hợp Kỹ thuật: Cơ chế Zero Hardcoded Secrets
*(Thời lượng đọc: ~50 giây)*

**Lời nói tự nhiên:**
> "Bây giờ, nhóm em xin trình bày về cách tích hợp kỹ thuật giữa các dịch vụ [20]. Điểm mà nhóm tự hào nhất ở mặt bảo mật chính là áp dụng triệt để nguyên tắc **'Zero Hardcoded Secrets'** — tức là tuyệt đối không lưu bất kỳ chuỗi mật khẩu hay API Key nào trong code của dự án [20, 27].
> Quy trình hoạt động khi hệ thống khởi chạy gồm 3 bước:
> *   **Bước 1**: Tiến trình trên Azure Container Apps và Azure Functions được kích hoạt khởi động [20].
> *   **Bước 2**: Hạ tầng Azure sẽ tự động cấp quyền truy cập nội bộ an toàn thông qua cơ chế **System-Assigned Managed Identity** và phân quyền RBAC chặt chẽ [20, 27].
> *   **Bước 3**: Sau khi được xác thực, Container App sẽ dùng cơ chế Key Vault Reference để tự động trích xuất các chuỗi kết nối an toàn từ Key Vault, đồng thời kéo các cấu hình game động như `max-players` từ App Configuration về môi trường chạy [20]. Tất cả đều tự động và khép kín [20]."

---

### Slide 9: Tích hợp Kỹ thuật: Quản lý Trạng thái & Bất đồng bộ
*(Thời lượng đọc: ~60 giây)*

**Lời nói tự nhiên:**
> "Ở slide này, tụi em xin giải thích chi tiết hơn về cách tụi em lập trình tích hợp cho hai tính năng quan trọng của game [20]:
> *   **Đầu tiên là Luồng Reconnect 60 giây**: Khi người chơi bị rớt mạng, server sẽ ghi nhận mất tín hiệu và gọi giao thức TLS 1.2 qua cổng bảo mật 10000 để lưu vết session lên **Azure Cache for Redis** với thời gian sống TTL đúng 60 giây [20]. Nếu trong vòng 60 giây đó người chơi kết nối lại, hệ thống sẽ khôi phục trạng thái ngay lập tức; quá 60 giây thì Redis sẽ tự động xóa sạch dữ liệu để tiết kiệm tài nguyên [20].
> *   **Thứ hai là Luồng Broadcast thông báo**: Khi game server bắn bản tin, nó được gửi vào **Service Bus Topic** `global-announcements` [20]. Ngay lập tức, **Azure Logic Apps** nhận được trigger và thực hiện một lệnh HTTP POST Webhook để đẩy thông báo thẳng về Discord của tụi em trong thời gian chưa tới 1 giây [20]."

---

### Slide 10: Tối ưu Ngân sách & Cloud FinOps
*(Thời lượng đọc: ~50 giây)*

**Lời nói tự nhiên:**
> "Khi làm việc với Cloud, tụi em hiểu rằng quản lý chi phí là một kỹ năng cực kỳ quan trọng [21]. Dự án của nhóm sử dụng gói tài trợ **Azure for Students** trị giá 100 USD [21, 42]. Trước khi bắt đầu code và deploy, tài khoản của nhóm chỉ còn 56.12 USD [21, 42]. Để tránh rủi ro hệ thống tự động scale vô hạn làm 'cháy túi', tụi em đã thiết lập cảnh báo ngân sách (Budget) ở mốc 50 USD và cấu hình gửi email tự động khi chạm các ngưỡng 50%, 80% và 95% [21, 42]. Nhờ áp dụng chiến lược tối ưu chi phí cực kỳ chặt chẽ, sử dụng mô hình **Serverless Consumption** cho Azure Functions và cơ chế tự động co giãn scale-to-zero khi không có người chơi, tổng chi phí thực tế tụi em dùng trong suốt đợt đồ án này **chỉ tốn có 4.90 USD** [21, 42]! Số dư tài khoản hiện tại của tụi em vẫn cực kỳ an toàn ở mức 51.22 USD [21, 42]."

---

### Slide 11: Kết quả Kiểm thử & Trạng thái Hệ thống
*(Thời lượng đọc: ~60 giây)*

**Lời nói tự nhiên:**
> "Sau thời gian dài cùng nhau cày cuốc, nhóm em đã tiến hành audit hệ thống vào ngày 4 tháng 8 năm 2026 và đạt kết quả cực kỳ thành công: **13/13 dịch vụ Azure đang hoạt động ổn định 100%** [21, 51].
> Cụ thể tụi em đã kiểm thử trực tiếp:
> *   Game server chạy trên Container Apps rất mượt, duy trì kết nối WebSocket ổn định liên tục trên 5 phút mà không hề bị ngắt [21, 43].
> *   Dữ liệu ghi nhận điểm số cao nhất lên Cosmos DB có độ phản hồi siêu nhanh, chỉ mất khoảng **33.5ms** [21, 44].
> *   Cơ chế kết nối bảo mật TLS và lệnh PONG từ Redis hoạt động chính xác [21, 44].
> *   Đặc biệt là lỗi ghép phòng đã được giải quyết: hai người chơi mở chung link URL đã vào chung một phòng game thời gian thực, có thể nhìn thấy tank và bắn đạn vào nhau [21, 44].
> *   Hàm API bảng xếp hạng Serverless trả về JSON rất nhanh và BOT Discord cũng nhận thông báo tức thì dưới 1 giây [21, 45]."

---

### Slide 12: Đánh giá Hạn chế & Hướng Phát triển
*(Thời lượng đọc: ~55 giây)*

**Lời nói tự nhiên:**
> "Với tinh thần học thuật nghiêm túc, nhóm em cũng thẳng thắn nhìn nhận hệ thống hiện tại vẫn còn một số điểm hạn chế kỹ thuật [22, 46]:
> *   **Thứ nhất**: Lỗi phát sinh từ file WebAssembly (WASM) binary gốc khiến party code bị sinh ngẫu nhiên [22, 47]. Do không có mã nguồn C++ gốc để compile lại file WASM này, tụi em hiện phải dùng giải pháp workaround can thiệp bằng JavaScript ở client để ghi đè mã phòng sạch trước khi gửi lên server [22, 41, 47].
> *   **Thứ hai**: Game chưa hỗ trợ chơi trên điện thoại di động vì code gốc diep.io chưa có bộ điều khiển cảm ứng, dẫn đến màn hình bị đen khi vào bằng điện thoại [22, 47].
> *   **Thứ ba**: Tụi em chưa tích hợp được Azure CDN do giới hạn tài nguyên của tài khoản học sinh [22, 47].
> *   **Thứ tư**: Hiện tượng tự động reset phòng chơi sau khoảng 60 giây khi có từ 3 người chơi trở lên cùng tham gia, tụi em nghi ngờ do cơ chế timeout hoặc scale-to-zero của Container Apps mà chưa kịp điều tra sâu thêm [22, 48]."

---

### Slide 13: Cảm ơn thầy và các bạn đã lắng nghe
*(Thời lượng đọc: ~45 giây)*

**Lời nói tự nhiên:**
> "Để khắc phục những hạn chế đó, trong tương lai tụi em dự định sẽ nghiên cứu dịch ngược sâu hơn file WASM để xử lý triệt để lỗi party code từ gốc, đồng thời phát triển giao diện Touch Controls cho di động [22, 48]. Tụi em cũng sẽ thiết lập hệ thống tự động hóa CI/CD qua GitHub Actions để mỗi lần commit code là hệ thống tự build Docker image và deploy lên Container Apps [22, 49].
> Tóm lại, đồ án đã hoàn thành xuất sắc các mục tiêu đề ra ban đầu, giúp tụi em học hỏi được rất nhiều về cách vận hành thực tế các dịch vụ đám mây Azure [45, 46].
> Nhóm em xin chân thành cảm ơn thầy và các bạn đã lắng nghe phần thuyết trình hôm nay! Mọi người có thể xem mã nguồn dự án tại link GitHub trên slide [23, 50]. Bây giờ tụi em rất mong nhận được những câu hỏi phản biện và đóng góp ý kiến từ thầy để đồ án hoàn thiện hơn nữa ạ [23]!"

---

## GỢI Ý CÁCH TRẢ LỜI CÂU HỎI PHẢN BIỆN CỦA GIẢNG VIÊN

### Câu hỏi dự phòng: "Vì sao không có nút đăng nhập Google trong giao diện game?"
**Cách trả lời trung thực, khéo léo và khoa học:**
> *"Dạ thưa thầy/cô, đây đúng là một giới hạn kỹ thuật thực tế của dự án ở thời điểm hiện tại. Do tụi em giữ nguyên cấu trúc giao diện và engine WebAssembly gốc của game diep.io để đảm bảo tính khách quan và tập trung tối đa nguồn lực vào việc xây dựng, tối ưu hóa lớp hạ tầng đám mây bao quanh, nên tụi em chưa tích hợp nút đăng nhập Google trực tiếp lên giao diện của game [30].*
> 
> *Tuy nhiên, dịch vụ xác thực danh tính **Azure Entra ID / Easy Auth** ở cấp hạ tầng của hệ thống vẫn hoạt động cực kỳ tốt và hoàn chỉnh [37]. Tụi em đã cấu hình thành công nhà cung cấp Google Identity Provider cho Container App [37, 52]. Khi tụi em thử nghiệm truy cập trực tiếp vào endpoint xác thực là `/.auth/login/google`, hạ tầng Azure lập tức phản hồi mã **HTTP 302 Found** và tự động redirect người dùng sang trang đăng nhập chính thức của Google OAuth2 một cách mượt mà [52]. Điều này chứng minh phần hạ tầng xác thực đã sẵn sàng 100%, sau này khi phát triển thêm phần giao diện game thì tụi em chỉ cần kết nối nút bấm vào endpoint này là hoàn thành ạ [37, 52]."*
