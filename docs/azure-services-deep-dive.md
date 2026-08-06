# TÀI LIỆU CHUYÊN SÂU 13 DỊCH VỤ AZURE — DỰ ÁN DIEPCUSTOM (AZURE DEEP-DIVE MANUAL)

> **Dành cho:** Báo cáo phản biện Demo Day & Trả lời câu hỏi vặn vẹo của Giảng viên  
> **Thời gian cập nhật:** 05/08/2026  
> **Mục tiêu:** Cung cấp câu trả lời chuyên sâu 100% cho từng dịch vụ, từng key, secret, container, topic, subscription và cơ chế kỹ thuật bên trong hệ thống.

---

## MỤC LỤC
1. [Dịch Vụ 1: Azure Container Apps (`ca-diepcustom-server`)](#dịch-vụ-1-azure-container-apps-ca-diepcustom-server)
2. [Dịch Vụ 2: Azure Container Registry (`acrdiepcustom.azurecr.io`)](#dịch-vụ-2-azure-container-registry-acrdiepcustomazurecrio)
3. [Dịch Vụ 3: Azure Cosmos DB (`cosmos-diepcustom`)](#dịch-vụ-3-azure-cosmos-db-cosmos-diepcustom)
4. [Dịch Vụ 4: Azure Key Vault (`kv-diepcustom`) — Giải Thích Chi Tiết 6 Secret](#dịch-vụ-4-azure-key-vault-kv-diepcustom--giải-thích-chi-tiết-6-secret)
5. [Dịch Vụ 5: Azure Blob Storage (`stdiepcustomavt`)](#dịch-vụ-5-azure-blob-storage-stdiepcustomavt)
6. [Dịch Vụ 6: Azure Cache for Redis (`redis-diepcustom`)](#dịch-vụ-6-azure-cache-for-redis-redis-diepcustom)
7. [Dịch Vụ 7: Azure App Configuration (`appconfig-diepcustom`) — Giải Thích Chi Tiết 3 Key](#dịch-vụ-7-azure-app-configuration-appconfig-diepcustom--giải-thích-chi-tiết-3-key)
8. [Dịch Vụ 8: Azure Service Bus (`sb-diepcustom`)](#dịch-vụ-8-azure-service-bus-sb-diepcustom)
9. [Dịch Vụ 9: Azure Logic Apps (`logic-diepcustom-announce`)](#dịch-vụ-9-azure-logic-apps-logic-diepcustom-announce)
10. [Dịch Vụ 10: Azure Functions (`func-diepcustom`)](#dịch-vụ-10-azure-functions-func-diepcustom)
11. [Dịch Vụ 11: Azure Application Insights (`appi-diepcustom`)](#dịch-vụ-11-azure-application-insights-appi-diepcustom)
12. [Dịch Vụ 12: Azure Entra ID / Easy Auth (`ca-diepcustom-server`)](#dịch-vụ-12-azure-entra-id--easy-auth-ca-diepcustom-server)
13. [Dịch Vụ 13: Functions Storage Account (`stdiepcustomfunc`)](#dịch-vụ-13-functions-storage-account-stdiepcustomfunc)

---

### DỊCH VỤ 1: Azure Container Apps (`ca-diepcustom-server`)

* **Tên Resource Thật:** `ca-diepcustom-server`
* **Resource Group:** `rg-diepcustom` | **Region:** Southeast Asia
* **SKU / Tier:** Serverless Consumption Plan
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `ca-diepcustom-server` $\rightarrow$ `Overview` / `Revisions` / `Secrets`.

#### 1. Các thành phần bên trong & Thông số kỹ thuật:
* **Revision active (`--0000005`):** Bản deployment mới nhất chạy Docker image `acrdiepcustom.azurecr.io/diepcustom-server:task26-27-reverify`. Mỗi lần sửa code và deploy, Container Apps tạo ra một Revision độc lập giúp rollback tức thì khi cần.
* **Cấu hình Scale (`minReplicas: 1`, `maxReplicas: 10`):** Giữ ít nhất 1 container instance luôn duy trì trạng thái chạy (Running) để giữ kết nối WebSocket `wss://` liên tục cho người chơi mà không bị rớt kết nối do scale-to-zero.
* **Ingress Settings:** Mở cổng HTTPS công khai tại Target Port `8080` (hoặc biến env `PORT`), giao thức `Auto/HTTP` hỗ trợ nâng cấp kết nối HTTP/1.1 sang WebSocket (`wss://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io`).

#### 2. Lý do tồn tại & Vai trò trong hệ thống:
* Đóng vai trò **"trái tim tính toán"** (Core Game Engine Server) của hệ thống. Nhận và xử lý hàng trăm gói tin WebSocket/giây từ client (gửi tọa độ tank, hướng bắn, di chuyển, va chạm).

#### 3. Bộ câu hỏi phản biện chuyên sâu dành cho Giảng viên:
* **Hỏi:** *"Tại sao chọn Container Apps mà không dùng Virtual Machine (VM) hay App Service?"*  
  **Trả lời:** Container Apps là mô hình Serverless Container, giúp nhóm không tốn công quản trị OS như VM, hỗ trợ đóng gói Docker chuẩn hóa và tích hợp sẵn HTTPS Ingress WebSocket cũng như Key Vault Reference cấp hạ tầng.
* **Hỏi:** *"Nếu nhiều người chơi cùng lúc thì Container Apps xử lý ra sao?"*  
  **Trả lời:** Khi lưu lượng tăng, KEDA autoscaler của Container Apps dựa trên lượng kết nối HTTP/WS để tự động nâng số instance từ 1 lên tối đa 10 replicas.

---

### DỊCH VỤ 2: Azure Container Registry (`acrdiepcustom.azurecr.io`)

* **Tên Resource Thật:** `acrdiepcustom.azurecr.io`
* **Resource Group:** `rg-diepcustom` | **Region:** Southeast Asia
* **SKU / Tier:** Basic Tier
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `acrdiepcustom` $\rightarrow$ Menu bên trái chọn `Services` $\rightarrow$ `Repositories` $\rightarrow$ `diepcustom-server`.

#### 1. Các thành phần bên trong & Thông số kỹ thuật:
* **Repository `diepcustom-server`:** Kho lưu trữ chứa các Docker image Linux/amd64 được build từ mã nguồn TypeScript của dự án.
* **Danh sách Image Tags:** Lưu trữ các phiên bản image qua các giai đoạn phát triển (`task26-27-reverify` - bản mới nhất đã fix lỗi websocket crash, `v10`, `v1`...).

#### 2. Lý do tồn tại & Vai trò trong hệ thống:
* Đóng vai trò **Private Container Image Store** độc quyền của dự án. Giúp bảo mật toàn bộ mã nguồn đóng gói, không đẩy image lên Docker Hub công khai. Container Apps tự động xác thực và pull image từ ACR này qua Managed Identity / Admin Credentials.

#### 3. Bộ câu hỏi phản biện chuyên sâu dành cho Giảng viên:
* **Hỏi:** *"Làm sao Container Apps kéo được image từ ACR nếu ACR là kho riêng tư (Private)?"*  
  **Trả lời:** Container Apps sử dụng tài khoản Admin Credentials được lưu an toàn dưới dạng secret `acrdiepcustomazurecrio-acrdiepcustom` hoặc Managed Identity để tự động authenticate với ACR qua cổng mã hóa TLS.

---

### DỊCH VỤ 3: Azure Cosmos DB (`cosmos-diepcustom`)

* **Tên Resource Thật:** `cosmos-diepcustom`
* **Resource Group:** `rg-diepcustom` | **Region:** Southeast Asia
* **API / SKU:** Core (SQL) NoSQL API, Provisioned / Serverless
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `cosmos-diepcustom` $\rightarrow$ `Data Explorer` $\rightarrow$ Database `diepcustom-db` $\rightarrow$ Container `players` $\rightarrow$ `Items`.

#### 1. Các thành phần bên trong & Chi tiết Document Schema:
* **Database `diepcustom-db` / Container `players` (Partition Key: `/playerId`):** Lưu trữ toàn bộ hồ sơ và điểm số người chơi.
* **Chi tiết từng trường dữ liệu (Document JSON):**
  - `playerId` (String): Mã định danh duy nhất của người chơi (vd: `000F0E00000002700000` hoặc string ngẫu nhiên).
  - `displayName` (String): Tên hiển thị người chơi nhập trên giao diện (vd: `"HuyLee1"`).
  - `highScore` (Number): Điểm số cao nhất người chơi đạt được trong trận đấu.
  - `avatarUrl` (String): URL công khai trỏ tới hình ảnh avatar (.svg) trên Blob Storage.
  - `lastPlayedAt` (ISO Date String): Thời điểm gần nhất người chơi truy cập và cập nhật điểm.

#### 2. Lý do tồn tại & Vai trò trong hệ thống:
* Cung cấp cơ sở dữ liệu NoSQL lưu trữ bền vững (Persistent Storage). Chọn NoSQL vì cấu trúc dữ liệu người chơi linh hoạt, không cần mối quan hệ bảng rườm rà và đòi hỏi độ trễ đọc/ghi cực thấp.

#### 3. Bộ câu hỏi phản biện chuyên sâu dành cho Giảng viên:
* **Hỏi:** *"Độ trễ ghi dữ liệu của Cosmos DB là bao nhiêu?"*  
  **Trả lời:** Qua kết quả kiểm thử thực tế bằng Application Insights, độ trễ phản hồi (Response Latency) của Cosmos DB chỉ đạt trung bình **33.5 ms**, đảm bảo việc lưu điểm số ngay khi người chơi kết thúc trận không gây khựng game.
* **Hỏi:** *"Tại sao lại có cuộc gọi HTTP 404 từ Cosmos DB trong log Application Insights?"*  
  **Trả lời:** Khi người chơi mới tham gia lần đầu, code gọi `playerStore.getPlayer(playerId)`. Do người chơi mới chưa có document, Cosmos DB SDK trả về mã HTTP 404 (Document Not Found). Đây là thiết kế chuẩn của SDK, code server catch lỗi 404 này để tự động tạo mới document mặc định.

---

### DỊCH VỤ 4: Azure Key Vault (`kv-diepcustom`) — Giải Thích Chi Tiết 6 Secret

* **Tên Resource Thật:** `kv-diepcustom`
* **Resource Group:** `rg-diepcustom` | **Region:** Southeast Asia | **Vault URI:** `https://kv-diepcustom.vault.azure.net/`
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `kv-diepcustom` $\rightarrow$ `Secrets`.

#### 1. GIẢI THÍCH CHI TIẾT VAI TRÒ & LÝ DO TỒN TẠI CỦA ĐỦ 6 SECRET:

1. `cosmos-connection-string`:
   - **Nội dung:** Chuỗi kết nối bảo mật chứa AccountEndpoint `https://cosmos-diepcustom.documents.azure.com:443/` và AccountKey của Cosmos DB.
   - **TẠI SAO CÓ:** Giúp GameServer và Azure Functions kết nối trực tiếp đến Cosmos DB mà không hardcode key vào mã nguồn.
   - **SỬ DỤNG NHƯ THẾ NÀO:** Container App nạp vào biến môi trường `COSMOS_CONNECTION_STRING` qua Key Vault Reference, SDK `@azure/cosmos` nạp biến này để khởi tạo `CosmosClient`.

2. `redis-connection-string`:
   - **Nội dung:** Chuỗi kết nối TLS mã hóa trỏ đến `rediss://default:...@redis-diepcustom.southeastasia.redis.azure.net:10000`.
   - **TẠI SAO CÓ:** Quản lý quyền truy cập bảo mật vào cụm Azure Cache for Redis qua cổng SSL 10000.
   - **SỬ DỤNG NHƯ THẾ NÀO:** Lớp `RedisStore.ts` nạp chuỗi này để thư viện `ioredis` mở kết nối bảo mật TLS 1.2.

3. `servicebus-connection-string`:
   - **Nội dung:** Shared Access Key Connection String của Service Bus namespace `sb-diepcustom`.
   - **TẠI SAO CÓ:** Cấp quyền cho GameServer Publish bản tin thông báo vào Topic `global-announcements`.
   - **SỬ DỤNG NHƯ THẾ NÀO:** Lớp `AnnouncementBus.ts` sử dụng SDK `@azure/service-bus` nạp chuỗi này để gửi bản tin bất đồng bộ.

4. `appinsights-connection-string`:
   - **Nội dung:** Chuỗi kết nối Telemetry Ingestion Endpoint của Application Insights `appi-diepcustom`.
   - **TẠI SAO CÓ:** Định tuyến toàn bộ log, metric hiệu năng và tracing từ GameServer về dashboard giám sát trên Azure Portal.
   - **SỬ DỤNG NHƯ THẾ NÀO:** SDK `applicationinsights` khởi tạo ở dòng đầu tiên của `src/index.ts` nạp chuỗi này để tự động thu thập telemetry.

5. `google-client-secret`:
   - **Nội dung:** Secret Key của ứng dụng Google OAuth2 được tạo trên Google Cloud Console.
   - **TẠI SAO CÓ:** Phục vụ cho tính năng xác thực đăng nhập người dùng Easy Auth.
   - **SỬ DỤNG NHƯ THẾ NÀO:** Container App cấu hình bí danh `google-provider-authentication-secret` trỏ tới Key Vault Secret này, giúp hạ tầng Azure tự động thực hiện OAuth2 handshake khi người dùng mở `/.auth/login/google`.

6. `dev-password-hash`:
   - **Nội dung:** Chuỗi mã hóa băm (SHA-256) của mật khẩu quản trị viên (Developer Password).
   - **TẠI SAO CÓ:** Phân quyền quản trị cho phép thực hiện các lệnh admin (như phát thông báo toàn server) trên client game.
   - **SỬ DỤNG NHƯ THẾ NÀO:** GameServer so sánh chuỗi băm của mật khẩu người chơi nhập vào với biến `process.env.DEV_PASSWORD_HASH` lấy từ Key Vault.

#### 2. Bộ câu hỏi phản biện chuyên sâu dành cho Giảng viên:
* **Hỏi:** *"Làm sao ứng dụng đọc được Key Vault mà không cần lưu mật khẩu truy cập Key Vault?"*  
  **Trả lời:** Ứng dụng sử dụng cơ chế **System-Assigned Managed Identity**. Hạ tầng Azure tự động cấp cho Container App một Identity (Danh tính) trong Entra ID. Sau đó, nhóm phân quyền RBAC `Key Vault Secrets User` cho Identity này, giúp ứng dụng tự động xác thực với Key Vault qua hạ tầng mạng nội bộ của Azure.

---

### DỊCH VỤ 5: Azure Blob Storage (`stdiepcustomavt`)

* **Tên Resource Thật:** `stdiepcustomavt`
* **Resource Group:** `rg-diepcustom` | **Region:** Southeast Asia
* **SKU / Tier:** Standard LRS (General Purpose v2)
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `stdiepcustomavt` $\rightarrow$ `Containers` $\rightarrow$ `avatars`.

#### 1. Các thành phần bên trong:
* **Container `avatars`:** Cấu hình **Public Access Level: `Blob` (Anonymous Read Access for blobs only)**.
* **Danh sách Tệp:** `avatar1.svg`, `avatar2.svg`, `avatar3.svg`, `avatar4.svg`, `avatar5.svg`.

#### 2. Lý do tồn tại & Vai trò trong hệ thống:
* Lưu trữ tài nguyên tệp tĩnh (Static Assets). Hình ảnh avatar dạng vector `.svg` được client trình duyệt tải trực tiếp qua URL công khai (`https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg`), trả về phản hồi HTTP 200 OK với Content-Type `image/svg+xml`. Điều này giúp GameServer không tốn băng thông và CPU để phục vụ hình ảnh tĩnh.

---

### DỊCH VỤ 6: Azure Cache for Redis (`redis-diepcustom`)

* **Tên Resource Thật:** `redis-diepcustom`
* **Resource Group:** `rg-diepcustom` | **SSL Port:** `10000` (TLS 1.2 Mandatory)
* **SKU / Tier:** Basic C1 Tier
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `redis-diepcustom` $\rightarrow$ Menu `Developer tools` $\rightarrow$ `Console` (hoặc xem log `[RedisStore] Connected...`).

#### 1. Các thành phần bên trong & Cơ chế dữ liệu:
* **Key Format:** `session:${sessionId}` (Data type: String JSON, TTL: 60 giây).
* **Nội dung lưu giữ:** Lưu vết thông tin ngắt kết nối tạm thời (`sessionId`, `expireAt`, `partyCode`, `createdAt`).

#### 2. Giải thích cơ chế Reconnect 60s (Tránh bị bẫy câu hỏi):
* Đối tượng `camera` trong game chứa các hàm và tham chiếu vòng (circular reference) của JS/WASM nên được giữ trực tiếp trên RAM `disconnectedSessions` của GameServer. Đồng thời, `RedisStore.ts` đồng bộ thông tin lưu vết `session:${sessionId}` lên Azure Redis với TTL 60s. Phản hồi lệnh `PING` từ Redis Console trả về `+PONG`.

---

### DỊCH VỤ 7: Azure App Configuration (`appconfig-diepcustom`) — Giải Thích Chi Tiết 3 Key

* **Tên Resource Thật:** `appconfig-diepcustom`
* **Resource Group:** `rg-diepcustom` | **Endpoint:** `https://appconfig-diepcustom.azconfig.io`
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `appconfig-diepcustom` $\rightarrow$ `Configuration explorer`.

#### 1. GIẢI THÍCH CHI TIẾT VAI TRÒ CỦA ĐỦ 3 KEY:

1. `max-players-per-room` (Giá trị: `30`):
   - **Ý nghĩa:** Định nghĩa số lượng người chơi tối đa cho phép tham gia trong một phòng game đấu trường.
   - **TẠI SAO CÓ:** Tách biệt thông số giới hạn phòng ra khỏi code. Nếu muốn đổi từ 30 thành 50 người/phòng, chỉ cần sửa key này trên App Configuration mà không cần sửa code TypeScript.
   - **CODE ĐỌC THẾ NÀO:** `appConfigStore.getNumber("max-players-per-room", 20)` đọc giá trị khi server boot up.

2. `arena-type` (Giá trị: `ffa`):
   - **Ý nghĩa:** Chế độ đấu trường mặc định của game (`ffa` = Free For All - Đấu đơn tự do).
   - **TẠI SAO CÓ:** Cho phép chuyển đổi chế độ chơi mặc định mà không cần rebuild container.

3. `countdown-duration` (Giá trị: `10`):
   - **Ý nghĩa:** Thời gian đếm ngược (10 giây) trước khi bắt đầu trận đấu hoặc sự kiện phòng.

---

### DỊCH VỤ 8: Azure Service Bus (`sb-diepcustom`)

* **Tên Resource Thật:** `sb-diepcustom`
* **Resource Group:** `rg-diepcustom` | **Namespace:** `sb-diepcustom`
* **SKU / Tier:** Standard Tier (Hỗ trợ Topics & Subscriptions)
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `sb-diepcustom` $\rightarrow$ `Topics` $\rightarrow$ `global-announcements` $\rightarrow$ `Subscriptions`.

#### 1. Các thành phần bên trong & Mô hình Pub/Sub:
* **Topic `global-announcements`:** Nơi nhận các bản tin thông báo được Publish từ GameServer.
* **Subscription 1 (`logicapp-sub`):** Phân phối bản tin tới Azure Logic Apps để đẩy thông báo ra Discord.
* **Subscription 2 (`sub-global-broadcast`):** Phân phối bản tin tới các instance GameServer khác để hiển thị chữ thông báo trên màn hình người chơi.

---

### DỊCH VỤ 9: Azure Logic Apps (`logic-diepcustom-announce`)

* **Tên Resource Thật:** `logic-diepcustom-announce`
* **Resource Group:** `rg-diepcustom` | **State:** `Enabled`
* **SKU / Tier:** Consumption Plan
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `logic-diepcustom-announce` $\rightarrow$ `Runs history`.

#### 1. Các thành phần bên trong Workflow:
* **Trigger (`When a message is received in a topic subscription`):** Kết nối API Connection tới Service Bus Topic `global-announcements`, subscription `logicapp-sub`.
* **Action (`HTTP POST Webhook`):** Gửi dữ liệu JSON chứa nội dung thông báo tới Discord Webhook URL (`https://discord.com/api/webhooks/...`).

---

### DỊCH VỤ 10: Azure Functions (`func-diepcustom`)

* **Tên Resource Thật:** `func-diepcustom`
* **Resource Group:** `rg-diepcustom` | **Runtime:** Node.js v20 Serverless Consumption
* **URL API:** `https://func-diepcustom.azurewebsites.net/api/leaderboard`
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `func-diepcustom` $\rightarrow$ `Functions` $\rightarrow$ `leaderboard`.

#### 1. Cơ chế hoạt động & Kết quả trả về:
* **HTTP Trigger Function:** Cho phép truy cập công khai không cần API Key (`authLevel: "anonymous"`).
* **Kết quả JSON trả về:**
  ```json
  {
    "success": true,
    "count": 10,
    "leaderboard": [
      { "displayName": "HuyLee1", "highScore": 1815, ... }
    ]
  }
  ```
* **Lý do tách riêng:** Độc lập truy vấn Cosmos DB để phục vụ Bảng xếp hạng bên ngoài mà không làm tiêu tốn CPU/RAM của GameServer chính.

---

### DỊCH VỤ 11: Azure Application Insights (`appi-diepcustom`)

* **Tên Resource Thật:** `appi-diepcustom`
* **Resource Group:** `rg-diepcustom` | **Workspace:** `law-diepcustom` (Log Analytics)
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `appi-diepcustom` $\rightarrow$ `Application map`.

#### 1. Thành phần quan trọng trên Portal:
* **Application Map:** Hiển thị nút màu xanh `unknown_service:node` (Container App) liên lạc với `cosmos-diepcustom*` qua HTTP với độ trễ **33.5 ms** cho **48 calls**. Chứng minh các dịch vụ kết nối thật 100%.

---

### DỊCH VỤ 12: Azure Entra ID / Easy Auth (`ca-diepcustom-server`)

* **Tên Resource Thật:** Easy Auth trên `ca-diepcustom-server`
* **Resource Group:** `rg-diepcustom`
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `ca-diepcustom-server` $\rightarrow$ `Authentication`.

#### 1. Cơ chế hoạt động & HTTP 302 Redirect:
* Cấu hình Google Provider với Client ID `883611695493-...apps.googleusercontent.com` và bí danh secret `google-provider-authentication-secret`.
* Khi gọi `GET /.auth/login/google`, hạ tầng Azure lập tức phản hồi **HTTP 302 Found** và chuyển hướng trình duyệt tới trang đăng nhập Google OAuth2 (`https://accounts.google.com/o/oauth2/v2/auth`).

---

### DỊCH VỤ 13: Functions Storage Account (`stdiepcustomfunc`)

* **Tên Resource Thật:** `stdiepcustomfunc`
* **Resource Group:** `rg-diepcustom` | **SKU:** Standard LRS
* **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `stdiepcustomfunc` $\rightarrow$ `Containers`.

#### 1. Thành phần bên trong & Lý do tồn tại:
* Chứa các system container: `azure-webjobs-hosts`, `azure-webjobs-secrets`.
* **Lý do tồn tại:** Đây là tài khoản lưu trữ bắt buộc dành riêng cho Azure Functions quản lý state, lock leases và trigger logs. Tách biệt hoàn toàn khỏi `stdiepcustomavt` (lưu Avatar) để đảm bảo nguyên tắc thiết kế độc lập dịch vụ (Decoupled Microservices Architecture).

---
*Tài liệu tra cứu chuyên sâu được tạo ngày 05/08/2026.*
