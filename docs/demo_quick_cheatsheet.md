# BẢNG TRA CỨU NHANH & DỮ LIỆU COPY-PASTE KHI DEMO (DEMO DAY CHEAT SHEET)

> **Tài liệu hỗ trợ thực hành:** Dùng cho cả nhóm tra cứu nhanh tên Resource, đường dẫn Azure Portal và **copy-paste ngay các câu lệnh/JSON payload** trong lúc trình diễn Demo trước Giảng viên mà không cần gõ tay thủ công hay tìm lại trong tài liệu dài.

---

## 📌 BẢNG TRA CỨU TÊN RESOURCE THẬT & ĐƯỜNG DẪN AZURE PORTAL

| STT | Dịch Vụ Azure | Tên Resource Thật | Đường Dẫn Màn Hình Trên Azure Portal |
|---|---|---|---|
| 1 | **Azure Container Apps** | `ca-diepcustom-server` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `ca-diepcustom-server` $\rightarrow$ `Revisions and replicas` / `Containers` $\rightarrow$ `Environment variables` |
| 2 | **Azure Container Registry** | `acrdiepcustom.azurecr.io` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `acrdiepcustom` $\rightarrow$ `Repositories` $\rightarrow$ `diepcustom-server` |
| 3 | **Azure Cosmos DB** | `cosmos-diepcustom` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `cosmos-diepcustom` $\rightarrow$ `Data Explorer` $\rightarrow$ Database `diepcustom-db` $\rightarrow$ Container `players` |
| 4 | **Azure Key Vault** | `kv-diepcustom` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `kv-diepcustom` $\rightarrow$ `Secrets` |
| 5 | **Azure Blob Storage** | `stdiepcustomavt` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `stdiepcustomavt` $\rightarrow$ `Containers` $\rightarrow$ `avatars` |
| 6 | **Azure Cache for Redis** | `redis-diepcustom` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `redis-diepcustom` $\rightarrow$ `Console` (hoặc chạy lệnh Node.js Terminal) |
| 7 | **Azure App Configuration** | `appconfig-diepcustom` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `appconfig-diepcustom` $\rightarrow$ `Configuration explorer` |
| 8 | **Azure Service Bus** | `sb-diepcustom` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `sb-diepcustom` $\rightarrow$ `Topics` $\rightarrow$ `global-announcements` $\rightarrow$ `Service Bus Explorer` |
| 9 | **Azure Logic Apps** | `logic-diepcustom-announce` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `logic-diepcustom-announce` $\rightarrow$ `Runs history` |
| 10 | **Azure Functions** | `func-diepcustom` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `func-diepcustom` $\rightarrow$ `Functions` $\rightarrow$ `leaderboard` |
| 11 | **Azure Application Insights** | `appi-diepcustom` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `appi-diepcustom` $\rightarrow$ `Application map` |
| 12 | **Azure Entra ID (Easy Auth)** | `ca-diepcustom-server` | URL trình duyệt: `https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/.auth/login/google` |
| 13 | **Functions Storage Account** | `stdiepcustomfunc` | `Resource groups` $\rightarrow$ `rg-diepcustom` $\rightarrow$ `stdiepcustomfunc` $\rightarrow$ `Containers` |

---

## 🚀 DỮ LIỆU COPY-PASTE VÀ LỆNH TEST NHANH THEO TỪNG GIAI ĐOẠN DEMO

---

### 🟢 GIAI ĐOẠN 1: Azure Blob Storage (Avatar Tĩnh)
* **URL kiểm tra cURL / Trình duyệt:**
  ```text
  https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg
  ```
* **Lệnh cURL PowerShell:**
  ```powershell
  curl.exe -sI https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg
  ```

---

### 🟢 GIAI ĐOẠN 2: Azure Container Apps (WebSocket Ingress)
* **URL WebSocket Client kết nối:**
  ```text
  wss://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io
  ```

---

### 🟢 GIAI ĐOẠN 4: Azure Cache for Redis (PING & Live Session Keys)

* **1. Lệnh Test PING (Trả về `AZURE REDIS RESPONSE: PONG`):**
  ```powershell
  node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.ping().then(res => { console.log('AZURE REDIS RESPONSE:', res); process.exit(0); });"
  ```

* **2. Lệnh Kiểm Tra Live Key & TTL (Đếm ngược 60s):**
  ```powershell
  node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.keys('session:*').then(keys => { console.log('AZURE REDIS LIVE SESSION KEYS:', keys); if (keys.length > 0) return r.ttl(keys[0]); }).then(ttl => console.log('REMAINING TTL (SECONDS):', ttl)).then(() => process.exit(0));"
  ```

* **3. Lệnh Đọc Giá Trị JSON Lưu Trong Key Redis:**
  ```powershell
  node -e "const Redis = require('ioredis'); const r = new Redis('rediss://default:DAuMJ1npenQONxt4lrOSGk-f4oy2U2DDgAZCAMHAXSA%3D@redis-diepcustom.southeastasia.redis.azure.net:10000', {maxRetriesPerRequest:1}); r.keys('session:*').then(keys => { console.log('AZURE REDIS LIVE SESSION KEYS:', keys); if (keys.length > 0) return r.get(keys[0]); }).then(val => console.log('SESSION DATA IN REDIS:', val)).then(() => process.exit(0));"
  ```

---

### 🟢 GIAI ĐOẠN 5: Azure Service Bus & Logic Apps (Phát Thông Báo Discord)

* **JSON Payload Copy-Paste Trên Service Bus Explorer (Azure Portal):**
  Mở `sb-diepcustom` $\rightarrow$ `Topics` $\rightarrow$ `global-announcements` $\rightarrow$ `Service Bus Explorer` $\rightarrow$ `Send messages` $\rightarrow$ dán đoạn JSON bên dưới vào **Content Body**:
  ```json
  {
    "announcementText": "Hệ thống DiepCustom chuẩn bị bảo trì trong 5 phút!",
    "sender": "Admin System"
  }
  ```

* **(Hoặc) Lệnh Chạy Script Node.js Đẩy Bản Tin Service Bus Qua Terminal:**
  ```powershell
  node scratch/test_sb.js
  ```

---

### 🟢 GIAI ĐOẠN 6: Azure Functions (Leaderboard API Export)

* **URL GET Leaderboard JSON API:**
  ```text
  https://func-diepcustom.azurewebsites.net/api/leaderboard
  ```
* **Lệnh cURL PowerShell:**
  ```powershell
  curl.exe -s https://func-diepcustom.azurewebsites.net/api/leaderboard
  ```

---

### 🟢 GIAI ĐOẠN 7: Azure App Configuration & Easy Auth

* **Chỉnh sửa trên Azure App Configuration Explorer:**
  - Key: `max-players-per-room`
  - Value: `2` (hoặc `30`)
* **Lệnh Restart Revision Trên CLI (Sau khi sửa App Config):**
  ```powershell
  az containerapp revision restart --name ca-diepcustom-server --resource-group rg-diepcustom --revision ca-diepcustom-server--0000010
  ```
* **URL Test Easy Auth Google Login (HTTP 302 Redirect):**
  ```text
  https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/.auth/login/google
  ```
* **Lệnh cURL Kiểm Tra Redirect 302:**
  ```powershell
  curl.exe -i -X GET https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/.auth/login/google
  ```

---

*Tài liệu Bảng Tra Cứu Nhanh & Data Copy-Paste Demo Day Cheat Sheet 06/08/2026.*
