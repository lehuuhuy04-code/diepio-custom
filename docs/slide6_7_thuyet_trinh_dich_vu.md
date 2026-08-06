# KỊCH BẢN THUYẾT TRÌNH CHI TIẾT SLIDE 6 & SLIDE 7 (ĐÚNG THỨ TỰ 13 DỊCH VỤ AZURE)

> **Tài liệu tham chiếu:** Đồ án Cuối kỳ Môn Điện toán đám mây — Hệ thống DiepCustom  
> **Nhóm thực hiện:** Nhóm 2 (5 thành viên)  
> **Đặc điểm:** Sắp xếp **chính xác 100% theo thứ tự 13 dịch vụ từ Hình 1 (Slide 6) và Hình 2 (Slide 7)**, phân công rõ người đọc (xưng "em/tụi em", gọi "thầy/cô") chuẩn bị cho buổi báo cáo.

---

## 👥 BẢNG PHÂN CÔNG THUYẾT TRÌNH VÀ PHỤ TRÁCH DỊCH VỤ

| Họ và Tên | MSSV | Vai Trò & Phụ Trách Hạ Tầng | Dịch Vụ Azure Trình Bày Trong Slide 6 & 7 |
|---|---|---|---|
| **Lê Hữu Huy** | `0023411183` | **Trưởng nhóm**: Thiết kế kiến trúc, Container Apps, Key Vault, Docker ACR | **Container Apps**, **Container Registry (ACR)** (Slide 6) & **Key Vault** (Slide 7) |
| **Phạm Trung Kiên** | `0023410666` | **Thành viên**: Bộ lưu trữ RedisStore, Azure Cache for Redis & Cosmos DB SDK | **Cosmos DB**, **Azure Cache for Redis** (Slide 6) |
| **Nguyễn Xuân Phát** | `0023411063` | **Thành viên**: Serverless Azure Functions Leaderboard API, Blob Storage Avatar tĩnh | **Blob Storage**, **Functions Storage** (Slide 6) & **Azure Functions** (Slide 7) |
| **Trương Thanh Hoài** | `0023410883` | **Thành viên**: Azure Service Bus & tự động hóa Azure Logic Apps Discord Webhook | **Service Bus**, **Logic Apps** (Slide 7) |
| **Trần Trung Hậu** | `0023411203` | **Thành viên**: Azure App Configuration, Application Insights APM monitoring | **App Config**, **App Insights**, **Entra ID (Easy Auth)** (Slide 7) |

---

## 📸 SLIDE 6: MỤC ĐÍCH DỊCH VỤ - TÍNH TOÁN & LƯU TRỮ DỮ LIỆU (6 DỊCH VỤ THEO HÌNH 1)

---

### 1. Azure Container Apps (`ca-diepcustom-server`)
* **Người trình bày:** **Lê Hữu Huy** (Trưởng nhóm — MSSV: `0023411183`)
* **Tóm tắt Slide:** Host Game Server Node.js/TypeScript, xử lý kết nối WebSocket realtime đa người chơi.
> **Lời thuyết trình tự nhiên:**  
> *"Dạ thưa thầy và các bạn, dịch vụ đầu tiên trong nhóm Tính toán là **Azure Container Apps (`ca-diepcustom-server`)**. Đây chính là 'trái tim' tính toán của hệ thống. Tụi em sử dụng dịch vụ Serverless Container này để host Game Server Node.js/TypeScript, gánh toàn bộ kết nối thời gian thực WebSocket `wss://` của người chơi. Container Apps giúp hệ thống tự động mở rộng theo nhu cầu (Autoscaling từ 1 đến 10 Replicas) dựa trên quy tắc KEDA, đồng thời quản lý tự động chứng chỉ bảo mật SSL/TLS HTTPS Ingress mà nhóm không cần cấu hình Nginx phức tạp."*

---

### 2. Azure Container Registry (`acrdiepcustom.azurecr.io`)
* **Người trình bày:** **Lê Hữu Huy** (Trưởng nhóm — MSSV: `0023411183`)
* **Tóm tắt Slide:** Kho Private Registry quản lý các bản build Docker Image (tag v1, v10, v14) an toàn.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ hai là **Azure Container Registry (`acrdiepcustom.azurecr.io`)**. Đây là kho lưu trữ Docker Image riêng tư và an toàn của nhóm. Toàn bộ quy trình đóng gói ứng dụng đều được thực hiện thông qua lệnh `az acr build`, lưu trữ các bản build chính thức như `diepcustom-server:v14`. Khi Container Apps cần nâng cấp Revision mới, hạ tầng Azure sẽ kéo trực tiếp Docker Image từ ACR nội bộ với tốc độ đường truyền cực nhanh trong cùng Region Southeast Asia."*

---

