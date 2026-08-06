# KỊCH BẢN THUYẾT TRÌNH CHI TIẾT SLIDE 6 & SLIDE 7 (13 DỊCH VỤ AZURE)

> **Tài liệu tham chiếu:** Đồ án Cuối kỳ Môn Điện toán đám mây — Hệ thống DiepCustom  
> **Đặc điểm:** Sắp xếp **chính xác 100% theo thứ tự 13 dịch vụ từ Hình 1 (Slide 6) và Hình 2 (Slide 7)**, viết dưới dạng các đoạn văn thuyết trình liền mạch, tự nhiên, chính xác với hạ tầng thực tế đã triển khai trên Azure Cloud.

---

## 📸 SLIDE 6: MỤC ĐÍCH DỊCH VỤ - TÍNH TOÁN & LƯU TRỮ DỮ LIỆU (6 DỊCH VỤ THEO HÌNH 1)

---

### 1. Container Apps (`ca-diepcustom-server`)
* **Nội dung slide:** Host Game Server Node.js/TypeScript, xử lý kết nối WebSocket realtime đa người chơi.
> **Lời thuyết trình tự nhiên:**  
> *"Dạ thưa thầy và các bạn, dịch vụ đầu tiên trong nhóm Tính toán là **Azure Container Apps (`ca-diepcustom-server`)**. Đây chính là 'trái tim' tính toán của hệ thống. Tụi em sử dụng dịch vụ Serverless Container này để host Game Server Node.js/TypeScript, gánh toàn bộ kết nối thời gian thực WebSocket `wss://` của người chơi. Container Apps giúp hệ thống tự động mở rộng theo nhu cầu (Autoscaling từ 1 đến 10 Replicas) dựa trên quy tắc KEDA, đồng thời quản lý tự động chứng chỉ bảo mật SSL/TLS HTTPS Ingress mà nhóm không cần cấu hình Nginx phức tạp."*

---

### 2. Container Registry (`acrdiepcustom.azurecr.io`)
* **Nội dung slide:** Kho Private Registry quản lý các bản build Docker Image (tag v1, v10, v14) an toàn.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ hai là **Azure Container Registry (`acrdiepcustom.azurecr.io`)**. Đây là kho lưu trữ Docker Image riêng tư và an toàn của nhóm. Toàn bộ quy trình đóng gói ứng dụng đều được thực hiện thông qua lệnh `az acr build`, lưu trữ các bản build chính thức như `diepcustom-server:v14`. Khi Container Apps cần nâng cấp Revision mới, hạ tầng Azure sẽ kéo trực tiếp Docker Image từ ACR nội bộ với tốc độ đường truyền cực nhanh trong cùng Region Southeast Asia."*

---

### 3. Cosmos DB (NoSQL) (`cosmos-diepcustom`)
* **Nội dung slide:** Lưu trữ Player Profile và HighScore với độ trễ siêu thấp (<35ms) schema linh hoạt.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ ba là **Azure Cosmos DB (`cosmos-diepcustom`)**. Nhóm lựa chọn cơ sở dữ liệu NoSQL này để lưu trữ lâu dài (Persistent Storage) thông tin người chơi và kỷ lục điểm số cao nhất (HighScore). Dữ liệu được lưu trong Container `players` với Partition Key `/playerId` giúp tối ưu tốc độ đọc ghi với độ trễ siêu thấp dưới 35ms. Mỗi khi người chơi ghi điểm cao hoặc ngắt kết nối, game server sẽ tự động cập nhật document JSON vào Cosmos DB mà không làm gián đoạn trải nghiệm chơi game."*

---

### 4. Cache for Redis (`redis-diepcustom`)
* **Nội dung slide:** Lưu cache phiên chơi ngắt kết nối với TTL 60s để phục hồi trạng thái.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ tư là **Azure Cache for Redis (`redis-diepcustom`)**. Dịch vụ này đóng vai trò là bộ nhớ đệm In-Memory Cache lưu trên RAM với độ trễ đọc ghi dưới 1ms. Khi người chơi bị rớt mạng tạm thời hoặc F5, hệ thống lưu vết thông tin phiên kết nối `session:${sessionId}` lên Redis với thời gian sống **TTL 60 giây đếm ngược** qua cổng mã hóa an toàn TLS 1.2 Port 10000 SSL. Nhờ Redis, hệ thống giải phóng bớt áp lực truy vấn cho Cosmos DB, đồng thời tạo ra bộ nhớ dùng chung (Centralized Cache) để các Container Replicas khác nhau có thể nhận diện phiên người chơi khi hệ thống tự động scale."*

---

### 5. Blob Storage (`stdiepcustomavt`)
* **Nội dung slide:** Lưu trữ tài nguyên tĩnh (Static Assets), phân phối tệp Avatar (.svg) với quyền đọc.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ năm là **Azure Blob Storage (`stdiepcustomavt`)**. Nhóm áp dụng nguyên tắc thiết kế **Offloading Static Assets** — tức là tách toàn bộ ảnh vector Avatar động (.svg) ra khỏi Game Server và lưu trên Blob Storage với quyền đọc công khai (Anonymous Blob Access). Khi trình duyệt web client tải game, nó lấy trực tiếp ảnh từ URL Blob công khai, giúp giảm 100% tải CPU và băng thông tĩnh cho Game Server chính."*

---

### 6. Functions Storage (`stdiepcustomfunc`)
* **Nội dung slide:** Storage Account chuyên dụng quản lý state, triggers, và logs cho Azure Functions.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ sáu kết thúc Slide 6 là **Functions Storage Account (`stdiepcustomfunc`)**. Đây là dịch vụ Storage đi kèm bắt buộc để hạ tầng Azure Functions quản lý các tệp cấu hình internal, trạng thái khởi động, mã hóa trigger và lưu trữ log vận hành cho hàm Serverless."*

