# مفاهیم شبکه برای فرانت‌اند دولوپر

---

## ۱. اینترنت چطور کار می‌کنه
- داده چیه و چطور جابجا می‌شه
- بسته‌بندی داده (Packet)
- مسیریابی داده بین مبدا و مقصد

---

## ۲. IP Address
- IP چیه و چرا لازمه
- IPv4
- IPv6
- Public IP vs Private IP
- localhost و 127.0.0.1
- 0.0.0.0 یعنی چی

---

## ۳. Port
- Port چیه
- پورت‌های استاندارد (80, 443, 22, ...)
- پورت‌های توسعه (3000, 5173, ...)
- رابطه IP و Port

---

## ۴. DNS
- DNS چیه و چرا وجود داره
- DNS Resolution Flow گام به گام
- انواع DNS Record (A, AAAA, CNAME, MX, TXT, NS)
- TTL چیه
- DNS Caching (browser, OS, resolver)
- DNS Propagation
- DNS Lookup Latency
- DNS over HTTPS (DoH)
- DNS over TLS (DoT)
- DNSSEC
- Split-Horizon DNS

---

## ۵. TCP
- TCP چیه
- 3-Way Handshake (SYN, SYN-ACK, ACK)
- 4-Way Termination
- Reliability و تضمین ترتیب بسته‌ها
- Retransmission
- Flow Control
- Congestion Control و Slow Start
- Congestion Window (CWND)
- TCP Fast Open
- TCP idle timeout

---

## ۶. UDP
- UDP چیه
- فرق با TCP
- کجا استفاده می‌شه

---

## ۷. HTTP/1.1
- ساختار Request
- ساختار Response
- HTTP Methods (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD)
- Idempotency
- Status Codes و معنای هر رنج
- مهم‌ترین Status Codeها
- Headers (Request & Response)
- مهم‌ترین Headerها
- Keep-Alive و Connection Reuse
- Head-of-Line Blocking

---

## ۸. HTTP/2
- Multiplexing
- Binary Framing Layer
- Header Compression (HPACK)
- Stream Prioritization
- Server Push
- چرا HOL blocking هنوز روی TCP وجود داره

---

## ۹. HTTP/3 & QUIC
- QUIC چیه
- چرا روی UDP اجرا می‌شه
- حل Head-of-Line Blocking در transport layer
- 0-RTT و 1-RTT Connection
- مزیت روی شبکه‌های بی‌ثبات

---

## ۱۰. TLS & HTTPS
- TLS چیه، فرق با SSL
- TLS Handshake گام به گام
- TLS 1.2 vs TLS 1.3
- Symmetric vs Asymmetric Encryption
- Certificate چیه
- Certificate Authority (CA)
- Chain of Trust
- SNI (Server Name Indication)
- Certificate Pinning
- HSTS
- OCSP Stapling
- Mixed Content
- تأثیر TLS روی latency

---

## ۱۱. Caching در HTTP
- Cache چطور در پروتکل HTTP کار می‌کنه
- Cache-Control و همه directive‌ها
  - max-age
  - s-maxage
  - no-cache
  - no-store
  - must-revalidate
  - proxy-revalidate
  - immutable
  - stale-while-revalidate
  - stale-if-error
- ETag
- Last-Modified
- Conditional Requests (If-None-Match, If-Modified-Since)
- فرق 200 با 304
- Vary Header
- Age Header
- Cache-Control: no-cache vs no-store فرق دقیق

---

## ۱۲. CORS
- Same-Origin Policy چیه و چرا وجود داره
- Origin = Protocol + Domain + Port
- Simple Request
- Preflight Request (OPTIONS)
- شرایطی که Preflight trigger می‌شه
- Access-Control-Allow-Origin
- Access-Control-Allow-Methods
- Access-Control-Allow-Headers
- Access-Control-Allow-Credentials
- Access-Control-Max-Age
- چرا wildcard با credentials کار نمی‌کنه

---

## ۱۳. WebSocket
- WebSocket چیه
- HTTP Upgrade Handshake
- Full-Duplex Communication
- Frame Structure
- Ping/Pong frames
- فرق با HTTP
- چرا NAT و Proxy ممکنه WebSocket رو قطع کنن
- Reconnection و timeout‌ها

---

## ۱۴. Proxy & Reverse Proxy
- Forward Proxy چیه
- Reverse Proxy چیه
- فرق Forward و Reverse
- Load Balancer
- L4 (TCP) vs L7 (HTTP) Load Balancing
- X-Forwarded-For Header
- Transparent vs Non-transparent Proxy

---

## ۱۵. CDN
- CDN چطور کار می‌کنه
- Anycast Routing
- Point of Presence (PoP)
- Edge Node vs Origin
- Cache Hit vs Cache Miss
- Cache Invalidation روی CDN
- TLS Termination در CDN

---

## ۱۶. Latency & Performance
- Latency چیه
- Bandwidth چیه
- Throughput چیه
- فرق Latency، Bandwidth، Throughput
- RTT (Round-Trip Time)
- تأثیر فاصله جغرافیایی (سرعت نور)
- هزینه شبکه‌ای یه request کامل (DNS + TCP + TLS + Request)
- Connection Reuse چقدر کمک می‌کنه
- تعداد Request و تأثیرش روی performance

---

## ۱۷. Security در لایه شبکه
- Man-in-the-Middle Attack
- SSL Stripping
- Downgrade Attack
- Packet Sniffing
- DDoS (volumetric, protocol, application layer)
- Port Scanning
- Firewall (stateful vs stateless)
