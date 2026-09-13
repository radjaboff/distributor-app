# Bozor Distributor Boshqaruv Tizimi

Bozorlarga yog', shakar va shunga o'xshash mahsulotlarni tarqatuvchi distributor biznes uchun
mahsulot, mijoz (do'kon) va qarz-nasiya hisobini yurituvchi backend REST API.

## 📌 Muammo va yechim

Distributor biznesda hisob-kitob odatda qo'lda yoki daftarda yuritiladi — qaysi do'kon qancha
qarzdor, qachon qancha to'lagani, ombordagi mahsulot qoldig'ini kuzatish qiyin va xatoga moyil.

Bu loyiha shu jarayonni raqamlashtiradi:
- Bazadan mahsulot kirimi va ombor qoldig'ini avtomatik hisoblash
- Do'konlarga sotuv (naqd / karta / nasiya) va qarzni avtomatik hisoblash
- To'lovlarni qayd qilish va qarzni avtomatik kamaytirish
- Kunlik va oylik moliyaviy hisobotlar (foyda, tushum, TOP qarzdorlar)

## 🛠 Texnologiyalar

| Texnologiya | Vazifasi |
|---|---|
| **Java 17** | Asosiy dasturlash tili |
| **Spring Boot** | Backend freymvork |
| **Spring Data JPA** | Ma'lumotlar bazasi bilan ishlash (ORM) |
| **PostgreSQL** | Ma'lumotlar bazasi |
| **Maven** | Build tool va bog'liqliklarni boshqarish |
| **Lombok** | Boilerplate kodni kamaytirish (getter/setter) |
| **Jakarta Validation** | Kiruvchi ma'lumotlarni tekshirish |

## 🏗 Arxitektura

Loyiha **SOLID** tamoyillariga asoslangan, qatlamli (layered) arxitekturada qurilgan:

```
Controller → Service (interfeys + impl) → Repository → Database
                ↕
              DTO + Mapper
```

| Paket | Vazifasi |
|---|---|
| `entity/` | Database jadvallariga mos classlar |
| `repository/` | Spring Data JPA repositorylari |
| `service/`, `service/impl/` | Biznes-mantiq — interfeys + implementatsiya (Dependency Inversion) |
| `controller/` | REST API endpoint'lar |
| `dto/` | Request/Response classlari va Entity ↔ DTO Mapper'lar |
| `exception/` | Maxsus xato classlari va markazlashgan xato boshqaruvi (`@ControllerAdvice`) |
| `enums/` | `PaymentType` (NAQD/KARTA/NASIYA), `PaymentMethod` (NAQD/KARTA) |

**Nega DTO?** Entity'lar to'g'ridan-to'g'ri API orqali qaytarilmaydi — bu ichki ma'lumotlar
tuzilmasini tashqi dunyodan ajratadi va foydalanuvchi tizim boshqaradigan maydonlarga
(masalan sotuv narxi) tashqaridan aralashib qo'ya olmasligini ta'minlaydi.

## ⚙️ Asosiy funksionallik

- **Paket-asosli hisob** — mahsulotlar butun paket (xalta/karopka) bilan hisoblanadi, kg/litr emas
- **Ombor boshqaruvi** — bazadan kirim qilinganda qoldiq avtomatik oshadi, sotuvda avtomatik kamayadi
- **Toifalar** — do'konlar bozorlarga/toifalarga guruhlanadi
- **Ko'p turdagi sotuv** — bitta sotuvda bir nechta mahsulot turi, 3 xil to'lov (naqd/karta/nasiya)
- **Qisman to'lov** — mijoz sotuv summasining bir qismini darhol, qolganini keyin to'lashi qo'llab-quvvatlanadi
- **Narx muzlatish** — sotuv vaqtidagi narx va tannarx saqlanadi, keyingi narx o'zgarishi eski sotuvlarga ta'sir qilmaydi
- **Avtomatik qarz hisobi** — sotuv qarzni oshiradi, to'lov kamaytiradi
- **Hisobotlar** — kunlik/oylik foyda, tushum (to'lov turi bo'yicha), TOP qarzdor do'konlar, mahsulot bo'yicha sotuv hajmi

## 🚀 Ishga tushirish

1. PostgreSQL'da baza yarating:
   ```sql
   CREATE DATABASE distributor_db;
   ```
2. `DB_PASSWORD` environment variable'ni bazangiz parolига mos o'rnating
3. Loyihani ishga tushiring:
   ```bash
   ./mvnw spring-boot:run
   ```
4. API `http://localhost:8080` manzilida ishga tushadi

## 📡 API endpoint'lar

```
# Mahsulotlar
GET    /api/products
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}

# Bazadan kirim
POST   /api/stock-in
GET    /api/stock-in?productId=

# Toifalar
GET    /api/market-groups
POST   /api/market-groups

# Do'konlar
GET    /api/shops
GET    /api/shops?groupId=
POST   /api/shops
PUT    /api/shops/{id}

# Sotuv
POST   /api/sales
GET    /api/sales?shopId=

# To'lovlar
POST   /api/payments
GET    /api/payments?shopId=

# Hisobotlar
GET    /api/reports/daily?date=2026-09-13
GET    /api/reports/monthly?month=2026-09
```

## 🗺 Kelajakdagi rejalar

- Frontend (PWA — mobil qurilmada ilova sifatida o'rnatiladigan veb-ilova)
- Login (Spring Security)
- PDF/Excel hisobot eksporti
- Qidiruv, filtrlash va pagination

## 👤 Muallif

**Akmal Rajabov** — [GitHub](https://github.com/radjaboff) | [LinkedIn](https://www.linkedin.com/in/akmal-rajabov)
