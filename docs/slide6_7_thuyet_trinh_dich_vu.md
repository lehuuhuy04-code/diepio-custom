# KỊCH BẢN THUYẾT TRÌNH KẾT HỢP DEMO DAY CHI TIẾT SLIDE 6 & SLIDE 7 (13 DỊCH VỤ AZURE)

> **Tài liệu tham chiếu:** Đồ án Cuối kỳ Môn Điện toán đám mây — Hệ thống DiepCustom  
> **Đặc điểm:** Tích hợp trực tiếp **Thao tác Demo (Đường dẫn Portal / Lệnh cURL / Script Terminal)** đi kèm **Lời thuyết trình mẫu (Vừa nói vừa làm)** đúng 100% theo thứ tự 13 dịch vụ từ Hình 1 (Slide 6) và Hình 2 (Slide 7).

---

## 📸 SLIDE 6: MỤC ĐÍCH DỊCH VỤ - TÍNH TOÁN & LƯU TRỮ DỮ LIỆU (6 DỊCH VỤ THEO HÌNH 1)

---

### 1. Azure Container Apps (`ca-diepcustom-server`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Lệnh cURL kiểm tra danh sách máy chủ active:**
    ```powershell
    curl.exe -s https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/api/servers
    ```
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `ca-diepcustom-server` $\rightarrow$ `Revisions and replicas`.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dạ thưa thầy và các bạn, dịch vụ đầu tiên trong nhóm Tính toán là **Azure Container Apps (`ca-diepcustom-server`)**. Em đang chạy lệnh cURL trực tiếp tới endpoint của Container App trên Cloud. Đây chính là 'trái tim' tính toán của hệ thống, host Game Server Node.js/TypeScript và gánh toàn bộ kết nối WebSocket `wss://` thời gian thực. Hạ tầng tự động quản lý chứng chỉ HTTPS Ingress và tự động mở rộng từ 1 đến 10 Replicas dựa theo quy tắc KEDA mà nhóm không cần tự cấu hình Nginx."*

---

### 2. Azure Container Registry (`acrdiepcustom.azurecr.io`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `acrdiepcustom` $\rightarrow$ Menu **`Repositories`** $\rightarrow$ `diepcustom-server`.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ hai là **Azure Container Registry (`acrdiepcustom.azurecr.io`)**. Khi em mở menu Repositories trên Azure Portal, thầy và các bạn có thể thấy đây là kho Docker Image riêng tư quản lý tập trung các bản build của ứng dụng như `diepcustom-server:v14`. Khi Container Apps nâng cấp Revision mới, hạ tầng sẽ kéo trực tiếp Docker Image từ ACR nội bộ này với tốc độ siêu nhanh trong cùng Region Southeast Asia."*

---

### 3. Azure Cosmos DB NoSQL (`cosmos-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `cosmos-diepcustom` $\rightarrow$ **`Data Explorer`** $\rightarrow$ Database `diepcustom-db` $\rightarrow$ Container `players` $\rightarrow$ `Items` $\rightarrow$ Bấm **`Refresh`**.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ ba là **Azure Cosmos DB (`cosmos-diepcustom`)**. Mở màn hình Data Explorer trên Portal, thầy có thể thấy trực tiếp các document JSON lưu trữ hồ sơ người chơi và điểm số cao nhất (HighScore). Dữ liệu được lưu với Partition Key `/playerId` giúp tối ưu tốc độ đọc ghi với độ trễ siêu thấp dưới 35ms, đảm bảo khi người chơi ghi điểm cao là dữ liệu lập tức được ghi nhận vĩnh viễn vào NoSQL Database."*

---

