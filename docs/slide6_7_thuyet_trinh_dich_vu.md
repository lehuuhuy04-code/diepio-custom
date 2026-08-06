# KỊCH BẢN THUYẾT TRÌNH BỔ SUNG SLIDE 6 & 7: CHI TIẾT 13 DỊCH VỤ AZURE C THEO PHÂN CÔNG THÀNH VIÊN

> **Tài liệu tham chiếu:** Đồ án Cuối kỳ Môn Điện toán đám mây — Hệ thống DiepCustom  
> **Nhóm thực hiện:** Nhóm 2 (5 thành viên)  
> **Đặc điểm:** Thay thế phần giới thiệu sơ sài của Slide 6 & Slide 7 cũ bằng **kịch bản phân công đọc cụ thể cho từng thành viên**, viết dưới dạng **đoạn văn liền mạch, tự nhiên, chính xác 100% với hạ tầng thực tế đã triển khai trên Azure Cloud**.

---

## 👥 BẢNG PHÂN CÔNG THUYẾT TRÌNH VÀ PHỤ TRÁCH DỊCH VỤ

| Họ và Tên | MSSV | Vai Trò & Phụ Trách Hạ Tầng | Dịch Vụ Azure Trình Bày Trong Slide 6 & 7 |
|---|---|---|---|
| **Lê Hữu Huy** | `0023411183` | **Trưởng nhóm**: Thiết kế kiến trúc, Container Apps, Key Vault, quy trình build & push Docker ACR | **Container Apps**, **Container Registry (ACR)**, **Key Vault** |
| **Phạm Trung Kiên** | `0023410666` | **Thành viên**: Bộ lưu trữ RedisStore, tích hợp Azure Cache for Redis & Cosmos DB SDK, Session Reconnect | **Cosmos DB**, **Azure Cache for Redis** |
| **Nguyễn Xuân Phát** | `0023411063` | **Thành viên**: Serverless Azure Functions Leaderboard API, tích hợp Blob Storage Avatar tĩnh | **Blob Storage**, **Azure Functions**, **Functions Storage Account** |
| **Trương Thanh Hoài** | `0023410883` | **Thành viên**: Luồng thông báo sự kiện Azure Service Bus & tự động hóa Azure Logic Apps Discord Webhook | **Service Bus**, **Logic Apps** |
| **Trần Trung Hậu** | `0023411203` | **Thành viên**: Cấu hình tập trung Azure App Configuration, tích hợp Application Insights APM monitoring | **App Configuration**, **Application Insights**, **Entra ID (Easy Auth)** |

---

## 🎤 NỘI DUNG THUYẾT TRÌNH CHI TIẾT THEO PHÂN CÔNG THÀNH VIÊN

---

### PHẦN 1: BÁO CÁO HẠ TẦNG TÍNH TOÁN & BẢO MẬT HẠ TẦNG
**Người trình bày:** **Lê Hữu Huy** (Trưởng nhóm — MSSV: `0023411183`)

> **Lời nói tự nhiên:**  
> *"Kính thưa thầy và các bạn, với vai trò thiết kế tổng thể kiến trúc hạ tầng Cloud cho dự án DiepCustom, em xin phép trình bày chi tiết về 3 dịch vụ tính toán và bảo mật cấp hạ tầng mà em trực tiếp triển khai:*  
>  
> *   **Thứ nhất là Azure Container Apps (`ca-diepcustom-server`)**: Đây chính là 'trái tim' tính toán của hệ thống. Tụi em sử dụng dịch vụ Serverless Container này để host Game Server Node.js/TypeScript, gánh toàn bộ kết nối thời gian thực WebSocket `wss://` của người chơi. Container Apps giúp hệ thống tự động mở rộng theo nhu cầu (Autoscaling từ 1 đến 10 Replicas) dựa trên quy tắc KEDA, đồng thời quản lý tự động chứng chỉ bảo mật SSL/TLS HTTPS Ingress mà nhóm không cần phải cấu hình Nginx phức tạp.  
> *   **Thứ hai là Azure Container Registry (`acrdiepcustom.azurecr.io`)**: Đây là kho lưu trữ Docker Image riêng tư và an toàn của nhóm. Toàn bộ quy trình đóng gói ứng dụng đều được thực hiện thông qua lệnh `az acr build`, lưu trữ các bản build chính thức như `diepcustom-server:v14`. Khi Container Apps cần nâng cấp Revision mới, hạ tầng Azure sẽ kéo trực tiếp Docker Image từ ACR nội bộ với tốc độ đường truyền cực nhanh trong cùng Region Southeast Asia.  
> *   **Thứ ba là Azure Key Vault (`kv-diepcustom`)**: Nhóm em áp dụng triệt để nguyên tắc **Zero Hardcoded Secrets**. Toàn bộ 6 chuỗi kết nối và mật khẩu nhạy cảm — bao gồm connection string của Cosmos DB, Redis, Service Bus và Google OAuth Client Secret — đều được lưu tập trung trong Key Vault. Container Apps lấy mật khẩu hoàn toàn tự động qua cú pháp **Key Vault Reference** (`@Microsoft.KeyVault(...)`) kết hợp với cơ chế định danh **System-Assigned Managed Identity** và phân quyền RBAC `Key Vault Secrets User`. Nhờ đó, tuyệt đối không có bất kỳ mật khẩu nào bị lộ trên Git."*

