# ROADMAP TRIỂN KHAI AZURE — DiepCustom (Đồ án Điện toán Đám mây)

**Vai trò:** Technical Project Manager
**Ràng buộc đã xác nhận:**
- Ngân sách còn lại: **$56.12** (Azure for Students)
- Deadline: **08/08** (~13 ngày kể từ hôm nay 26/07)
- Tiêu chí chấm điểm: **số lượng Azure Services + cách tích hợp + khả năng trình bày**
- Không cần tối ưu, không cần chịu tải lớn — chỉ cần **đủ minh họa dịch vụ** và deploy được cho nhiều sinh viên vào thử
- Tối thiểu **10 dịch vụ**, càng nhiều càng tốt

---

## ⚠️ CẢNH BÁO NGÂN SÁCH (đọc trước khi làm)

$56.12 cho 13 ngày là **rất eo hẹp** nếu chọn sai dịch vụ. Một vài dịch vụ Azure có phí cố định theo giờ dù không ai chơi (VD: Azure Application Gateway ~$125+/tháng, AKS node pool, Azure Front Door Standard ~$35+/tháng cố định). Nếu bật những thứ này và quên tắt, ngân sách bay trong 2-3 ngày.

**Nguyên tắc PM đặt ra cho roadmap này:**
1. **Ưu tiên tuyệt đối các dịch vụ có Free Tier hoặc Consumption/pay-per-use** (trả theo request/GB thực tế, scale-to-zero khi không ai dùng).
2. **Tránh** Azure Application Gateway, Azure Front Door, AKS (managed node) — quá đắt so với ngân sách, không cần thiết để minh họa.
3. **Thiết lập Budget Alert ngay từ Phase 0** — đây cũng là một dịch vụ Azure hợp lệ để trình bày ("chúng tôi có giám sát chi phí bằng Azure Cost Management").
4. **Bật tài nguyên gần ngày demo, tắt/xoá sau khi dùng xong** — đặc biệt với Redis, Service Bus.

**Ước tính chi phí nếu làm đúng roadmap này (13 ngày, dùng tiết kiệm):** khoảng **$10–20** trong tổng $56.12 → còn dư buffer an toàn. Chi tiết cost ở bảng cuối bài.

---

## TRẢ LỜI 3 CÂU HỎI MỞ CỦA BẠN

### 7.1 — Đăng nhập & lưu avatar: nên làm sao?
**Khuyến nghị: KHÔNG bắt buộc đăng nhập, nhưng thêm đăng nhập Google là OPTIONAL** để có thêm 1 dịch vụ Azure (Entra ID / Easy Auth) mà gần như không tốn công code:
- Giữ nguyên cơ chế **session/party code** sẵn có của DiepCustom (đã có trong `index.html` qua `window.location.hash`) làm luồng mặc định — sinh viên vào không cần đăng nhập gì cả, vẫn chơi được ngay.
- Thêm nút **"Đăng nhập bằng Google" (tuỳ chọn)** dùng tính năng **Easy Auth built-in** của Azure Container Apps/App Service — đây là cấu hình có sẵn trên Azure, **không cần tự viết code OAuth**, chỉ cần khai báo Google Client ID/Secret. Nếu người chơi đăng nhập, hệ thống lưu avatar/tên gắn với Google ID; nếu không, avatar gắn với session ID ngẫu nhiên (không lưu bền, mất khi đóng tab — chấp nhận được vì không cần thương mại).
- Avatar: dùng bộ **avatar dựng sẵn (preset)** thay vì cho upload ảnh tự do (đỡ phải xử lý content moderation) — ảnh preset lưu trên **Blob Storage**, lựa chọn của người chơi lưu trong **Cosmos DB** (khoá bằng Google ID hoặc session ID).

→ Cách này cho phép bạn trình bày được **cả Entra ID (auth) lẫn Blob Storage + Cosmos DB (lưu trữ)** mà không phải viết nhiều code.

### 7.2 — Lo lắng về `uWebSockets.js` (native addon) trên Azure
Đây không phải vấn đề lớn nếu build đúng cách. Hướng dẫn cụ thể:
- `uWebSockets.js` là C++ addon, cần đúng **kiến trúc CPU + OS** lúc build khớp với lúc chạy. Azure Container Apps / App Service Linux / AKS đều chạy container **Linux/amd64**.
- **Cách an toàn nhất:** build image **trực tiếp trên Azure** bằng `az acr build` (ACR Tasks) thay vì build trên máy cá nhân rồi push lên. Lệnh này build ngay trong Azure (server Linux/amd64), nên tự động đúng kiến trúc, không lo lệch platform (đặc biệt quan trọng nếu máy bạn là Mac M1/M2 — ARM khác hẳn Azure).
- Nếu vẫn muốn build ở máy cá nhân trước rồi push: dùng `docker buildx build --platform linux/amd64 -t <image> .` để ép build đúng kiến trúc, rồi `docker push` lên ACR.
- Dockerfile hiện tại đã multi-stage (`npm ci` trong builder stage) → về logic đã đúng, chỉ cần đảm bảo **base image + build platform = linux/amd64** là xong. Không cần sửa gì thêm trong code.

→ Kết luận: dùng `az acr build` ở Phase 1 là cách né vấn đề này hoàn toàn, không cần bạn tự debug platform.