### 4. Azure Cache for Redis (`redis-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Cách 1: Lệnh Test PING (Trả về `AZURE REDIS RESPONSE: PONG`):**
    ```powershell
    node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.ping().then(res => { console.log('AZURE REDIS RESPONSE:', res); process.exit(0); });"
    ```
  - **Cách 2: Lệnh Đọc Chìa Khóa Phiên & Số Giây TTL Đếm Ngược:**
    ```powershell
    node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.keys('session:*').then(keys => { console.log('AZURE REDIS LIVE SESSION KEYS:', keys); if (keys.length > 0) return r.ttl(keys[0]); }).then(ttl => console.log('REMAINING TTL (SECONDS):', ttl)).then(() => process.exit(0));"
    ```
  - **Cách 3: Lệnh Xem Chi Tiết JSON Lưu Trữ Phiên Trong Redis:**
    ```powershell
    node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.keys('session:*').then(keys => { console.log('AZURE REDIS LIVE SESSION KEYS:', keys); if (keys.length > 0) return r.get(keys[0]); }).then(val => console.log('SESSION DATA IN REDIS:', val)).then(() => process.exit(0));"
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ tư là **Azure Cache for Redis (`redis-diepcustom`)**. Em vừa thực thi các câu lệnh Node.js kết nối trực tiếp cổng mã hóa SSL TLS 1.2 Port 10000 đến Azure Redis. Thầy có thể thấy ngay chìa khóa `session:<sessionId>` thực tế nằm trên RAM Redis kèm số giây TTL đếm ngược. Khi người chơi đứt mạng, Redis lưu vết phiên trong 60 giây để khôi phục trạng thái, giải phóng áp lực đọc ghi cho Cosmos DB."*

---

### 5. Azure Blob Storage (`stdiepcustomavt`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `stdiepcustomavt` $\rightarrow$ **`Containers`** $\rightarrow$ `avatars`.
  - **URL Trình duyệt / Lệnh cURL:**
    ```powershell
    curl.exe -sI https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ năm là **Azure Blob Storage (`stdiepcustomavt`)**. Khi em gửi lệnh cURL kiểm tra URL tệp Avatar tĩnh, phản hồi trả về mã HTTP 200 OK. Nhóm áp dụng nguyên tắc Offloading Static Assets — đưa toàn bộ ảnh vector Avatar (.svg) lên Blob Storage với quyền đọc công khai, giúp giảm 100% tải CPU và băng thông tĩnh cho Game Server."*

---

### 6. Functions Storage Account (`stdiepcustomfunc`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `stdiepcustomfunc` $\rightarrow$ Menu **`Containers`** (xem hệ thống tạo tự động `azure-webjobs-hosts`, `azure-webjobs-secrets`).
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ sáu chốt lại Slide 6 là **Functions Storage Account (`stdiepcustomfunc`)**. Mở màn hình Containers trên Portal, thầy có thể thấy các container hệ thống chuyên dụng quản lý trạng thái internal, lock, mã hóa trigger và lưu trữ log vận hành cho hàm Serverless Azure Functions."*

---

## 📸 SLIDE 7: MỤC ĐÍCH DỊCH VỤ - VẬN HÀNH, TỰ ĐỘNG HÓA & BẢO MẬT (7 DỊCH VỤ THEO HÌNH 2)

---

### 1. Azure Functions (`func-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **URL API công khai:** `https://func-diepcustom.azurewebsites.net/api/leaderboard`
  - **Lệnh cURL PowerShell:**
    ```powershell
    curl.exe -s https://func-diepcustom.azurewebsites.net/api/leaderboard
    ```
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Sang Slide 7, dịch vụ đầu tiên là **Azure Functions (`func-diepcustom`)**. Em vừa chạy lệnh cURL tới endpoint `/api/leaderboard`, kết quả trả về chuỗi JSON chứa Top 10 người chơi có điểm cao nhất. API Serverless này đọc độc lập từ Cosmos DB mà không làm tiêu tốn CPU/RAM của Game Server chính."*

---

### 2. Azure Service Bus (`sb-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `sb-diepcustom` $\rightarrow$ `Topics` $\rightarrow$ `global-announcements` $\rightarrow$ Menu **`Service Bus Explorer`** $\rightarrow$ Chọn **Send messages**.
  - **Nội dung JSON Body Copy-Paste:**
    ```json
    {
      "announcementText": "Hệ thống DiepCustom chuẩn bị bảo trì trong 5 phút!",
      "sender": "Admin System"
    }
    ```
    Bấm nút **`Send`**.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ hai là **Azure Service Bus (`sb-diepcustom`)**. Em đang sử dụng công cụ Service Bus Explorer trên Portal để phát một bản tin sự kiện bảo trì vào Topic `global-announcements`. Bản tin này lập tức được phân phối bất đồng bộ sang 2 Subscriptions cho các phòng chơi và hệ thống tự động hóa."*