---

### PHẦN 2: BÁO CÁO DỮ LIỆU & BỘ NHỚ ĐỆM PHIÊN CHƠI
**Người trình bày:** **Phạm Trung Kiên** (MSSV: `0023410666`)

> **Lời nói tự nhiên:**  
> *"Dạ, tiếp theo em xin đại diện nhóm trình bày về 2 dịch vụ dữ liệu NoSQL và bộ nhớ đệm In-Memory mà em phụ trách xây dựng:*  
>  
> *   **Đầu tiên là Azure Cosmos DB (`cosmos-diepcustom`)**: Nhóm lựa chọn cơ sở dữ liệu NoSQL này để lưu trữ lâu dài (Persistent Storage) thông tin người chơi và kỷ lục điểm số cao nhất (HighScore). Dữ liệu được lưu trong Container `players` với Partition Key `/playerId` giúp tối ưu tốc độ đọc ghi với độ trễ siêu thấp dưới 35ms. Mỗi khi người chơi ghi điểm cao hoặc ngắt kết nối, game server sẽ tự động cập nhật document JSON vào Cosmos DB mà không làm gián đoạn trải nghiệm chơi game.  
> *   **Thứ hai là Azure Cache for Redis (`redis-diepcustom`)**: Dịch vụ này đóng vai trò là bộ nhớ đệm In-Memory Cache lưu trên RAM với độ trễ đọc ghi dưới 1ms. Khi người chơi bị rớt mạng tạm thời hoặc F5, hệ thống lưu vết thông tin phiên kết nối `session:${sessionId}` lên Redis với thời gian sống **TTL 60 giây đếm ngược** qua cổng mã hóa an toàn TLS 1.2 Port 10000 SSL. Nhờ Redis, hệ thống giải phóng bớt áp lực truy vấn cho Cosmos DB, đồng thời tạo ra bộ nhớ dùng chung (Centralized Cache) để các Container Replicas khác nhau có thể nhận diện phiên người chơi khi hệ thống tự động scale."*

---

### PHẦN 3: BÁO CÁO TÀI NGUYÊN TĨNH & API SERVERLESS
**Người trình bày:** **Nguyễn Xuân Phát** (MSSV: `0023411063`)

> **Lời nói tự nhiên:**  
> *"Thưa thầy và các bạn, em xin phép báo cáo về nhóm dịch vụ Serverless API và lưu trữ tài nguyên tĩnh mà em phụ trách triển khai:*  
>  
> *   **Thứ nhất là Azure Blob Storage (`stdiepcustomavt`)**: Nhóm áp dụng nguyên tắc thiết kế **Offloading Static Assets** — tức là tách toàn bộ ảnh vector Avatar động (.svg) ra khỏi Game Server và lưu trên Blob Storage với quyền đọc công khai (Anonymous Blob Access). Khi trình duyệt web client tải game, nó lấy trực tiếp ảnh từ URL `https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg`, giúp giảm 100% tải CPU và băng thông tĩnh cho Game Server chính.  
> *   **Thứ hai là Azure Functions (`func-diepcustom`)**: Tụi em xây dựng API Bảng xếp hạng Top 10 người chơi chạy hoàn toàn trên mô hình Serverless Consumption Plan. API `/api/leaderboard` đọc dữ liệu độc lập từ Cosmos DB và xuất kết quả dạng JSON cho client. Việc tách riêng API này ra Azure Functions giúp người dùng xem bảng xếp hạng thoải mái mà không hề gây tiêu tốn CPU/RAM của Game Server.  
> *   **Thứ ba là Functions Storage Account (`stdiepcustomfunc`)**: Đây là dịch vụ Storage đi kèm bắt buộc để hạ tầng Azure Functions quản lý các tệp cấu hình internal, trạng thái khởi động, mã hóa trigger và lưu trữ log vận hành cho hàm Serverless."*

