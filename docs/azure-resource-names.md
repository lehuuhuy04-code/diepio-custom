# Azure Resource Names — DiepCustom Deployment (Bản Chốt Cuối Đồ Án)

> **Source of Truth chính thức cho Đồ án Cloud DiepCustom.** Danh sách 13 dịch vụ Azure độc lập đã triển khai thành công trên môi trường Microsoft Azure Cloud (`southeastasia`).

---

## Thông tin Subscription & Môi trường

| Mục | Giá trị |
|---|---|
| Subscription Name | Azure for Students |
| Subscription ID | `b4763959-4981-459f-8832-b5cd716cecc3` |
| Tenant ID | `a08a4354-67f8-4fc4-b9c7-886a4aeefa89` |
| Email tài khoản | `0023411183@student.dthu.edu.vn` |
| Resource Group | `rg-diepcustom` |
| Region mặc định | `southeastasia` |
| Tổng số dịch vụ Azure độc lập | **13 Dịch vụ** (Vượt yêu cầu tối thiểu 10/10) |
| Ngân sách thực tế đã dùng | **$4.90 USD** (Số dư còn lại **$51.22 USD**) |

---

## Danh sách 13 Dịch vụ Azure Độc lập Đã Triển khai (Demo Day Ready)

| STT | Dịch vụ Azure | Tên Resource Thực tế | Loại Resource / Tier | Trạng Thái |
|---|---|---|---|---|
| 1 | Azure Container Apps | `ca-diepcustom-server` | Container App (`cae-diepcustom`, Revision `--0000005`) | ✅ Operational |
| 2 | Azure Container Registry | `acrdiepcustom.azurecr.io` | Basic Registry (Images: `diepcustom-server:task26-27-reverify`) | ✅ Operational |
| 3 | Azure Cosmos DB | `cosmos-diepcustom` | NoSQL Cosmos DB (`diepcustom-db` / `players`) | ✅ Operational |
| 4 | Azure Key Vault | `kv-diepcustom` | Key Vault (Standard, System-Assigned Managed Identity) | ✅ Operational |
| 5 | Azure Blob Storage | `stdiepcustomavt` | Storage Account (`avatars` container, Anonymous Access) | ✅ Operational |
| 6 | Azure Cache for Redis | `redis-diepcustom` | Enterprise Basic C1 (TLS 1.2 Port 10000) | ✅ Operational |
| 7 | Azure App Configuration | `appconfig-diepcustom` | App Configuration Store (`max-players-per-room`, `arena-type`) | ✅ Operational |
| 8 | Azure Service Bus | `sb-diepcustom` | Service Bus Standard (Topic `global-announcements`) | ✅ Operational |
| 9 | Azure Logic Apps | `logic-diepcustom-announce` | Logic App Consumption (Service Bus Trigger $\rightarrow$ Discord Webhook) | ✅ Operational |
| 10 | Azure Functions | `func-diepcustom` | Function App (Node.js v20 Serverless HTTP Leaderboard) | ✅ Operational |
| 11 | Azure Application Insights | `appi-diepcustom` | Application Insights APM (Log Analytics Workspace `law-diepcustom`) | ✅ Operational |
| 12 | Azure Entra ID (Easy Auth) | `ca-diepcustom-server` | Built-in Infrastructure Authentication (Google Provider OAuth2) | ✅ Operational |
| 13 | Functions Storage Account | `stdiepcustomfunc` | Storage Account (Dedicated State Storage for Azure Functions) | ✅ Operational |

---

## Mổ Xẻ Kỹ Thuật Cơ Chế Azure App Configuration

* **Cơ chế đọc trong mã nguồn (`src/index.ts` & `src/Cloud/AppConfigStore.ts`):**  
  `appConfigStore` sử dụng SDK `@azure/app-configuration` để nạp các thông số cấu hình tập trung (`max-players-per-room`, `arena-type`) **ONCE KHI GAME SERVER KHỞI ĐỘNG (BOOT UP)**.
* **Quy trình cập nhật cấu hình thực tế:**  
  Khi thay đổi giá trị cấu hình trên Azure Portal (vd: thay đổi `max-players-per-room` từ `30` thành `40`), quản trị viên thực hiện khởi động lại Revision Container App (`az containerapp revision restart` hoặc nút `Restart` trên Azure Portal). Khi Revision khởi động lại, log boot ghi nhận đọc giá trị mới từ App Configuration mà không cần rebuild Docker Image.

---

## URLs & Endpoints Xác minh cho Demo Day

| Resource | URL / Endpoint Xác minh | Chức năng Demo |
|---|---|---|
| Game Server (Backend) | `https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io` | WebSocket Game Server, REST API |
| Avatar Storage (Blob) | `https://stdiepcustomavt.blob.core.windows.net/avatars/avatar1.svg` | Blob Storage chứa SVG Avatars |
| Azure Managed Redis | `redis-diepcustom.southeastasia.redis.azure.net:10000` | Reconnect Session Store (60s window) |
| Key Vault Secret Vault | `https://kv-diepcustom.vault.azure.net/` | Quản lý Secrets tập trung |
| App Configuration Store | `https://appconfig-diepcustom.azconfig.io` | Quản lý Cấu hình Non-secret Runtime |
| Service Bus Endpoint | `https://sb-diepcustom.servicebus.windows.net:443/` | Topic `global-announcements` Pub/Sub |
| Azure Functions Leaderboard | `https://func-diepcustom.azurewebsites.net/api/leaderboard` | Serverless HTTP Export Top Players Leaderboard |
| Easy Auth Redirect | `https://ca-diepcustom-server.../.auth/login/google` | HTTP 302 Redirect to Google OAuth2 |
| Logic App Announcement | `logic-diepcustom-announce` (`logicapp-sub` on `global-announcements`) | Auto-forward admin announcements to Discord |

---

*Cập nhật lần cuối: 05/08/2026 (Chốt chuẩn theo kiểm thử thực tế và mã nguồn).*