---

### 3. Azure Logic Apps (`logic-diepcustom-announce`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `logic-diepcustom-announce` $\rightarrow$ Menu **`Runs history`** (xem trạng thái `Succeeded`).
  - **Kênh Discord:** Mở kênh Discord tích hợp thấy tin nhắn tự động vừa nổ về trong chưa tới 1 giây!
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ ba là **Azure Logic Apps (`logic-diepcustom-announce`)**. Ngay sau khi em gửi bản tin Service Bus, mở màn hình Runs History của Logic Apps thấy xuất hiện lượt chạy `Succeeded`, và trên kênh Discord lập tức nổ tin nhắn thông báo tự động từ BOT mà không cần nhóm phải viết code server."*

---

### 4. Azure Key Vault (`kv-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Màn hình 1 (Container App Env):** `ca-diepcustom-server` $\rightarrow$ `Containers` $\rightarrow$ Menu `Environment variables` (xem cú pháp `@Microsoft.KeyVault(SecretUri=...)`).
  - **Màn hình 2 (Key Vault Secret):** `kv-diepcustom` $\rightarrow$ Menu `Secrets` (xem 6 secret bảo mật).
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ tư là **Azure Key Vault (`kv-diepcustom`)**. Như thầy thấy trên màn hình Environment Variables của Container App, toàn bộ 6 mật khẩu nhạy cảm đều được trích xuất an toàn từ Key Vault qua cú pháp Key Vault Reference kết hợp System-Assigned Managed Identity, tuyệt đối không có mật khẩu nào bị lộ trên Git."*

---

### 5. Azure App Configuration (`appconfig-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Màn hình 1 (App Config Explorer):** `appconfig-diepcustom` $\rightarrow$ `Configuration explorer` (xem key `max-players-per-room` = `2` hoặc `30`).
  - **Màn hình 2 (Restart Revision & Log Stream):** `ca-diepcustom-server` $\rightarrow$ `Revisions and replicas` $\rightarrow$ Restart Revision $\rightarrow$ `Log stream` (xem log `[AppConfig] Fetched max-players-per-room: ...`).
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ năm là **Azure App Configuration (`appconfig-diepcustom`)**. Em quản lý tập trung thông số `max-players-per-room` tại đây. Khi em sửa giá trị trên Portal và bấm Restart Revision, mở Log Stream thấy Server lập tức nạp tham số mới mà không cần phải Rebuild Docker Image."*

---

### 6. Azure Application Insights (`appi-diepcustom`)
* **🖥️ Thao Tác Demo Trực Tiếp:**
  - **Đường dẫn Azure Portal:** `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `appi-diepcustom` $\rightarrow$ Menu **`Application map`**.
* **🗣️ Lời Thuyết Trình (Vừa Nói Vừa Demo):**  
  > *"Dịch vụ thứ sáu là **Azure Application Insights (`appi-diepcustom`)**. Mở màn hình Application Map trên Portal, thầy có thể thấy sơ đồ kết nối trực quan giữa Container Apps và Cosmos DB với đo lường độ trễ phản hồi thực tế đạt **33.5ms**, giúp nhóm giám sát hiệu năng toàn hệ thống thời gian thực."*

---

### 7. Azure Entra ID / Easy Auth (`ca-diepcustom-server`)
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
  > *"Dịch vụ cuối cùng chốt lại Slide 7 là **Azure Entra ID / Easy Auth**. Khi em chạy lệnh cURL, hạ tầng Azure trả về phản hồi HTTP 302 Redirect chuyển hướng sang Google OAuth2. Dịch vụ Easy Auth tự động xử lý xác thực và cấp Cookie an toàn cho client mà không cần tự viết code xác thực phức tạp."*

---

*Tài liệu Kịch bản Thuyết trình Kết hợp Demo Day 13 Dịch vụ Azure — Hoàn chỉnh 06/08/2026.*
