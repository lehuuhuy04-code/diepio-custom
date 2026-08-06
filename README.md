# 🎮 DiepCustom — Game Server Engine & Kiến Trúc Đám Mây Azure (Cloud Native Architecture)

> **Môn học:** Điện toán đám mây (Cloud Computing)  
> **Đồ án Cuối kỳ:** Xây dựng & Triển khai Hệ thống Game Server Realtime đa dịch vụ trên Microsoft Azure  
> **Repository:** [https://github.com/lehuuhuy04-code/diepio-custom.git](https://github.com/lehuuhuy04-code/diepio-custom.git)

---

## 📌 TỔNG QUAN DỰ ÁN

**DiepCustom** là một game engine chơi mạng thời gian thực (Real-time Multiplayer Game) dựa trên giao thức WebSocket, được nâng cấp và triển khai hoàn toàn theo kiến trúc **Cloud Native** trên hạ tầng Microsoft Azure.

Hệ thống tích hợp **13 dịch vụ đám mây Azure độc lập**, đạt các tiêu chuẩn về tính sẵn sàng cao (High Availability), tự động mở rộng (Auto-Scaling), bảo mật tập trung (Centralized Security & Key Vault), xử lý sự kiện bất đồng bộ (Event-Driven Architecture) và giám sát tập trung (Observability).

---

## 🏗️ KIẾN TRÚC HỆ THỐNG (AZURE CLOUD ARCHITECTURE)

Hệ thống bao gồm 2 nhóm kiến trúc xử lý chính:

### 1. Kiến Trúc Luồng Lõi (Core Real-time Loop)
```
[Client Web Browser] ──(HTTPS/WSS)──> [Azure Container Apps (ca-diepcustom-server)]
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
       [Azure Key Vault]            [Azure Cosmos DB]              [Azure Blob Storage]
      (kv-diepcustom)             (cosmos-diepcustom)               (stdiepcustomavt)
               │                               │                               │
               ▼                               ▼                               ▼
      Secret Connection             Hồ sơ Player Profile,            Tệp Avatar tĩnh
         Strings                     HighScore, Stats                (.svg công khai)
```

### 2. Kiến Trúc Sự Kiện & Serverless (Event-Driven & Serverless Loop)
```
  [Container App / Client] ──────> [Azure Service Bus Topic] (global-announcements)
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
     [Subscription: logicapp-sub]                        [Subscription: sub-global-broadcast]
                       │                                               │
                       ▼                                               ▼
         [Azure Logic Apps]                                     [GameServer Instances]
   (logic-diepcustom-announce)                                  (Broadcasting to Clients)
                       │
                       ▼
            [Discord Webhook BOT]
```

---

## ☁️ DANH SÁCH 13 DỊCH VỤ AZURE ĐÃ TRIỂN KHAI

| STT | Dịch Vụ Azure | Tên Resource Thật | Vai Trò & Tích Hợp Kỹ Thuật |
|---|---|---|---|
| 1 | **Azure Container Apps** | `ca-diepcustom-server` | Host Game Server Node.js/TypeScript chính, xử lý kết nối WebSocket `wss://` tự động scale |
| 2 | **Azure Container Registry** | `acrdiepcustom.azurecr.io` | Private Docker Registry lưu trữ các bản build image của dự án |
| 3 | **Azure Cosmos DB** | `cosmos-diepcustom` | Database NoSQL lưu trữ thông tin người chơi (`players` container), điểm số cao nhất (`highScore`) |
| 4 | **Azure Key Vault** | `kv-diepcustom` | Quản lý tập trung 6 secret bảo mật (`cosmos-connection-string`, `redis-connection-string`...) |
| 5 | **Azure Blob Storage** | `stdiepcustomavt` | Lưu trữ tệp tĩnh Avatar (.svg) với quyền truy cập đọc công khai (Anonymous Access) |
| 6 | **Azure Cache for Redis** | `redis-diepcustom` | Bộ nhớ đệm In-Memory (TLS 1.2 port 10000) lưu vết thời gian phiên ngắt kết nối `session:${sessionId}` |
| 7 | **Azure App Configuration** | `appconfig-diepcustom` | Lưu trữ tập trung thông số cấu hình runtime (`max-players-per-room`, `arena-type`) khi server khởi động |
| 8 | **Azure Service Bus** | `sb-diepcustom` | Enterprise Message Broker (Topic `global-announcements` với 2 Subscriptions `logicapp-sub` và `sub-global-broadcast`) |
| 9 | **Azure Logic Apps** | `logic-diepcustom-announce` | Tự động hóa quy trình nghiệp vụ: Lắng nghe Service Bus và đẩy thông báo tự động ra Discord Webhook |
| 10 | **Azure Functions** | `func-diepcustom` | Serverless HTTP Trigger (`/api/leaderboard`) xuất JSON Top 10 người chơi cao điểm nhất từ Cosmos DB |
| 11 | **Azure Application Insights** | `appi-diepcustom` | Giám sát APM thời gian thực, vẽ sơ đồ Application Map và theo dõi độ trễ hệ thống |
| 12 | **Azure Entra ID (Easy Auth)** | `ca-diepcustom-server` | Xác thực danh tính người dùng cấp hạ tầng qua Google OAuth2 Provider (`/.auth/login/google`) |
| 13 | **Functions Storage Account** | `stdiepcustomfunc` | Storage Account riêng biệt quản lý state, trigger timer và log cho Azure Functions |

---

## ⚙️ HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH LOCAL

### 1. Yêu Cầu Môi Trường
- Node.js v20+
- npm v10+
- Docker Desktop (nếu build container)
- Azure CLI (`az`)

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Biên Dịch TypeScript & Khởi Chạy
```bash

# Check syntax & build bundle
npm run build

# Start local server
npm start
```

### 4. Build & Push Docker Image Lên Azure Registry
```bash
az acr login --name acrdiepcustom
docker buildx build --platform linux/amd64 -t acrdiepcustom.azurecr.io/diepcustom-server:latest --push .
```

---

## 👥 THÀNH VIÊN NHÓM THỰC HIỆN

1. **Lê Hữu Huy** — MSSV: `0023411183` (Trưởng nhóm / Leader)
2. **Phạm Trung Kiên** — MSSV: `0023410666`
3. **Nguyễn Xuân Phát** — MSSV: `0023411063`
4. **Trương Thanh Hoài** — MSSV: `0023410883`
5. **Trần Trung Hậu** — MSSV: `0023411203`

---

