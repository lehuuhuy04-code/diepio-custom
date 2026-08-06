# KỊCH BẢN THUYẾT TRÌNH KẾT HỢP DEMO DAY THEO THỨ TỰ THỰC TẾ

> **Tài liệu tham chiếu:** Đồ án Cuối kỳ Môn Điện toán đám mây — Hệ thống DiepCustom  
> **Đặc điểm:** Tích hợp trực tiếp **Thao Tác Demo (Đường dẫn Portal / Lệnh cURL / Script Terminal)** đi kèm **Lời Thuyết Trình Mẫu (Vừa nói vừa làm)** sắp xếp **CHÍNH XÁC 100% THEO THỨ TỰ DEMO THỰC TẾ**.

---

## 🚀 THỨ TỰ THUYẾT TRÌNH VÀ DEMO TRỰC TIẾP TỪNG DỊCH VỤ

---

### 1. Azure Blob Storage (`stdiepcustomavt`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Data storage` $\rightarrow$ `Containers` $\rightarrow$ `avatars`
  - **URL Trình duyệt:** `https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg`
  - **Lệnh cURL PowerShell:**
    ```powershell
    curl.exe -sI https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dạ thưa thầy và các bạn, dịch vụ đầu tiên em demo là **Azure Blob Storage (`stdiepcustomavt`)**. Khi em gửi lệnh cURL kiểm tra URL tệp Avatar tĩnh, phản hồi trả về mã HTTP 200 OK. Nhóm áp dụng nguyên tắc Offloading Static Assets — đưa toàn bộ ảnh vector Avatar (.svg) lên Blob Storage với quyền đọc công khai, giúp giảm 100% tải CPU và băng thông tĩnh cho Game Server chính."*

---

### 2. Azure Container Apps (`ca-diepcustom-server`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Lệnh cURL kiểm tra danh sách máy chủ active:**
    ```powershell
    curl.exe -s https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/api/servers
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ hai là **Azure Container Apps (`ca-diepcustom-server`)**. Em đang chạy lệnh cURL trực tiếp tới endpoint API của Container App. Đây chính là 'trái tim' tính toán của hệ thống, host Game Server Node.js/TypeScript và gánh toàn bộ kết nối WebSocket `wss://` thời gian thực. Hạ tầng tự động quản lý chứng chỉ HTTPS Ingress và tự động mở rộng từ 1 đến 10 Replicas dựa theo quy tắc KEDA."*

---

### 3. Azure Cosmos DB (`cosmos-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `cosmos-diepcustom` $\rightarrow$ **`Data Explorer`** $\rightarrow$ Database `diepcustom-db` $\rightarrow$ Container `players` $\rightarrow$ `Items` $\rightarrow$ Bấm **`Refresh`**.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ ba là **Azure Cosmos DB (`cosmos-diepcustom`)**. Mở màn hình Data Explorer trên Portal, thầy có thể thấy trực tiếp các document JSON lưu trữ hồ sơ người chơi và điểm số cao nhất (HighScore). Dữ liệu được lưu với Partition Key `/playerId` giúp tối ưu tốc độ đọc ghi với độ trễ siêu thấp dưới 35ms."*

---

### 4. Azure Cache for Redis (`redis-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Lệnh 1: Test PING (Trả về `AZURE REDIS RESPONSE: PONG`):**
    ```powershell
    node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.ping().then(res => { console.log('AZURE REDIS RESPONSE:', res); process.exit(0); });"
    ```
  - **Lệnh 2: Đọc Chìa Khóa Phiên & Số Giây TTL Đếm Ngược:**
    ```powershell
    node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.keys('session:*').then(keys => { console.log('AZURE REDIS LIVE SESSION KEYS:', keys); if (keys.length > 0) return r.ttl(keys[0]); }).then(ttl => console.log('REMAINING TTL (SECONDS):', ttl)).then(() => process.exit(0));"
    ```
  - **Lệnh 3: Xem Chi Tiết JSON Lưu Trữ Phiên Trong Redis:**
    ```powershell
    node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.keys('session:*').then(keys => { console.log('AZURE REDIS LIVE SESSION KEYS:', keys); if (keys.length > 0) return r.get(keys[0]); }).then(val => console.log('SESSION DATA IN REDIS:', val)).then(() => process.exit(0));"
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ tư là **Azure Cache for Redis (`redis-diepcustom`)**. Em vừa thực thi các câu lệnh Node.js kết nối trực tiếp cổng mã hóa SSL TLS 1.2 Port 10000. Thầy có thể thấy ngay chìa khóa `session:<sessionId>` thực tế nằm trên RAM Redis kèm số giây TTL đếm ngược. Khi người chơi đứt mạng, Redis lưu vết phiên trong 60 giây để khôi phục trạng thái, giải phóng áp lực đọc ghi cho Cosmos DB."*

---

### 5. Azure Service Bus & Logic Apps (Phát Thông Báo Discord)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Service Bus Portal:** `sb-diepcustom` $\rightarrow$ `Topics` $\rightarrow$ `global-announcements` $\rightarrow$ **`Service Bus Explorer`** $\rightarrow$ `Send messages`.
  - **Nội dung JSON Body Copy-Paste:**
    ```json
    {
      "announcementText": "Hệ thống DiepCustom chuẩn bị bảo trì trong 5 phút!",
      "sender": "Admin System"
    }
    ```
  - **Đường dẫn Logic Apps Portal:** `logic-diepcustom-announce` $\rightarrow$ **`Runs history`** (Kiểm tra trạng thái `Succeeded` & xem tin nhắn nổ trên kênh Discord).
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ năm là bộ đôi **Azure Service Bus (`sb-diepcustom`) & Azure Logic Apps (`logic-diepcustom-announce`)**. Em sử dụng Service Bus Explorer để gửi bản tin thông báo bảo trì vào Topic `global-announcements`. Ngay sau đó, mở Logic Apps Runs History thấy lượt chạy `Succeeded`, và trên kênh Discord lập tức nổ tin nhắn thông báo tự động từ BOT mà không cần nhóm phải viết code server."*

---

### 6. Azure Functions (Leaderboard API Export)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **URL API công khai:** `https://func-diepcustom.azurewebsites.net/api/leaderboard`
  - **Lệnh cURL PowerShell:**
    ```powershell
    curl.exe -s https://func-diepcustom.azurewebsites.net/api/leaderboard
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ sáu là **Azure Functions (`func-diepcustom`)**. Em vừa chạy lệnh cURL tới endpoint `/api/leaderboard`, kết quả trả về chuỗi JSON chứa Top 10 người chơi có điểm cao nhất. API Serverless này đọc độc lập từ Cosmos DB mà không làm tiêu tốn CPU/RAM của Game Server chính."*

---

### 7. Azure Key Vault (`kv-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Container App Env:** `ca-diepcustom-server` $\rightarrow$ `Containers` $\rightarrow$ **`Environment Variables`** (xem cú pháp `@Microsoft.KeyVault(SecretUri=...)`).
  - **Đường dẫn Key Vault Portal:** `kv-diepcustom` $\rightarrow$ Menu **`Secrets`** (xem 6 secret bảo mật).
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ bảy là **Azure Key Vault (`kv-diepcustom`)**. Như thầy thấy trên màn hình Environment Variables của Container App, toàn bộ 6 mật khẩu nhạy cảm đều được trích xuất an toàn từ Key Vault qua cú pháp Key Vault Reference kết hợp System-Assigned Managed Identity, tuyệt đối không có mật khẩu nào bị lộ trên Git."*