### 3. Azure Cosmos DB NoSQL (`cosmos-diepcustom`)
* **Người trình bày:** **Phạm Trung Kiên** (MSSV: `0023410666`)
* **Tóm tắt Slide:** Lưu trữ Player Profile và HighScore với độ trễ siêu thấp (<35ms) schema linh hoạt.
> **Lời thuyết trình tự nhiên:**  
> *"Dạ tiếp theo em xin trình bày về **Azure Cosmos DB (`cosmos-diepcustom`)**. Nhóm lựa chọn cơ sở dữ liệu NoSQL này để lưu trữ lâu dài (Persistent Storage) thông tin người chơi và kỷ lục điểm số cao nhất (HighScore). Dữ liệu được lưu trong Container `players` với Partition Key `/playerId` giúp tối ưu tốc độ đọc ghi với độ trễ siêu thấp dưới 35ms. Mỗi khi người chơi ghi điểm cao hoặc ngắt kết nối, game server sẽ tự động cập nhật document JSON vào Cosmos DB mà không làm gián đoạn trải nghiệm chơi game."*

---

### 4. Azure Cache for Redis (`redis-diepcustom`)
* **Người trình bày:** **Phạm Trung Kiên** (MSSV: `0023410666`)
* **Tóm tắt Slide:** Lưu cache phiên chơi ngắt kết nối với TTL 60s để phục hồi trạng thái.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ tư là **Azure Cache for Redis (`redis-diepcustom`)**. Dịch vụ này đóng vai trò là bộ nhớ đệm In-Memory Cache lưu trên RAM với độ trễ đọc ghi dưới 1ms. Khi người chơi bị rớt mạng tạm thời hoặc F5, hệ thống lưu vết thông tin phiên kết nối `session:${sessionId}` lên Redis với thời gian sống **TTL 60 giây đếm ngược** qua cổng mã hóa an toàn TLS 1.2 Port 10000 SSL. Nhờ Redis, hệ thống giải phóng bớt áp lực truy vấn cho Cosmos DB, đồng thời tạo ra bộ nhớ dùng chung (Centralized Cache) để các Container Replicas khác nhau có thể nhận diện phiên người chơi khi hệ thống tự động scale."*

---

### 5. Azure Blob Storage (`stdiepcustomavt`)
* **Người trình bày:** **Nguyễn Xuân Phát** (MSSV: `0023411063`)
* **Tóm tắt Slide:** Lưu trữ tài nguyên tĩnh (Static Assets), phân phối tệp Avatar (.svg) với quyền đọc.
> **Lời thuyết trình tự nhiên:**  
> *"Thưa thầy và các bạn, dịch vụ thứ năm là **Azure Blob Storage (`stdiepcustomavt`)**. Nhóm áp dụng nguyên tắc thiết kế **Offloading Static Assets** — tức là tách toàn bộ ảnh vector Avatar động (.svg) ra khỏi Game Server và lưu trên Blob Storage với quyền đọc công khai (Anonymous Blob Access). Khi trình duyệt web client tải game, nó lấy trực tiếp ảnh từ URL Blob công khai, giúp giảm 100% tải CPU và băng thông tĩnh cho Game Server chính."*

---

### 6. Functions Storage Account (`stdiepcustomfunc`)
* **Người trình bày:** **Nguyễn Xuân Phát** (MSSV: `0023411063`)
* **Tóm tắt Slide:** Storage Account chuyên dụng quản lý state, triggers, và logs cho Azure Functions.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ sáu kết thúc Slide 6 là **Functions Storage Account (`stdiepcustomfunc`)**. Đây là dịch vụ Storage đi kèm bắt buộc để hạ tầng Azure Functions quản lý các tệp cấu hình internal, trạng thái khởi động, mã hóa trigger và lưu trữ log vận hành cho hàm Serverless."*

---

## 📸 SLIDE 7: MỤC ĐÍCH DỊCH VỤ - VẬN HÀNH, TỰ ĐỘNG HÓA & BẢO MẬT (7 DỊCH VỤ THEO HÌNH 2)

---

### 1. Azure Functions (`func-diepcustom`)
* **Người trình bày:** **Nguyễn Xuân Phát** (MSSV: `0023411063`)
* **Tóm tắt Slide:** Cung cấp HTTP API Serverless độc lập xuất dữ liệu Leaderboard JSON.
> **Lời thuyết trình tự nhiên:**  
> *"Sang Slide 7, em xin tiếp tục với dịch vụ **Azure Functions (`func-diepcustom`)**. Tụi em xây dựng API Bảng xếp hạng Top 10 người chơi chạy hoàn toàn trên mô hình Serverless Consumption Plan. API `/api/leaderboard` đọc dữ liệu độc lập từ Cosmos DB và xuất kết quả dạng JSON cho client. Việc tách riêng API này ra Azure Functions giúp người dùng xem bảng xếp hạng thoải mái mà không hề gây tiêu tốn CPU/RAM của Game Server."*

---

### 2. Azure Service Bus (`sb-diepcustom`)
* **Người trình bày:** **Trương Thanh Hoài** (MSSV: `0023410883`)
* **Tóm tắt Slide:** Đóng vai trò Message Broker (Pub/Sub) phân phối sự kiện bất đồng bộ.
> **Lời thuyết trình tự nhiên:**  
> *"Dạ, tiếp theo em xin báo cáo về **Azure Service Bus (`sb-diepcustom`)**. Nhóm triển khai kiến trúc Event-Driven dựa trên mô hình Pub/Sub. Khi hệ thống có thông báo sự kiện lớn (như thông báo bảo trì hay thông báo sự kiện toàn server), Game Server sẽ phát một bản tin vào Service Bus Topic `global-announcements`. Bản tin này được chia ra 2 Subscriptions độc lập: `sub-global-broadcast` truyền tin tới các phòng chơi khác, và `logicapp-sub` để chuyển cho hệ thống tự động hóa bên ngoài."*