---

## 📸 SLIDE 7: MỤC ĐÍCH DỊCH VỤ - VẬN HÀNH, TỰ ĐỘNG HÓA & BẢO MẬT (7 DỊCH VỤ THEO HÌNH 2)

---

### 1. Azure Functions (`func-diepcustom`)
* **Nội dung slide:** Cung cấp HTTP API Serverless độc lập xuất dữ liệu Leaderboard JSON.
> **Lời thuyết trình tự nhiên:**  
> *"Sang Slide 7, dịch vụ đầu tiên là **Azure Functions (`func-diepcustom`)**. Tụi em xây dựng API Bảng xếp hạng Top 10 người chơi chạy hoàn toàn trên mô hình Serverless Consumption Plan. API `/api/leaderboard` đọc dữ liệu độc lập từ Cosmos DB và xuất kết quả dạng JSON cho client. Việc tách riêng API này ra Azure Functions giúp người dùng xem bảng xếp hạng thoải mái mà không hề gây tiêu tốn CPU/RAM của Game Server."*

---

### 2. Service Bus (`sb-diepcustom`)
* **Nội dung slide:** Đóng vai trò Message Broker (Pub/Sub) phân phối sự kiện bất đồng bộ.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ hai là **Azure Service Bus (`sb-diepcustom`)**. Nhóm triển khai kiến trúc Event-Driven dựa trên mô hình Pub/Sub. Khi hệ thống có thông báo sự kiện lớn (như thông báo bảo trì hay thông báo sự kiện toàn server), Game Server sẽ phát một bản tin vào Service Bus Topic `global-announcements`. Bản tin này được chia ra 2 Subscriptions độc lập: `sub-global-broadcast` truyền tin tới các phòng chơi khác, và `logicapp-sub` để chuyển cho hệ thống tự động hóa bên ngoài."*

---

### 3. Logic Apps (`logic-diepcustom-announce`)
* **Nội dung slide:** Lắng nghe Subscription để kích hoạt HTTP POST ra Discord Webhook.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ ba là **Azure Logic Apps (`logic-diepcustom-announce`)**. Đây là quy trình tự động hóa Serverless Workflow. Ngay khi có tin nhắn mới xuất hiện trong `logicapp-sub` của Service Bus, Logic Apps sẽ tự động nhận trigger và kích hoạt cuộc gọi HTTP POST Webhook, đẩy thẳng thông báo tự động sang kênh chat Discord trong thời gian chưa tới 1 giây mà không cần viết code server."*

---

### 4. Key Vault (`kv-diepcustom`)
* **Nội dung slide:** Quản lý tập trung, bảo mật tuyệt đối 6 secrets và connection strings.
> **Lời thuyết trình tự nhiên:**  
> *"Về mặt bảo mật, dịch vụ thứ tư là **Azure Key Vault (`kv-diepcustom`)** được nhóm dùng để quản lý tập trung và bảo mật tuyệt đối 6 secrets quan trọng. Container Apps lấy mật khẩu hoàn toàn tự động qua cú pháp **Key Vault Reference** (`@Microsoft.KeyVault(...)`) kết hợp với cơ chế định danh **System-Assigned Managed Identity** và phân quyền RBAC `Key Vault Secrets User`. Nhờ đó, tuyệt đối không có bất kỳ mật khẩu nào bị hardcode trên Git."*

---

### 5. App Config (`appconfig-diepcustom`)
* **Nội dung slide:** Cấu hình các tham số vận hành tĩnh (max-players-per-room, arena-type), cập nhật tức thì qua Restart Revision.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ năm là **Azure App Configuration (`appconfig-diepcustom`)**. Nhóm tách hoàn toàn các tham số cấu hình vận hành — như số người chơi tối đa một phòng `max-players-per-room` và chế độ chơi `arena-type` — ra khỏi code và quản lý tập trung trên App Configuration. Khi quản trị viên thay đổi giá trị trên Portal, nhóm chỉ cần thao tác **Restart Revision** trên Container App là Server sẽ tự động nạp lại thông số mới thể hiện rõ trong Log Stream, hoàn toàn không cần phải Rebuild Docker Image."*

---

### 6. App Insights (`appi-diepcustom`)
* **Nội dung slide:** Giám sát APM (Application Performance Management), vẽ sơ đồ và đo độ trễ.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ sáu là **Azure Application Insights (`appi-diepcustom`)**. Đây là công cụ APM đo lường hiệu năng chuyên sâu. Dịch vụ tự động vẽ sơ đồ **Application Map** trực quan thể hiện mối tương quan kết nối giữa Container Apps và Cosmos DB với độ trễ phản hồi thực tế đạt **33.5ms**, giúp nhóm phát hiện và xử lý sớm các điểm nghẽn hiệu năng."*

---

### 7. Entra ID (`ca-diepcustom-server`)
* **Nội dung slide:** Cung cấp cơ chế xác thực danh tính cấp hạ tầng, redirect Google OAuth2.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ cuối cùng chốt lại Slide 7 là **Azure Entra ID / Easy Auth**. Nhóm tận dụng tính năng Easy Auth tích hợp sẵn của Container Apps để xử lý đăng nhập Google OAuth2. Khi người dùng truy cập đường dẫn `/.auth/login/google`, hạ tầng Azure tự động trả về phản hồi HTTP 302 Redirect sang trang xác thực của Google, giúp đảm bảo an toàn danh tính mà không cần tự viết lớp code OAuth2 phức tạp."*

---

*Tài liệu Kịch bản Thuyết trình Slide 6 & 7 Rút gọn 13 Dịch vụ Azure — Hoàn chỉnh 06/08/2026.*
