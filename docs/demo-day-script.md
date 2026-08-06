# KỊCH BẢN DEMO DAY XUYÊN SUỐT & TÀI LIỆU CHUYÊN SÂU 13 DỊCH VỤ AZURE (AZURE MASTER DEMO & DEEP-DIVE MANUAL)

> **Tài liệu tham chiếu:** Môn học Điện toán đám mây — Đồ án Cuối kỳ DiepCustom  
> **Thời gian cập nhật thực tế:** 06/08/2026  
> **Trạng thái hệ thống:** 13/13 Dịch vụ Azure hoạt động trực tiếp 100% (Verified Live)  
> **Cấu trúc Demo:** Tái cấu trúc thành **1 Câu chuyện Xuyên suốt (Continuous User Story)** theo đúng luồng trải nghiệm người dùng thực tế, chứng minh ứng dụng thực sự sử dụng 100% dịch vụ cloud thật.

---

## MỤC LỤC
1. [Bảng Tổng Hợp Kiểm Thử Trực Tiếp 13 Dịch Vụ Azure](#1-bảng-tổng-hợp-kiểm-thử-trực-tiếp-13-dịch-vụ-azure)
2. [Sơ Đồ Kịch Bản Demo Xuyên Suốt (Tổng Thời Gian: ~16 Phút)](#2-sơ-đồ-kịch-bản-demo-xuyên-suốt-tổng-thời-gian-16-phút)
3. [Kịch Bản Demo Chi Tiết Từng Giai Đoạn & Giải Thích Chuyên Sâu (Deep-Dive)](#3-kịch-bản-demo-chi-tiết-từng-giai-đoạn--giải-thích-chuyên-sâu-deep-dive)

---

## 1. BẢNG TỔNG HỢP KIỂM THỬ TRỰC TIẾP 13 DỊCH VỤ AZURE

| STT | Dịch Vụ Azure | Tên Resource Thật | Lệnh / Hành Động Verify Trực Tiếp | Kết Quả Thực Tế (Live Evidence) | Trạng Thái |
|---|---|---|---|---|---|
| 1 | **Azure Container Apps** | `ca-diepcustom-server` | `az containerapp show -n ca-diepcustom-server -g rg-diepcustom` | `runningStatus: Running`, `provisioningState: Succeeded`, Revision `--0000007` | ✅ HOẠT ĐỘNG |
| 2 | **Azure Container Registry** | `acrdiepcustom.azurecr.io` | `az acr repository show-tags --name acrdiepcustom --repository diepcustom-server` | Đã lưu các image `v13`, `v12`, `task26-27-reverify`... trong Repositories | ✅ HOẠT ĐỘNG |
| 3 | **Azure Cosmos DB** | `cosmos-diepcustom` | `az cosmosdb list -g rg-diepcustom` | Endpoint `https://cosmos-diepcustom.documents.azure.com:443/`, `Succeeded` | ✅ HOẠT ĐỘNG |
| 4 | **Azure Key Vault** | `kv-diepcustom` | `az keyvault secret list --vault-name kv-diepcustom` | Chứa 6 secret bảo mật (`cosmos-connection-string`, `google-client-secret`...) | ✅ HOẠT ĐỘNG |
| 5 | **Azure Blob Storage** | `stdiepcustomavt` | `curl.exe -sI https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg` | `HTTP/1.1 200 OK`, `Content-Type: image/svg+xml` | ✅ HOẠT ĐỘNG |
| 6 | **Azure Cache for Redis** | `redis-diepcustom` | Script test Node.js `ioredis` kết nối cổng TLS 10000 | `Redis PING Response: PONG` (Kết nối TLS 1.2 thành công 100%) | ✅ HOẠT ĐỘNG |
| 7 | **Azure App Configuration** | `appconfig-diepcustom` | `az appconfig kv list --name appconfig-diepcustom` | Fetch thành công `max-players-per-room` (`30`), `arena-type` (`ffa`) | ✅ HOẠT ĐỘNG |
| 8 | **Azure Service Bus** | `sb-diepcustom` | `az servicebus topic subscription list` (Topic `global-announcements`) | Topic active, 2 Subscriptions (`logicapp-sub`, `sub-global-broadcast`) active | ✅ HOẠT ĐỘNG |
| 9 | **Azure Logic Apps** | `logic-diepcustom-announce` | `az logic workflow show -n logic-diepcustom-announce` | `state: Enabled`, nhận tin nhắn từ Service Bus đẩy ra Discord | ✅ HOẠT ĐỘNG |
| 10 | **Azure Functions** | `func-diepcustom` | `curl.exe -s https://func-diepcustom.azurewebsites.net/api/leaderboard` | `HTTP 200 OK`, JSON trả về Top 10 người chơi từ Cosmos DB | ✅ HOẠT ĐỘNG |
| 11 | **Azure Application Insights** | `appi-diepcustom` | Visual sơ đồ Application Map trên Azure Portal | Sơ đồ kết nối `ca-diepcustom-server` $\rightarrow$ `cosmos-diepcustom` (độ trễ 33.5ms, 48 calls) | ✅ HOẠT ĐỘNG |
| 12 | **Azure Entra ID (Easy Auth)** | `ca-diepcustom-server` | `curl.exe -i -X GET https://ca-diepcustom-server.../.auth/login/google` | `HTTP/1.1 302 Found`, Redirect sang `https://accounts.google.com/o/oauth2/v2/auth` | ✅ HOẠT ĐỘNG |
| 13 | **Functions Storage Account** | `stdiepcustomfunc` | `az storage account show -n stdiepcustomfunc` | `status: Succeeded`, Storage quản lý trigger/logs cho Azure Functions | ✅ HOẠT ĐỘNG |

---

## 2. SƠ ĐỒ KỊCH BẢN DEMO XUYÊN SUỐT (TỔNG THỜI GIAN: ~16 PHÚT)

```
[GIAI ĐOẠN 1: Tải Web Client & Asset Avatar] (~1.5 phút)
  │ ──> Mở game client, chứng minh Avatar (.svg) tải trực tiếp từ Azure Blob Storage (stdiepcustomavt)
  ▼
[GIAI ĐOẠN 2: Chơi Game & WebSocket Compute] (~2.5 phút)
  │ ──> Nhập tên, bấm Play. Trình duyệt kết nối WebSocket wss:// tới Azure Container Apps (ca-diepcustom-server)
  ▼
[GIAI ĐOẠN 3: Ghi Dữ Liệu Người Chơi Realtime] (~2.0 phút)
  │ ──> Ghi điểm trong game. Mở Cosmos DB Data Explorer refresh ngay để thấy document người chơi vừa cập nhật
  ▼
[GIAI ĐOẠN 4: Quản Lý Cache Kết Nối & Xác Thực TLS 1.2] (~2.0 phút)
  │ ──> Chạy script test TLS 1.2 cổng 10000 gửi PING -> Redis trả về +PONG, xem log bootup kết nối Redis thành công
  ▼
[GIAI ĐOẠN 5: Tự Động Hóa Sự Kiện & Discord BOT Hook] (~2.0 phút)
  │ ──> Gửi thông báo admin -> Service Bus Topic global-announcements -> Logic App trigger -> Discord nổ tin nhắn
  ▼
[GIAI ĐOẠN 6: Serverless Leaderboard API Export] (~1.5 phút)
  │ ──> Mở URL GET /api/leaderboard của Azure Functions xuất JSON Top 10 người chơi cao điểm nhất từ Cosmos DB
  ▼
[GIAI ĐOẠN 7: Vòng Xác Nhận Hạ Tầng, Bảo Mật & Giám Sát] (~4.5 phút)
  │ ──> Key Vault (xem Key Vault Reference env vars) -> App Configuration (sửa value & restart revision) -> Application Insights (Application Map 33.5ms) -> Easy Auth (Google 302 Redirect) -> ACR & Functions Storage
```

---

## 3. KỊCH BẢN DEMO CHI TIẾT TỪNG GIAI ĐOẠN & GIẢI THÍCH CHUYÊN SÂU (DEEP-DIVE)

---

### GIAI ĐOẠN 1: Tải Web Client & Tài Nguyên Tĩnh Avatar (Azure Blob Storage)
*(Thời lượng ước tính: ~1.5 phút)*

#### 1. Các bước Demo Thực tế:
* **Bước 1 (Hành động):** Mở trình duyệt web client game `index.html`. Mở tab `Network` trên Chrome DevTools hoặc gõ URL cURL công khai:  
  `https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg`
* **Bước 2 (Kỳ vọng thấy gì):** Trình duyệt tải ngay lập tức hình ảnh vector Avatar tank màu xanh lá cây, phản hồi **HTTP 200 OK** với `Content-Type: image/svg+xml`.
* **Bước 3 (Lời giải thích cho Giảng viên):**  
  *"Thưa thầy/cô, toàn bộ hình ảnh Avatar động (.svg) của game được lưu trữ tập trung trên Azure Blob Storage `stdiepcustomavt` với quyền đọc công khai (Anonymous Blob Access). Việc tách biệt các tệp tĩnh này giúp giảm tải hoàn toàn băng thông và CPU cho server game chính."*

#### 2. Kỹ thuật Deep-Dive cho Giảng viên:
* **Resource Name Thật:** `stdiepcustomavt` (Storage Account General Purpose v2)
* **Container Name:** `avatars` (Public Access Level: `Blob`).
* **Lý do thiết kế:** Áp dụng nguyên tắc Offloading Static Assets — đưa tài nguyên tĩnh ra Blob Storage công khai để GameServer dành 100% hiệu năng xử lý WebSocket.

---

### GIAI ĐOẠN 2: Trải Nghiệm Gameplay & Kết Nối Serverless Container (Azure Container Apps)
*(Thời lượng ước tính: ~2.5 phút)*

#### 1. Các bước Demo Thực tế:
* **Bước 1 (Hành động):** Trên giao diện game, nhập tên người chơi (vd: `HuyLee1`), chọn Avatar, bấm "Play". Mở tab Network DevTools lọc kết nối `WS` (WebSocket).
* **Bước 2 (Kỳ vọng thấy gì):** Client lập tức handshake kết nối WebSocket `wss://` đến FQDN của Azure Container Apps:  
  `wss://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io`  
  Người chơi điều khiển tank di chuyển mượt mà, bắn khối hình tăng điểm số thời gian thực.
* **Bước 3 (Lời giải thích cho Giảng viên):**  
  *"Azure Container Apps `ca-diepcustom-server` đóng vai trò trái tim tính toán của hệ thống. Dịch vụ tự động quản lý vòng đời container, HTTPS Ingress certificate và duy trì kết nối WebSocket thời gian thực cho người chơi mà không bị gián đoạn."*

#### 2. Kỹ thuật Deep-Dive cho Giảng viên:
* **Revision Active:** `ca-diepcustom-server--0000007` (Docker image `acrdiepcustom.azurecr.io/diepcustom-server:v13`).
* **Cấu hình Scale:** `minReplicas: 1`, `maxReplicas: 10`. Giữ ít nhất 1 container instance luôn duy trì trạng thái chạy (Running) để giữ kết nối WebSocket không bị ngắt do scale-to-zero.
* **Hỏi & Đóng phản biện:** *"Tại sao không dùng VM mà chọn Container Apps?"* $\rightarrow$ Container Apps là mô hình Serverless Container giúp tự động mở rộng theo nhu cầu (KEDA autoscaler) và tích hợp sẵn Key Vault Reference cấp hạ tầng.

---

### GIAI ĐOẠN 3: Ghi Dữ Liệu Hồ Sơ & Điểm Số Realtime (Azure Cosmos DB)
*(Thời lượng ước tính: ~2.0 phút)*

#### 1. Các bước Demo Thực tế:
* **Bước 1 (Hành động):** Sau khi chơi và đạt điểm cao (HighScore), mở Azure Portal theo đường dẫn:  
  `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `cosmos-diepcustom` $\rightarrow$ `Data Explorer` $\rightarrow$ Database `diepcustom-db` $\rightarrow$ Container `players` $\rightarrow$ `Items` $\rightarrow$ Bấm nút **`Refresh`**.
* **Bước 2 (Kỳ vọng thấy gì):** Giảng viên thấy trực tiếp document JSON vừa xuất hiện/cập nhật dữ liệu thật của người chơi vừa tạo:
  ```json
  {
    "id": "000F0E00000002700000",
    "playerId": "000F0E00000002700000",
    "displayName": "HuyLee1",
    "highScore": 1815,
    "avatarUrl": "https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg",
    "lastPlayedAt": "2026-08-05T23:30:00.000Z"
  }
  ```
* **Bước 3 (Lời giải thích cho Giảng viên):**  
  *"Đây là bằng chứng trực tiếp chứng minh ứng dụng ghi nhận dữ liệu thật vào cơ sở dữ liệu NoSQL Azure Cosmos DB ngay khi người chơi ghi điểm. Dữ liệu được lưu với Partition Key `/playerId` giúp tối ưu độ trễ đọc ghi dưới 35ms."*

#### 2. Kỹ thuật Deep-Dive cho Giảng viên:
* **Database & Container:** Database `diepcustom-db`, Container `players` (Partition Key: `/playerId`).
* **Hỏi & Đóng phản biện:** *"Tại sao có cuộc gọi HTTP 404 từ Cosmos DB trong log Application Insights?"* $\rightarrow$ Khi người chơi mới truy cập lần đầu, SDK gọi `playerStore.getPlayer()`. Cosmos DB trả về 404 (Document Not Found), code server catch lỗi 404 này để tự động tạo mới document mặc định theo đúng thiết kế của SDK.

---

### GIAI ĐOẠN 4: Quản Lý Cache Kết Nối & Xác Thực TLS 1.2 (Azure Cache for Redis) — CHỐT PHƯƠNG ÁN B
*(Thời lượng ước tính: ~2.0 phút)*

#### 1. Các bước Demo Thực tế (Xác Thực Kết Nối An Toàn Qua TLS 10000):
* **Bước 1 (Hành động):** Mở Terminal chạy lệnh Node.js test kết nối PING qua cổng mã hóa TLS 10000 hoặc xem Log Stream trên Container App:
  ```powershell
  node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.ping().then(res => { console.log('AZURE REDIS RESPONSE:', res); process.exit(0); });"
  ```

  ```powershell
  node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.keys('session:*').then(keys => { console.log('AZURE REDIS LIVE SESSION KEYS:', keys); if (keys.length > 0) return r.ttl(keys[0]); }).then(ttl => console.log('REMAINING TTL (SECONDS):', ttl)).then(() => process.exit(0));"
  ```

* **Bước 2 (Kỳ vọng thấy gì):** Terminal phản hồi thành công `AZURE REDIS RESPONSE: PONG`. Đồng thời trong `Log stream` của Container App hiển thị: `[RedisStore] Connected to Azure Cache for Redis.`
* **Bước 3 (Lời giải thích cho Giảng viên):**  
  *"Dịch vụ Azure Cache for Redis được cấu hình và kết nối xác thực an toàn qua SSL Port 10000 với giao thức mã hóa TLS 1.2. Hệ thống quản lý bộ nhớ đệm In-memory fallback layer cho các phiên kết nối ngắt tạm thời (Session Reconnect), đồng thời sẵn sàng ghi nhận chìa khóa phiên `session:${sessionId}` với TTL 60s đếm ngược."*

#### 2. Kỹ thuật Deep-Dive cho Giảng viên:
* **Phân biệt cơ chế Reconnect 60s:** Đối tượng `camera` trong game chứa các hàm và tham chiếu vòng (circular reference) của JS/WASM nên được giữ trực tiếp trên RAM `disconnectedSessions` của GameServer. Đồng thời, `RedisStore.ts` đồng bộ thông tin lưu vết `session:${sessionId}` lên Azure Redis với TTL 60s.

---

### GIAI ĐOẠN 5: Tự Động Hóa Sự Kiện Bất Đồng Bộ & Discord BOT Hook (Service Bus $\rightarrow$ Logic Apps $\rightarrow$ Discord)
*(Thời lượng ước tính: ~2.0 phút)*

#### 1. Các bước Demo Thực tế:
* **Bước 1 (Hành động):** Người chơi/Admin gửi lệnh phát thông báo toàn server (`admin_global_announce`). Mở đồng thời kênh Discord tích hợp và màn hình Azure Portal:  
  `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `logic-diepcustom-announce` $\rightarrow$ `Runs history`.
* **Bước 2 (Kỳ vọng thấy gì):**  
  - Trong màn hình `Runs history` xuất hiện lượt chạy mới với trạng thái **`Succeeded`**.
  - Kênh Discord lập tức nổ tin nhắn thông báo tự động từ BOT trong chưa tới 1 giây!
* **Bước 3 (Lời giải thích cho Giảng viên):**  
  *"Hệ thống áp dụng mô hình Pub/Sub và Event-Driven Architecture. Khi GameServer phát bản tin vào Service Bus Topic `global-announcements`, Azure Logic Apps nhận trigger trên subscription `logicapp-sub` và tự động thực hiện HTTP POST Webhook gửi thông báo ra Discord mà không cần viết code server."*

#### 2. Kỹ thuật Deep-Dive cho Giảng viên:
* **Topic & Subscriptions:** Topic `global-announcements` có 2 Subscriptions độc lập: `logicapp-sub` (kích hoạt Logic App) và `sub-global-broadcast` (chuyển tin nhắn tới các phòng chơi khác).

---

### GIAI ĐOẠN 6: Serverless Leaderboard API Export Độc Lập (Azure Functions)
*(Thời lượng ước tính: ~1.5 phút)*

#### 1. Các bước Demo Thực tế:
* **Bước 1 (Hành động):** Mở một tab trình duyệt mới hoặc Postman gõ URL HTTP GET công khai:  
  `https://func-diepcustom.azurewebsites.net/api/leaderboard`
* **Bước 2 (Kỳ vọng thấy gì):** Trả về chuỗi JSON chứa danh sách Top 10 người chơi có điểm số cao nhất vừa được cập nhật từ Cosmos DB:
  ```json
  {
    "success": true,
    "count": 10,
    "leaderboard": [
      { "displayName": "HuyLee1", "highScore": 1815, "avatarUrl": "https://stdiepcustomavt.../avatar1.svg", ... }
    ]
  }
  ```
* **Bước 3 (Lời giải thích cho Giảng viên):**  
  *"Azure Functions hoạt động theo mô hình Serverless Consumption Plan. API Bảng xếp hạng này chạy hoàn toàn độc lập với Game Server chính, đọc trực tiếp từ Cosmos DB để xuất API công khai mà không làm tiêu tốn CPU/RAM của Game Server."*

#### 2. Kỹ thuật Deep-Dive cho Giảng viên:
* **Authentication:** HTTP Trigger `authLevel: "anonymous"`. Nạp `COSMOS_CONNECTION_STRING` qua Key Vault Reference trong App Settings.

---

### GIAI ĐOẠN 7: Vòng Xác Nhận Hạ Tầng, Bảo Mật & Giám Sát (Key Vault, App Config, App Insights, Easy Auth, ACR, Functions Storage)
*(Thời lượng ước tính: ~4.5 phút)*

#### 1. Azure Key Vault (`kv-diepcustom`) — DEMO BẰNG CHỨNG ĐANG DÙNG CẤP HẠ TẦNG:
* **Bước Demo:** Mở Portal $\rightarrow$ `ca-diepcustom-server` $\rightarrow$ Menu `Environment variables` (hoặc `Containers` $\rightarrow$ `Environment variables`).
* **Kỳ vọng thấy:** Chỉ trực tiếp cho Giảng viên thấy giá trị các biến môi trường đều sử dụng cú pháp **Key Vault Reference**:  
  `@Microsoft.KeyVault(SecretUri=https://kv-diepcustom.vault.azure.net/secrets/cosmos-connection-string/...)`
* **Lời giải thích:** *"Đây là bằng chứng trực tiếp chứng minh ứng dụng đang consume 6 secret từ Key Vault qua System-Assigned Managed Identity và RBAC `Key Vault Secrets User`, tuyệt đối không hardcode bất kỳ mật khẩu nào trong Git."*

#### 2. Azure App Configuration (`appconfig-diepcustom`) — DEMO CẬP NHẬT CẤU HÌNH & RESTART REVISION:
* **Bước Demo:** Mở Portal $\rightarrow$ `appconfig-diepcustom` $\rightarrow$ `Configuration explorer` $\rightarrow$ xem key `max-players-per-room` (giá trị `30`). Thử đổi số trên Portal $\rightarrow$ thực hiện restart revision trên `ca-diepcustom-server` $\rightarrow$ mở `Log stream` thấy log boot nhận giá trị mới.
* **Lời giải thích:** *"GameServer nạp cấu hình `max-players-per-room` và `arena-type` từ Azure App Configuration khi khởi động. Khi cần đổi luật chơi hay thông số game, nhóm chỉ cần sửa trên Portal và restart Revision mà không cần rebuild Docker Image."*

#### 3. Azure Application Insights (`appi-diepcustom`) — DEMO APPLICATION MAP:
* **Bước Demo:** Mở Portal $\rightarrow$ `appi-diepcustom` $\rightarrow$ `Application map`.
* **Kỳ vọng thấy:** Hiển thị sơ đồ trực quan kết nối từ nút xanh `unknown_service:node` (Container App) tới `cosmos-diepcustom` với độ trễ phản hồi **33.5 ms** cho **48 calls**.
* **Lời giải thích:** *"Application Insights tự động vẽ sơ đồ kết nối toàn hệ thống và đo lường độ trễ thực tế giữa các microservices chỉ 33.5ms."*

#### 4. Azure Entra ID / Easy Auth (`ca-diepcustom-server`) — DEMO GOOGLE OAUTH2 302 REDIRECT:
* **Bước Demo:** Mở trình duyệt truy cập:  
  `https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/.auth/login/google`
* **Kỳ vọng thấy:** Trình duyệt trả về **HTTP 302 Found** và chuyển hướng trực tiếp sang trang đăng nhập Google OAuth2 (`https://accounts.google.com/o/oauth2/v2/auth`).
* **Lời giải thích:** *"Dự án sử dụng cơ chế Easy Auth tích hợp sẵn của Container Apps. Hạ tầng Azure tự động xử lý handshake OAuth2 và redirect tới nhà cung cấp danh tính Google mà không cần viết code xác thực phức tạp."*

#### 5. Azure Container Registry (`acrdiepcustom`) & Functions Storage (`stdiepcustomfunc`):
* **Bước Demo:** Mở nhanh màn hình ACR Repositories `diepcustom-server` (xem Docker tag `v13`) và `stdiepcustomfunc` (xem system containers `azure-webjobs-hosts`, `azure-webjobs-secrets`).

---

*Tài liệu Kịch bản Demo Day Xuyên suốt & Master Deep-Dive Manual hoàn chỉnh 06/08/2026.*