---

### 8. Azure App Configuration (`appconfig-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn App Config Portal:** `appconfig-diepcustom` $\rightarrow$ **`Configuration explorer`** (xem key `max-players-per-room` = `2` hoặc `30`).
  - **Đường dẫn Restart & Log Stream:** `ca-diepcustom-server` $\rightarrow$ `Revisions and replicas` $\rightarrow$ Restart Revision $\rightarrow$ **`Log stream`** (xem log `[AppConfig] Fetched max-players-per-room: ...`).
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ tám là **Azure App Configuration (`appconfig-diepcustom`)**. Em quản lý tập trung thông số `max-players-per-room` tại đây. Khi em sửa giá trị trên Portal và bấm Restart Revision, mở Log Stream thấy Server lập tức nạp tham số mới mà không cần phải Rebuild Docker Image."*

---

### 9. Azure Application Insights (`appi-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `appi-diepcustom` $\rightarrow$ Menu **`Application map`**.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ chín là **Azure Application Insights (`appi-diepcustom`)**. Mở màn hình Application Map trên Portal, thầy có thể thấy sơ đồ kết nối trực quan giữa Container Apps và Cosmos DB với đo lường độ trễ phản hồi thực tế đạt **33.5ms**, giúp nhóm giám sát hiệu năng toàn hệ thống thời gian thực."*

---

### 10. Azure Entra ID / Easy Auth (`ca-diepcustom-server`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **URL Test Đăng nhập Google Easy Auth:**
    ```text
    https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/.auth/login/google
    ```
  - **Lệnh cURL PowerShell kiểm tra Redirect HTTP 302:**
    ```powershell
    curl.exe -i -X GET https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/.auth/login/google
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ mười là **Azure Entra ID / Easy Auth**. Khi em chạy lệnh cURL, hạ tầng Azure trả về phản hồi HTTP 302 Redirect chuyển hướng sang Google OAuth2. Dịch vụ Easy Auth tự động xử lý xác thực và cấp Cookie an toàn cho client mà không cần tự viết code xác thực phức tạp."*

---

### 11. Azure Container Registry (`acrdiepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `acrdiepcustom` $\rightarrow$ Menu **`Repositories`** $\rightarrow$ `diepcustom-server`.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Thứ mười một là **Azure Container Registry (`acrdiepcustom`)**. Đây là kho lưu trữ Docker Image riêng tư quản lý các bản build của ứng dụng. Khi Container Apps nâng cấp Revision mới, hạ tầng sẽ kéo trực tiếp Docker Image từ ACR nội bộ này."*

---

### 12. Functions Storage Account (`stdiepcustomfunc`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `stdiepcustomfunc` $\rightarrow$ Menu **`Containers`** (xem hệ thống tạo tự động `azure-webjobs-hosts`, `azure-webjobs-secrets`).
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ cuối cùng là **Functions Storage Account (`stdiepcustomfunc`)**. Mở màn hình Containers trên Portal, thầy thấy các container hệ thống chuyên dụng quản lý trạng thái internal và log vận hành cho hàm Serverless Azure Functions."*

---

*Tài liệu Kịch bản Thuyết trình Kết hợp Demo Day 13 Dịch vụ Azure theo Thứ tự Thực tế — Hoàn chỉnh 06/08/2026.*