### 7.3 — Số lượng dịch vụ & tiêu chí chấm điểm
Đã thiết kế roadmap dưới đây với **11 dịch vụ Azure chính + 1 dịch vụ bổ trợ (Cost Management)** = 12, vượt mức tối thiểu 10. Mỗi phase đều ghi rõ **vai trò/tác dụng cụ thể trong project** — đây chính là phần "cách tích hợp" mà giảng viên chấm, nên khi trình bày, hãy nói theo đúng câu trong cột "Tác dụng" của từng dịch vụ.

---

## ROADMAP TRIỂN KHAI

```
Phase 0
Thiết lập Guardrail Ngân Sách
Azure Cost Management + Budget Alerts
(đặt ngưỡng cảnh báo 50% / 80% / 95% của $56.12)
↓
Phase 1
Đóng gói & Build Image đúng nền tảng
Azure Container Registry (ACR - Basic)
+ build bằng "az acr build" để né lỗi platform uWebSockets.js
↓
Phase 2
Deploy Game Server (WebSocket)
Azure Container Apps (Consumption plan)
→ HTTPS ingress miễn phí built-in, scale-to-zero khi không ai chơi
↓
Phase 3
Lưu trữ Avatar & Asset tĩnh
Azure Blob Storage (Hot tier)
→ chứa ảnh avatar preset, asset phụ trợ
↓
Phase 4
Lưu dữ liệu người chơi (tên, avatar đã chọn, điểm)
Azure Cosmos DB (Free Tier - API NoSQL)
→ thay thế phần "không có DB" ban đầu của DiepCustom
↓
Phase 5
Đăng nhập tuỳ chọn bằng Google
Microsoft Entra ID + Easy Auth (built-in Container Apps)
→ minh hoạ Identity & Access Management, không cần code OAuth thủ công
↓
Phase 6
Session / Party state ngoài in-memory
Azure Cache for Redis (Basic C0)
→ externalize "disconnectedSessions", "bannedClients"; CHỈ bật khi test/demo để tiết kiệm chi phí
↓
Phase 7
Quản lý Secrets tập trung
Azure Key Vault
→ lưu Google Client Secret, DEV_PASSWORD_HASH, connection string Cosmos/Redis
↓
Phase 8
Giám sát & Logging
Azure Monitor + Application Insights
→ thay console.log; theo dõi số người chơi, lỗi, hiệu năng tick loop
↓
Phase 9
Tách phần Client tĩnh
Azure Static Web Apps (Free tier)
→ serve index.html/config.js/loader.js riêng, giảm tải game server
↓
Phase 10
Tăng tốc phân phối static/asset
Azure CDN (Standard Microsoft, pay-as-you-go)
→ đặt trước Static Web Apps/Blob Storage cho load nhanh hơn
↓
Phase 11
Minh hoạ Messaging liên phòng
Azure Service Bus (Basic tier)
→ ví dụ: gửi thông báo toàn server / global chat giữa các GameServer instance
↓
Phase 12
Demo Day — Bật toàn bộ, trình bày, rồi dọn dẹp
Bật full stack cho lớp vào chơi thử → Chấm điểm → Xoá/pause tài nguyên tốn phí (Redis, Container Apps) ngay sau demo
```

---

## BẢNG TỔNG HỢP DỊCH VỤ & TÁC DỤNG (dùng để trình bày)

| # | Azure Service | Vai trò trong dự án | Tier khuyến nghị | Ghi chú chi phí |
|---|---|---|---|---|
| 1 | Cost Management + Budgets | Giám sát & cảnh báo chi tiêu | Free | $0 |
| 2 | Container Registry (ACR) | Lưu Docker image, build đúng platform | Basic | ~$0.17/ngày |
| 3 | Container Apps | Host game server (WebSocket), auto TLS | Consumption | ~$0–2 (free grant) |
| 4 | Blob Storage | Lưu avatar preset, asset tĩnh | Hot, LRS | <$1 |
| 5 | Cosmos DB | Lưu profile người chơi, điểm | Free Tier | $0 (trong hạn mức free) |
| 6 | Entra ID (Easy Auth) | Đăng nhập Google tuỳ chọn | Free | $0 |
| 7 | Cache for Redis | Externalize session/party state | Basic C0 | ~$0.53/ngày — chỉ bật khi cần |
| 8 | Key Vault | Quản lý secrets tập trung | Standard | <$1 |
| 9 | Monitor + App Insights | Logging, theo dõi hệ thống | Free tier (5GB/tháng) | $0 |
| 10 | Static Web Apps | Serve client tĩnh riêng | Free | $0 |
| 11 | CDN | Tăng tốc phân phối asset | Standard Microsoft | <$1 |
| 12 | Service Bus | Messaging liên phòng (global chat/thông báo) | Basic | <$1 |

**Tổng ước tính nếu vận hành tiết kiệm (bật gần demo, tắt sau):** ~$10–20 / $56.12 → an toàn.

**Dịch vụ CHỦ ĐỘNG TRÁNH** (vì lý do ngân sách, không cần thiết để minh hoạ): Azure Application Gateway, Azure Front Door, AKS (managed node pool có phí giờ).

---

## GHI CHÚ CHO PKB
Sau khi nhóm xác nhận roadmap này, cần cập nhật lại **PKB.md mục 6** (đổi tất cả trạng thái "chưa chốt" → "đã chốt" cho 11–12 dịch vụ trên) và **mục 7** (điền giả định/giới hạn/yêu cầu giảng viên đã có ở đây) để các AI khác tuân theo khi bắt đầu triển khai thực tế (deploy, không code detail ở bước roadmap này).