---

### PHẦN 4: BÁO CÁO THÔNG BÁO BẤT ĐỒNG BỘ & TỰ ĐỘNG HÓA EVENT-DRIVEN
**Người trình bày:** **Trương Thanh Hoài** (MSSV: `0023410883`)

> **Lời nói tự nhiên:**  
> *"Dạ, em xin tiếp tục phần báo cáo về 2 dịch vụ tin nhắn bất đồng bộ và tự động hóa quy trình mà em trực tiếp thiết kế:*  
>  
> *   **Thứ nhất là Azure Service Bus (`sb-diepcustom`)**: Nhóm triển khai kiến trúc Event-Driven dựa trên mô hình Pub/Sub. Khi hệ thống có thông báo sự kiện lớn (như thông báo bảo trì hay thông báo sự kiện toàn server), Game Server sẽ phát một bản tin vào Service Bus Topic `global-announcements`. Bản tin này được chia ra 2 Subscriptions độc lập: `sub-global-broadcast` truyền tin tới các phòng chơi khác, và `logicapp-sub` để chuyển cho hệ thống tự động hóa bên ngoài.  
> *   **Thứ hai là Azure Logic Apps (`logic-diepcustom-announce`)**: Đây là quy trình tự động hóa Serverless Workflow. Ngay khi có tin nhắn mới xuất hiện trong `logicapp-sub` của Service Bus, Logic Apps sẽ tự động nhận trigger và kích hoạt cuộc gọi HTTP POST Webhook, đẩy thẳng thông báo tự động sang kênh chat Discord trong thời gian chưa tới 1 giây. Toàn bộ luồng tích hợp này được thiết kế bằng sơ đồ trực quan trên Azure Portal mà không cần viết thêm bất kỳ dòng code server nào."*

---

### PHẦN 5: BÁO CÁO CẤU HÌNH TẬP TRUNG, GIÁM SÁT APM & XÁC THỰC EASY AUTH
**Người trình bày:** **Trần Trung Hậu** (MSSV: `0023411203`)

> **Lời nói tự nhiên:**  
> *"Dạ em xin kết thúc phần thuyết trình dịch vụ bằng 3 thành phần về quản lý cấu hình, giám sát và xác thực mà em phụ trách:*  
>  
> *   **Thứ nhất là Azure App Configuration (`appconfig-diepcustom`)**: Nhóm tách hoàn toàn các tham số cấu hình vận hành — như số người chơi tối đa một phòng `max-players-per-room` và chế độ chơi `arena-type` — ra khỏi code và quản lý tập trung trên App Configuration. Khi quản trị viên thay đổi giá trị trên Portal, nhóm chỉ cần thao tác **Restart Revision** trên Container App là Server sẽ tự động nạp lại thông số mới thể hiện rõ trong Log Stream, hoàn toàn không cần phải Rebuild Docker Image.  
> *   **Thứ hai là Azure Application Insights (`appi-diepcustom`)**: Đây là công cụ APM đo lường hiệu năng chuyên sâu. Dịch vụ tự động vẽ sơ đồ **Application Map** trực quan thể hiện mối tương quan kết nối giữa Container Apps và Cosmos DB với độ trễ phản hồi thực tế đạt **33.5ms**, giúp nhóm phát hiện và xử lý sớm các điểm nghẽn hiệu năng.  
> *   **Thứ ba là Azure Entra ID / Easy Auth (`ca-diepcustom-server`)**: Nhóm tận dụng tính năng Easy Auth tích hợp sẵn của Container Apps để xử lý đăng nhập Google OAuth2. Khi người dùng truy cập đường dẫn `/.auth/login/google`, hạ tầng Azure tự động trả về phản hồi HTTP 302 Redirect sang trang xác thực của Google, giúp đảm bảo an toàn danh tính mà không cần tự viết lớp code OAuth2 phức tạp."*

---

*Tài liệu Kịch bản Thuyết trình Bổ sung Slide 6 & 7 hoàn chỉnh 06/08/2026.*