---

### 3. Azure Logic Apps (`logic-diepcustom-announce`)
* **Người trình bày:** **Trương Thanh Hoài** (MSSV: `0023410883`)
* **Tóm tắt Slide:** Lắng nghe Subscription để kích hoạt HTTP POST ra Discord Webhook.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ ba trên Slide 7 là **Azure Logic Apps (`logic-diepcustom-announce`)**. Đây là quy trình tự động hóa Serverless Workflow. Ngay khi có tin nhắn mới xuất hiện trong `logicapp-sub` của Service Bus, Logic Apps sẽ tự động nhận trigger và kích hoạt cuộc gọi HTTP POST Webhook, đẩy thẳng thông báo tự động sang kênh chat Discord trong thời gian chưa tới 1 giây mà không cần viết code server."*

---

### 4. Azure Key Vault (`kv-diepcustom`)
* **Người trình bày:** **Lê Hữu Huy** (Trưởng nhóm — MSSV: `0023411183`)
* **Tóm tắt Slide:** Quản lý tập trung, bảo mật tuyệt đối 6 secrets và connection strings.
> **Lời thuyết trình tự nhiên:**  
> *"Kính thưa thầy, về mặt bảo mật, nhóm em dùng **Azure Key Vault (`kv-diepcustom`)** để quản lý tập trung và bảo mật tuyệt đối 6 secrets quan trọng. Container Apps lấy mật khẩu hoàn toàn tự động qua cú pháp **Key Vault Reference** (`@Microsoft.KeyVault(...)`) kết hợp với cơ chế định danh **System-Assigned Managed Identity** và phân quyền RBAC `Key Vault Secrets User`. Nhờ đó, tuyệt đối không có bất kỳ mật khẩu nào bị hardcode trên Git."*

---

### 5. Azure App Configuration (`appconfig-diepcustom`)
* **Người trình bày:** **Trần Trung Hậu** (MSSV: `0023411203`)
* **Tóm tắt Slide:** Cấu hình các tham số vận hành tĩnh (max-players-per-room, arena-type), cập nhật tức thì qua Restart Revision.
> **Lời thuyết trình tự nhiên:**  
> *"Dạ em xin tiếp tục với **Azure App Configuration (`appconfig-diepcustom`)**. Nhóm tách hoàn toàn các tham số cấu hình vận hành — như số người chơi tối đa một phòng `max-players-per-room` và chế độ chơi `arena-type` — ra khỏi code và quản lý tập trung trên App Configuration. Khi quản trị viên thay đổi giá trị trên Portal, nhóm chỉ cần thao tác **Restart Revision** trên Container App là Server sẽ tự động nạp lại thông số mới thể hiện rõ trong Log Stream, hoàn toàn không cần phải Rebuild Docker Image."*

---

### 6. Azure Application Insights (`appi-diepcustom`)
* **Người trình bày:** **Trần Trung Hậu** (MSSV: `0023411203`)
* **Tóm tắt Slide:** Giám sát APM (Application Performance Management), vẽ sơ đồ và đo độ trễ.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ thứ sáu là **Azure Application Insights (`appi-diepcustom`)**. Đây là công cụ APM đo lường hiệu năng chuyên sâu. Dịch vụ tự động vẽ sơ đồ **Application Map** trực quan thể hiện mối tương quan kết nối giữa Container Apps và Cosmos DB với độ trễ phản hồi thực tế đạt **33.5ms**, giúp nhóm phát hiện và xử lý sớm các điểm nghẽn hiệu năng."*

---

### 7. Azure Entra ID / Easy Auth (`ca-diepcustom-server`)
* **Người trình bày:** **Trần Trung Hậu** (MSSV: `0023411203`)
* **Tóm tắt Slide:** Cung cấp cơ chế xác thực danh tính cấp hạ tầng, redirect Google OAuth2.
> **Lời thuyết trình tự nhiên:**  
> *"Dịch vụ cuối cùng chốt lại Slide 7 là **Azure Entra ID / Easy Auth**. Nhóm tận dụng tính năng Easy Auth tích hợp sẵn của Container Apps để xử lý đăng nhập Google OAuth2. Khi người dùng truy cập đường dẫn `/.auth/login/google`, hạ tầng Azure tự động trả về phản hồi HTTP 302 Redirect sang trang xác thực của Google, giúp đảm bảo an toàn danh tính mà không cần tự viết lớp code OAuth2 phức tạp."*

---

*Tài liệu Kịch bản Thuyết trình Slide 6 & 7 Chuẩn Thứ Tự Hình 1 & Hình 2 — Hoàn chỉnh 06/08/2026.*
