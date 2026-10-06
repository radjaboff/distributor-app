package uz.akmal.distributor_app.service.impl;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.distributor_app.dto.backup.BackupData;
import uz.akmal.distributor_app.entity.*;
import uz.akmal.distributor_app.repository.*;
import uz.akmal.distributor_app.service.BackupService;
import uz.akmal.distributor_app.util.SecurityUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupServiceImpl implements BackupService {

    private final MarketGroupRepository marketGroupRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final StockInRepository stockInRepository;
    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;
    private final SupplierRepository supplierRepository;
    private final SupplyPurchaseRepository supplyPurchaseRepository;
    private final SupplyPaymentRepository supplyPaymentRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public BackupData exportBackup() {
        log.info("Baza zaxira nusxasi (Backup) eksport qilinmoqda...");

        List<MarketGroup> marketGroups = marketGroupRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Shop> shops = shopRepository.findAll();
        List<StockIn> stockIns = stockInRepository.findAll();
        List<Sale> sales = saleRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();

        List<BackupData.MarketGroupDto> mgDtos = marketGroups.stream().map(mg ->
                BackupData.MarketGroupDto.builder()
                        .id(mg.getId())
                        .name(mg.getName())
                        .isDeleted(mg.getIsDeleted())
                        .createdAt(mg.getCreatedAt())
                        .createdBy(mg.getCreatedBy())
                        .build()
        ).toList();

        List<BackupData.ProductDto> productDtos = products.stream().map(p ->
                BackupData.ProductDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .unit(p.getUnit())
                        .packageName(p.getPackageName())
                        .unitsPerPackage(p.getUnitsPerPackage())
                        .purchasePrice(p.getPurchasePrice())
                        .sellPrice(p.getSellPrice())
                        .stockQuantity(p.getStockQuantity())
                        .isDeleted(p.getIsDeleted())
                        .createdAt(p.getCreatedAt())
                        .createdBy(p.getCreatedBy())
                        .build()
        ).toList();

        List<BackupData.ShopDto> shopDtos = shops.stream().map(s ->
                BackupData.ShopDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .ownerName(s.getOwnerName())
                        .phone(s.getPhone())
                        .currentDebt(s.getCurrentDebt())
                        .marketGroupId(s.getMarketGroup() != null ? s.getMarketGroup().getId() : null)
                        .isDeleted(s.getIsDeleted())
                        .createdAt(s.getCreatedAt())
                        .createdBy(s.getCreatedBy())
                        .build()
        ).toList();

        List<BackupData.StockInDto> stockInDtos = stockIns.stream().map(si ->
                BackupData.StockInDto.builder()
                        .id(si.getId())
                        .productId(si.getProduct() != null ? si.getProduct().getId() : null)
                        .productName(si.getEffectiveProductName())
                        .packageCount(si.getPackageCount())
                        .totalCost(si.getTotalCost())
                        .date(si.getDate())
                        .createdAt(si.getCreatedAt())
                        .createdBy(si.getCreatedBy())
                        .build()
        ).toList();

        List<BackupData.SaleDto> saleDtos = sales.stream().map(sale -> {
            List<BackupData.SaleItemDto> itemDtos = sale.getItems().stream().map(item ->
                    BackupData.SaleItemDto.builder()
                            .id(item.getId())
                            .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                            .productName(item.getEffectiveProductName())
                            .packageCount(item.getPackageCount())
                            .priceAtSale(item.getPriceAtSale())
                            .costAtSale(item.getCostAtSale())
                            .build()
            ).toList();

            return BackupData.SaleDto.builder()
                    .id(sale.getId())
                    .shopId(sale.getShop() != null ? sale.getShop().getId() : null)
                    .date(sale.getDate())
                    .initialPaidAmount(sale.getInitialPaidAmount())
                    .paymentType(sale.getPaymentType())
                    .totalAmount(sale.getTotalAmount())
                    .createdAt(sale.getCreatedAt())
                    .createdBy(sale.getCreatedBy())
                    .isCancelled(sale.getIsCancelled())
                    .cancelReason(sale.getCancelReason())
                    .cancelledAt(sale.getCancelledAt())
                    .cancelledBy(sale.getCancelledBy())
                    .items(itemDtos)
                    .build();
        }).toList();

        List<BackupData.PaymentDto> paymentDtos = payments.stream().map(p ->
                BackupData.PaymentDto.builder()
                        .id(p.getId())
                        .shopId(p.getShop() != null ? p.getShop().getId() : null)
                        .saleId(p.getSale() != null ? p.getSale().getId() : null)
                        .amount(p.getAmount())
                        .method(p.getMethod())
                        .date(p.getDate())
                        .createdAt(p.getCreatedAt())
                        .createdBy(p.getCreatedBy())
                        .isCancelled(p.getIsCancelled())
                        .cancelReason(p.getCancelReason())
                        .cancelledAt(p.getCancelledAt())
                        .cancelledBy(p.getCancelledBy())
                        .build()
        ).toList();

        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplyPurchase> supplyPurchases = supplyPurchaseRepository.findAll();
        List<SupplyPayment> supplyPayments = supplyPaymentRepository.findAll();

        List<BackupData.SupplierDto> supplierDtos = suppliers.stream().map(s ->
                BackupData.SupplierDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .phone(s.getPhone())
                        .category(s.getCategory())
                        .currentDebt(s.getCurrentDebt())
                        .active(s.getActive())
                        .createdAt(s.getCreatedAt())
                        .createdBy(s.getCreatedBy())
                        .build()
        ).toList();

        List<BackupData.SupplyPurchaseDto> supplyPurchaseDtos = supplyPurchases.stream().map(p ->
                BackupData.SupplyPurchaseDto.builder()
                        .id(p.getId())
                        .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
                        .category(p.getCategory())
                        .productName(p.getProductName())
                        .unit(p.getUnit())
                        .quantity(p.getQuantity())
                        .unitPrice(p.getUnitPrice())
                        .totalAmount(p.getTotalAmount())
                        .purchaseDate(p.getPurchaseDate())
                        .note(p.getNote())
                        .litersPerItem(p.getLitersPerItem())
                        .itemsPerBox(p.getItemsPerBox())
                        .boxesCount(p.getBoxesCount())
                        .pricePerLiter(p.getPricePerLiter())
                        .totalLiters(p.getTotalLiters())
                        .isCancelled(p.getIsCancelled())
                        .cancelReason(p.getCancelReason())
                        .cancelledBy(p.getCancelledBy())
                        .cancelledAt(p.getCancelledAt())
                        .createdAt(p.getCreatedAt())
                        .createdBy(p.getCreatedBy())
                        .build()
        ).toList();

        List<BackupData.SupplyPaymentDto> supplyPaymentDtos = supplyPayments.stream().map(p ->
                BackupData.SupplyPaymentDto.builder()
                        .id(p.getId())
                        .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
                        .amount(p.getAmount())
                        .paymentMethod(p.getPaymentMethod())
                        .paymentDate(p.getPaymentDate())
                        .note(p.getNote())
                        .isCancelled(p.getIsCancelled())
                        .cancelReason(p.getCancelReason())
                        .cancelledBy(p.getCancelledBy())
                        .cancelledAt(p.getCancelledAt())
                        .createdAt(p.getCreatedAt())
                        .createdBy(p.getCreatedBy())
                        .build()
        ).toList();

        BackupData backupData = BackupData.builder()
                .appName("Bozor Distributor")
                .version("1.0")
                .backupDate(LocalDateTime.now())
                .createdBy(SecurityUtils.getCurrentUsername())
                .marketGroups(mgDtos)
                .products(productDtos)
                .shops(shopDtos)
                .stockIns(stockInDtos)
                .sales(saleDtos)
                .payments(paymentDtos)
                .suppliers(supplierDtos)
                .supplyPurchases(supplyPurchaseDtos)
                .supplyPayments(supplyPaymentDtos)
                .build();

        log.info("Baza zaxira nusxasi tayyorlandi: {} bozor, {} do'kon, {} mahsulot, {} sotuv, {} to'lov, {} ta'minotchi, {} kirim, {} ta'minot to'lovi",
                mgDtos.size(), shopDtos.size(), productDtos.size(), saleDtos.size(), paymentDtos.size(),
                supplierDtos.size(), supplyPurchaseDtos.size(), supplyPaymentDtos.size());

        return backupData;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restoreBackup(BackupData data) {
        log.warn("Baza zaxira nusxasidan qayta tiklanmoqda...");

        if (data == null) {
            throw new IllegalArgumentException("Zaxira fayli bo'sh yoki noto'g'ri");
        }

        // 1. Dastur identifikatori va formatini tekshirish
        if (data.getAppName() == null || !"Bozor Distributor".equalsIgnoreCase(data.getAppName().trim())) {
            throw new IllegalArgumentException("Yuklangan fayl 'Bozor Distributor' tizimiga tegishli emas yoki formati noto'g'ri!");
        }

        // 2. Fayl ichida ma'lumotlar mavjudligini tekshirish (bo'sh fayl bilan butun bazani tozalab qo'ymaslik uchun)
        boolean hasMarketGroups = data.getMarketGroups() != null && !data.getMarketGroups().isEmpty();
        boolean hasProducts = data.getProducts() != null && !data.getProducts().isEmpty();
        boolean hasShops = data.getShops() != null && !data.getShops().isEmpty();
        boolean hasSales = data.getSales() != null && !data.getSales().isEmpty();
        boolean hasPayments = data.getPayments() != null && !data.getPayments().isEmpty();
        boolean hasStockIns = data.getStockIns() != null && !data.getStockIns().isEmpty();
        boolean hasSuppliers = data.getSuppliers() != null && !data.getSuppliers().isEmpty();
        boolean hasSupplyPurchases = data.getSupplyPurchases() != null && !data.getSupplyPurchases().isEmpty();
        boolean hasSupplyPayments = data.getSupplyPayments() != null && !data.getSupplyPayments().isEmpty();

        if (!hasMarketGroups && !hasProducts && !hasShops && !hasSales && !hasPayments && !hasStockIns && !hasSuppliers && !hasSupplyPurchases && !hasSupplyPayments) {
            throw new IllegalArgumentException("Zaxira faylida hech qanday ma'lumot topilmadi! Bazani o'chirib yubormaslik uchun amal bekor qilindi.");
        }

        // 2.1 Qisman (chala) fayl tekshiruvi: Agar mavjud bazada do'kon, mahsulot, sotuv, to'lov yoki ta'minot bo'lsa,
        // ammo faylda ularning ro'yxati bo'lmasa, mavjud bazadagi ma'lumotlarni tasodifan tozalab yubormaslik
        long currentShopsCount = shopRepository.count();
        long currentProductsCount = productRepository.count();
        long currentSalesCount = saleRepository.count();
        long currentPaymentsCount = paymentRepository.count();
        long currentStockInsCount = stockInRepository.count();
        long currentSuppliersCount = supplierRepository.count();

        if (currentShopsCount > 0 && !hasShops) {
            throw new IllegalArgumentException("Zaxira faylida do'konlar ro'yxati topilmadi! Mavjud bazadagi do'konlar va ularning hisob-kitoblarini o'chirib yubormaslik uchun amal to'xtatildi.");
        }
        if (currentProductsCount > 0 && !hasProducts) {
            throw new IllegalArgumentException("Zaxira faylida mahsulotlar ro'yxati topilmadi! Mavjud bazadagi tovarlar va ombor qoldiqlarini o'chirib yubormaslik uchun amal to'xtatildi.");
        }
        if (currentSalesCount > 0 && !hasSales) {
            throw new IllegalArgumentException("Zaxira faylida sotuvlar tarixi topilmadi! Mavjud bazadagi savdolar tarixini o'chirib yubormaslik uchun tiklash to'xtatildi.");
        }
        if (currentPaymentsCount > 0 && !hasPayments) {
            throw new IllegalArgumentException("Zaxira faylida to'lovlar tarixi topilmadi! Mavjud bazadagi to'lovlar tarixini o'chirib yubormaslik uchun tiklash to'xtatildi.");
        }
        if (currentStockInsCount > 0 && !hasStockIns) {
            throw new IllegalArgumentException("Zaxira faylida ombor kirimlari tarixi topilmadi! Mavjud ombor kirimlari tarixini o'chirib yubormaslik uchun tiklash to'xtatildi.");
        }
        if (currentSuppliersCount > 0 && !hasSuppliers) {
            throw new IllegalArgumentException("Zaxira faylida ta'minotchilar ro'yxati topilmadi! Mavjud bazadagi ta'minotchilar va ularning qarzlarini o'chirib yubormaslik uchun tiklash to'xtatildi. (Eski formatdagi zaxira fayli bo'lishi mumkin)");
        }

        // 3. Muhim ma'lumotlar (bozor, mahsulot, do'kon) strukturasini va bog'liqliklarini tekshirish
        java.util.Set<Long> marketGroupIds = new java.util.HashSet<>();
        if (hasMarketGroups) {
            for (BackupData.MarketGroupDto mg : data.getMarketGroups()) {
                if (mg.getId() == null || mg.getName() == null || mg.getName().trim().isEmpty()) {
                    throw new IllegalArgumentException("Zaxira faylidagi bozor guruhi ma'lumoti buzilgan (ID yoki nom yo'q).");
                }
                marketGroupIds.add(mg.getId());
            }
        }

        java.util.Set<Long> productIds = new java.util.HashSet<>();
        if (hasProducts) {
            for (BackupData.ProductDto p : data.getProducts()) {
                if (p.getId() == null || p.getName() == null || p.getName().trim().isEmpty()) {
                    throw new IllegalArgumentException("Zaxira faylidagi mahsulot ma'lumoti buzilgan (ID yoki nom yo'q).");
                }
                productIds.add(p.getId());
            }
        }

        java.util.Set<Long> shopIds = new java.util.HashSet<>();
        if (hasShops) {
            for (BackupData.ShopDto s : data.getShops()) {
                if (s.getId() == null || s.getName() == null || s.getName().trim().isEmpty()) {
                    throw new IllegalArgumentException("Zaxira faylidagi do'kon ma'lumoti buzilgan (ID yoki nom yo'q).");
                }
                if (s.getMarketGroupId() != null && !marketGroupIds.contains(s.getMarketGroupId())) {
                    throw new IllegalArgumentException("Do'kon (" + s.getName() + ") faylda mavjud bo'lmagan bozor toifasiga (ID=" + s.getMarketGroupId() + ") bog'langan!");
                }
                shopIds.add(s.getId());
            }
        }

        // 4. Sotuvlar, to'lovlar va ombor kirimlari bog'liqliklarini tekshirish
        if (hasSales) {
            for (BackupData.SaleDto sale : data.getSales()) {
                if (sale.getShopId() != null && !shopIds.contains(sale.getShopId())) {
                    throw new IllegalArgumentException("Sotuv yozuvi faylda mavjud bo'lmagan do'konga (ID=" + sale.getShopId() + ") bog'langan!");
                }
                if (sale.getItems() != null) {
                    for (BackupData.SaleItemDto item : sale.getItems()) {
                        if (item.getProductId() != null && !productIds.contains(item.getProductId())) {
                            throw new IllegalArgumentException("Sotuv tarkibidagi tovar (ID=" + item.getProductId() + ") mahsulotlar ro'yxatida topilmadi!");
                        }
                    }
                }
            }
        }

        if (hasPayments) {
            for (BackupData.PaymentDto payment : data.getPayments()) {
                if (payment.getShopId() != null && !shopIds.contains(payment.getShopId())) {
                    throw new IllegalArgumentException("To'lov yozuvi faylda mavjud bo'lmagan do'konga (ID=" + payment.getShopId() + ") bog'langan!");
                }
            }
        }

        if (hasStockIns) {
            for (BackupData.StockInDto stockIn : data.getStockIns()) {
                if (stockIn.getProductId() != null && !productIds.contains(stockIn.getProductId())) {
                    throw new IllegalArgumentException("Ombor kirimi yozuvi (ID=" + stockIn.getId() + ") mahsulotlar ro'yxatida topilmadi!");
                }
            }
        }

        // Ta'minotchi bog'liqliklarini tekshirish
        java.util.Set<Long> supplierIds = new java.util.HashSet<>();
        if (data.getSuppliers() != null) {
            for (BackupData.SupplierDto s : data.getSuppliers()) {
                if (s.getId() == null || s.getName() == null || s.getName().trim().isEmpty()) {
                    throw new IllegalArgumentException("Zaxira faylidagi ta'minotchi ma'lumoti buzilgan (ID yoki nom yo'q).");
                }
                supplierIds.add(s.getId());
            }
        }

        if (data.getSupplyPurchases() != null) {
            for (BackupData.SupplyPurchaseDto p : data.getSupplyPurchases()) {
                if (p.getSupplierId() != null && !supplierIds.contains(p.getSupplierId())) {
                    throw new IllegalArgumentException("Kirim yozuvi (ID=" + p.getId() + ") faylda mavjud bo'lmagan ta'minotchiga (ID=" + p.getSupplierId() + ") bog'langan!");
                }
            }
        }

        if (data.getSupplyPayments() != null) {
            for (BackupData.SupplyPaymentDto pay : data.getSupplyPayments()) {
                if (pay.getSupplierId() != null && !supplierIds.contains(pay.getSupplierId())) {
                    throw new IllegalArgumentException("Ta'minot to'lovi yozuvi (ID=" + pay.getId() + ") faylda mavjud bo'lmagan ta'minotchiga (ID=" + pay.getSupplierId() + ") bog'langan!");
                }
            }
        }

        // 5. Barcha tekshiruvlar 100% muvaffaqiyatli o'tgandan so'nggina jadvallarni tozalash
        entityManager.createNativeQuery("TRUNCATE TABLE supply_purchases, supply_payments, suppliers, sale_items, sales, payments, stock_ins, shops, products, market_groups RESTART IDENTITY CASCADE").executeUpdate();

        // 2. Bozorlarni tiklash
        if (data.getMarketGroups() != null) {
            for (BackupData.MarketGroupDto mg : data.getMarketGroups()) {
                entityManager.createNativeQuery(
                        "INSERT INTO market_groups (id, name, is_deleted, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?)")
                        .setParameter(1, mg.getId())
                        .setParameter(2, mg.getName())
                        .setParameter(3, mg.getIsDeleted() != null ? mg.getIsDeleted() : false)
                        .setParameter(4, mg.getCreatedAt() != null ? mg.getCreatedAt() : LocalDateTime.now())
                        .setParameter(5, LocalDateTime.now())
                        .setParameter(6, mg.getCreatedBy() != null ? mg.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        // 3. Mahsulotlarni tiklash
        if (data.getProducts() != null) {
            for (BackupData.ProductDto p : data.getProducts()) {
                entityManager.createNativeQuery(
                        "INSERT INTO products (id, name, unit, package_name, units_per_package, purchase_price, sell_price, stock_quantity, is_deleted, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, p.getId())
                        .setParameter(2, p.getName())
                        .setParameter(3, p.getUnit())
                        .setParameter(4, p.getPackageName())
                        .setParameter(5, p.getUnitsPerPackage())
                        .setParameter(6, p.getPurchasePrice())
                        .setParameter(7, p.getSellPrice())
                        .setParameter(8, p.getStockQuantity())
                        .setParameter(9, p.getIsDeleted() != null ? p.getIsDeleted() : false)
                        .setParameter(10, p.getCreatedAt() != null ? p.getCreatedAt() : LocalDateTime.now())
                        .setParameter(11, LocalDateTime.now())
                        .setParameter(12, p.getCreatedBy() != null ? p.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        // 4. Do'konlarni tiklash
        if (data.getShops() != null) {
            for (BackupData.ShopDto s : data.getShops()) {
                entityManager.createNativeQuery(
                        "INSERT INTO shops (id, name, owner_name, phone, current_debt, market_group_id, is_deleted, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, s.getId())
                        .setParameter(2, s.getName())
                        .setParameter(3, s.getOwnerName())
                        .setParameter(4, s.getPhone())
                        .setParameter(5, s.getCurrentDebt())
                        .setParameter(6, s.getMarketGroupId())
                        .setParameter(7, s.getIsDeleted() != null ? s.getIsDeleted() : false)
                        .setParameter(8, s.getCreatedAt() != null ? s.getCreatedAt() : LocalDateTime.now())
                        .setParameter(9, LocalDateTime.now())
                        .setParameter(10, s.getCreatedBy() != null ? s.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        java.util.Map<Long, String> productNamesMap = new java.util.HashMap<>();
        if (data.getProducts() != null) {
            for (BackupData.ProductDto p : data.getProducts()) {
                if (p.getId() != null && p.getName() != null) {
                    productNamesMap.put(p.getId(), p.getName());
                }
            }
        }

        // 5. Bazadan kirimlarni tiklash
        if (data.getStockIns() != null) {
            for (BackupData.StockInDto si : data.getStockIns()) {
                String effProductName = (si.getProductName() != null && !si.getProductName().trim().isEmpty())
                        ? si.getProductName()
                        : (si.getProductId() != null ? productNamesMap.get(si.getProductId()) : null);

                entityManager.createNativeQuery(
                        "INSERT INTO stock_ins (id, product_id, product_name, package_count, total_cost, date, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, si.getId())
                        .setParameter(2, si.getProductId())
                        .setParameter(3, effProductName)
                        .setParameter(4, si.getPackageCount())
                        .setParameter(5, si.getTotalCost())
                        .setParameter(6, si.getDate() != null ? si.getDate() : LocalDateTime.now())
                        .setParameter(7, si.getCreatedAt() != null ? si.getCreatedAt() : LocalDateTime.now())
                        .setParameter(8, LocalDateTime.now())
                        .setParameter(9, si.getCreatedBy() != null ? si.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        // 6. Sotuvlarni va ularning detallarini tiklash
        if (data.getSales() != null) {
            for (BackupData.SaleDto sale : data.getSales()) {
                entityManager.createNativeQuery(
                        "INSERT INTO sales (id, shop_id, date, initial_paid_amount, payment_type, total_amount, is_cancelled, cancel_reason, cancelled_at, cancelled_by, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, sale.getId())
                        .setParameter(2, sale.getShopId())
                        .setParameter(3, sale.getDate() != null ? sale.getDate() : LocalDateTime.now())
                        .setParameter(4, sale.getInitialPaidAmount())
                        .setParameter(5, sale.getPaymentType() != null ? sale.getPaymentType().name() : "NASIYA")
                        .setParameter(6, sale.getTotalAmount())
                        .setParameter(7, Boolean.TRUE.equals(sale.getIsCancelled()))
                        .setParameter(8, sale.getCancelReason())
                        .setParameter(9, sale.getCancelledAt())
                        .setParameter(10, sale.getCancelledBy())
                        .setParameter(11, sale.getCreatedAt() != null ? sale.getCreatedAt() : LocalDateTime.now())
                        .setParameter(12, LocalDateTime.now())
                        .setParameter(13, sale.getCreatedBy() != null ? sale.getCreatedBy() : "admin")
                        .executeUpdate();

                if (sale.getItems() != null) {
                    for (BackupData.SaleItemDto item : sale.getItems()) {
                        String effItemName = (item.getProductName() != null && !item.getProductName().trim().isEmpty())
                                ? item.getProductName()
                                : (item.getProductId() != null ? productNamesMap.get(item.getProductId()) : null);

                        entityManager.createNativeQuery(
                                "INSERT INTO sale_items (id, sale_id, product_id, product_name, package_count, price_at_sale, cost_at_sale, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                                .setParameter(1, item.getId())
                                .setParameter(2, sale.getId())
                                .setParameter(3, item.getProductId())
                                .setParameter(4, effItemName)
                                .setParameter(5, item.getPackageCount())
                                .setParameter(6, item.getPriceAtSale())
                                .setParameter(7, item.getCostAtSale())
                                .setParameter(8, LocalDateTime.now())
                                .setParameter(9, LocalDateTime.now())
                                .setParameter(10, sale.getCreatedBy() != null ? sale.getCreatedBy() : "admin")
                                .executeUpdate();
                    }
                }
            }
        }

        // 7. To'lovlarni tiklash
        if (data.getPayments() != null) {
            for (BackupData.PaymentDto p : data.getPayments()) {
                entityManager.createNativeQuery(
                        "INSERT INTO payments (id, shop_id, sale_id, amount, method, is_cancelled, cancel_reason, cancelled_at, cancelled_by, date, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, p.getId())
                        .setParameter(2, p.getShopId())
                        .setParameter(3, p.getSaleId())
                        .setParameter(4, p.getAmount())
                        .setParameter(5, p.getMethod() != null ? p.getMethod().name() : "NAQD")
                        .setParameter(6, Boolean.TRUE.equals(p.getIsCancelled()))
                        .setParameter(7, p.getCancelReason())
                        .setParameter(8, p.getCancelledAt())
                        .setParameter(9, p.getCancelledBy())
                        .setParameter(10, p.getDate() != null ? p.getDate() : LocalDateTime.now())
                        .setParameter(11, p.getCreatedAt() != null ? p.getCreatedAt() : LocalDateTime.now())
                        .setParameter(12, LocalDateTime.now())
                        .setParameter(13, p.getCreatedBy() != null ? p.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        // 8. Ta'minotchilarni tiklash
        if (data.getSuppliers() != null) {
            for (BackupData.SupplierDto s : data.getSuppliers()) {
                entityManager.createNativeQuery(
                        "INSERT INTO suppliers (id, name, phone, category, current_debt, active, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, s.getId())
                        .setParameter(2, s.getName())
                        .setParameter(3, s.getPhone())
                        .setParameter(4, s.getCategory() != null ? s.getCategory() : "SHAKAR")
                        .setParameter(5, s.getCurrentDebt() != null ? s.getCurrentDebt() : BigDecimal.ZERO)
                        .setParameter(6, s.getActive() != null ? s.getActive() : true)
                        .setParameter(7, s.getCreatedAt() != null ? s.getCreatedAt() : LocalDateTime.now())
                        .setParameter(8, LocalDateTime.now())
                        .setParameter(9, s.getCreatedBy() != null ? s.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        // 9. Ta'minot kirimlarini tiklash
        if (data.getSupplyPurchases() != null) {
            for (BackupData.SupplyPurchaseDto p : data.getSupplyPurchases()) {
                entityManager.createNativeQuery(
                        "INSERT INTO supply_purchases (id, supplier_id, category, product_name, unit, quantity, unit_price, total_amount, purchase_date, note, liters_per_item, items_per_box, boxes_count, price_per_liter, total_liters, is_cancelled, cancel_reason, cancelled_by, cancelled_at, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, p.getId())
                        .setParameter(2, p.getSupplierId())
                        .setParameter(3, p.getCategory() != null ? p.getCategory() : "SHAKAR")
                        .setParameter(4, p.getProductName())
                        .setParameter(5, p.getUnit() != null ? p.getUnit() : "QOP")
                        .setParameter(6, p.getQuantity() != null ? p.getQuantity() : BigDecimal.ONE)
                        .setParameter(7, p.getUnitPrice() != null ? p.getUnitPrice() : BigDecimal.ZERO)
                        .setParameter(8, p.getTotalAmount() != null ? p.getTotalAmount() : BigDecimal.ZERO)
                        .setParameter(9, p.getPurchaseDate() != null ? p.getPurchaseDate() : LocalDateTime.now())
                        .setParameter(10, p.getNote())
                        .setParameter(11, p.getLitersPerItem())
                        .setParameter(12, p.getItemsPerBox())
                        .setParameter(13, p.getBoxesCount())
                        .setParameter(14, p.getPricePerLiter())
                        .setParameter(15, p.getTotalLiters())
                        .setParameter(16, Boolean.TRUE.equals(p.getIsCancelled()))
                        .setParameter(17, p.getCancelReason())
                        .setParameter(18, p.getCancelledBy())
                        .setParameter(19, p.getCancelledAt())
                        .setParameter(20, p.getCreatedAt() != null ? p.getCreatedAt() : LocalDateTime.now())
                        .setParameter(21, LocalDateTime.now())
                        .setParameter(22, p.getCreatedBy() != null ? p.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        // 10. Ta'minot to'lovlarini tiklash
        if (data.getSupplyPayments() != null) {
            for (BackupData.SupplyPaymentDto pay : data.getSupplyPayments()) {
                entityManager.createNativeQuery(
                        "INSERT INTO supply_payments (id, supplier_id, amount, payment_method, payment_date, note, is_cancelled, cancel_reason, cancelled_by, cancelled_at, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, pay.getId())
                        .setParameter(2, pay.getSupplierId())
                        .setParameter(3, pay.getAmount() != null ? pay.getAmount() : BigDecimal.ZERO)
                        .setParameter(4, pay.getPaymentMethod() != null ? pay.getPaymentMethod() : "NAQD")
                        .setParameter(5, pay.getPaymentDate() != null ? pay.getPaymentDate() : LocalDateTime.now())
                        .setParameter(6, pay.getNote())
                        .setParameter(7, Boolean.TRUE.equals(pay.getIsCancelled()))
                        .setParameter(8, pay.getCancelReason())
                        .setParameter(9, pay.getCancelledBy())
                        .setParameter(10, pay.getCancelledAt())
                        .setParameter(11, pay.getCreatedAt() != null ? pay.getCreatedAt() : LocalDateTime.now())
                        .setParameter(12, LocalDateTime.now())
                        .setParameter(13, pay.getCreatedBy() != null ? pay.getCreatedBy() : "admin")
                        .executeUpdate();
            }
        }

        // 11. PostgreSQL sekvenslarini yangilash (keyingi yangi IDlar to'g'ri ishlashi uchun)
        try {
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('market_groups', 'id'), coalesce(max(id), 1)) FROM market_groups").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id), 1)) FROM products").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('shops', 'id'), coalesce(max(id), 1)) FROM shops").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('stock_ins', 'id'), coalesce(max(id), 1)) FROM stock_ins").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('sales', 'id'), coalesce(max(id), 1)) FROM sales").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('sale_items', 'id'), coalesce(max(id), 1)) FROM sale_items").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('payments', 'id'), coalesce(max(id), 1)) FROM payments").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('suppliers', 'id'), coalesce(max(id), 1)) FROM suppliers").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('supply_purchases', 'id'), coalesce(max(id), 1)) FROM supply_purchases").getSingleResult();
            entityManager.createNativeQuery("SELECT setval(pg_get_serial_sequence('supply_payments', 'id'), coalesce(max(id), 1)) FROM supply_payments").getSingleResult();
        } catch (Exception e) {
            log.warn("Sequence yangilashda ogohlantirish (baza yangi bo'lsa normal): {}", e.getMessage());
        }

        entityManager.flush();
        log.info("Baza zaxira nusxasidan muvaffaqiyatli to'liq tiklandi!");
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportDatabaseExcel() {
        log.info("Baza to'liq Excel (.xlsx) formatda tayyorlanmoqda...");

        List<MarketGroup> marketGroups = marketGroupRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Shop> shops = shopRepository.findAll();
        List<StockIn> stockIns = stockInRepository.findAll();
        List<Sale> sales = saleRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplyPurchase> supplyPurchases = supplyPurchaseRepository.findAll();
        List<SupplyPayment> supplyPayments = supplyPaymentRepository.findAll();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Money Style (so'm)
            CellStyle moneyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            moneyStyle.setDataFormat(format.getFormat("#,##0"));

            // Dollar Style ($)
            CellStyle dollarStyle = workbook.createCellStyle();
            dollarStyle.setDataFormat(format.getFormat("$#,##0.00"));

            // 1-VARAQ: UMUMIY XULOSA
            Sheet summarySheet = workbook.createSheet("Umumiy Xulosa");
            int sRow = 0;
            Row titleRow = summarySheet.createRow(sRow++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BOZOR DISTRIBUTOR — BAZA ZAXIRA HISOBOTI");
            titleCell.setCellStyle(headerStyle);

            summarySheet.createRow(sRow++).createCell(0).setCellValue("Eksport qilingan sana: " + LocalDateTime.now().format(dtf));
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Mas'ul admin: " + SecurityUtils.getCurrentUsername());

            BigDecimal totalDebt = shops.stream()
                    .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()) && s.getCurrentDebt() != null)
                    .map(Shop::getCurrentDebt)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalSales = sales.stream()
                    .filter(s -> !Boolean.TRUE.equals(s.getIsCancelled()))
                    .map(Sale::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPayments = payments.stream()
                    .filter(p -> !Boolean.TRUE.equals(p.getIsCancelled()))
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long activeShopsCount = shops.stream().filter(s -> !Boolean.TRUE.equals(s.getIsDeleted())).count();
            long activeProductsCount = products.stream().filter(p -> !Boolean.TRUE.equals(p.getIsDeleted())).count();

            long activeSugarSuppliers = suppliers.stream().filter(s -> Boolean.TRUE.equals(s.getActive()) && "SHAKAR".equalsIgnoreCase(s.getCategory())).count();
            long activeOilSuppliers = suppliers.stream().filter(s -> Boolean.TRUE.equals(s.getActive()) && "YOG".equalsIgnoreCase(s.getCategory())).count();

            BigDecimal totalSugarDebt = suppliers.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getActive()) && "SHAKAR".equalsIgnoreCase(s.getCategory()) && s.getCurrentDebt() != null)
                    .map(Supplier::getCurrentDebt)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalOilDebt = suppliers.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getActive()) && "YOG".equalsIgnoreCase(s.getCategory()) && s.getCurrentDebt() != null)
                    .map(Supplier::getCurrentDebt)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            sRow++;
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Do'konlar soni (faol): " + activeShopsCount + " ta");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Barcha do'konlarning umumiy qarzi: " + totalDebt + " so'm");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Jami amalga oshirilgan savdolar: " + totalSales + " so'm");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Jami qabul qilingan to'lovlar: " + totalPayments + " so'm");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Mahsulot turlari soni (faol): " + activeProductsCount + " xil");
            sRow++;
            summarySheet.createRow(sRow++).createCell(0).setCellValue("--- TA'MINOT BO'LIMI ---");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Shakar ta'minotchilari soni: " + activeSugarSuppliers + " ta");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Shakar bo'yicha joriy qarzimiz: " + totalSugarDebt + " so'm");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Yog' ta'minotchilari soni: " + activeOilSuppliers + " ta");
            summarySheet.createRow(sRow++).createCell(0).setCellValue("Yog' bo'yicha joriy qarzimiz: $" + totalOilDebt);
            summarySheet.autoSizeColumn(0);

            // 2-VARAQ: DO'KONLAR VA QARZLAR
            Sheet shopsSheet = workbook.createSheet("Do'konlar va Qarzlar");
            Row shopHeader = shopsSheet.createRow(0);
            String[] shopCols = {"№", "Bozor / Hudud", "Do'kon nomi", "Do'kon egasi", "Telefon", "Joriy Qarz (so'm)", "Qo'shilgan sana"};
            for (int i = 0; i < shopCols.length; i++) {
                Cell c = shopHeader.createCell(i);
                c.setCellValue(shopCols[i]);
                c.setCellStyle(headerStyle);
            }
            int rIdx = 1;
            for (Shop shop : shops) {
                if (Boolean.TRUE.equals(shop.getIsDeleted())) continue;
                Row row = shopsSheet.createRow(rIdx);
                row.createCell(0).setCellValue(rIdx);
                row.createCell(1).setCellValue(shop.getMarketGroup() != null ? shop.getMarketGroup().getName() : "");
                row.createCell(2).setCellValue(shop.getName() != null ? shop.getName() : "");
                row.createCell(3).setCellValue(shop.getOwnerName() != null ? shop.getOwnerName() : "");
                row.createCell(4).setCellValue(shop.getPhone() != null ? shop.getPhone() : "");

                Cell debtCell = row.createCell(5);
                debtCell.setCellValue(shop.getCurrentDebt() != null ? shop.getCurrentDebt().doubleValue() : 0.0);
                debtCell.setCellStyle(moneyStyle);

                row.createCell(6).setCellValue(shop.getCreatedAt() != null ? shop.getCreatedAt().format(df) : "");
                rIdx++;
            }
            for (int i = 0; i < shopCols.length; i++) shopsSheet.autoSizeColumn(i);

            // 3-VARAQ: OMBOR VA MAHSULOTLAR
            Sheet prodSheet = workbook.createSheet("Ombordagi Mahsulotlar");
            Row prodHeader = prodSheet.createRow(0);
            String[] prodCols = {"№", "Mahsulot nomi", "Birlik", "Qadoq turi", "Paketdagi miqdor", "Tannarx (so'm)", "Sotish narxi (so'm)", "Ombordagi qoldiq"};
            for (int i = 0; i < prodCols.length; i++) {
                Cell c = prodHeader.createCell(i);
                c.setCellValue(prodCols[i]);
                c.setCellStyle(headerStyle);
            }
            rIdx = 1;
            for (Product p : products) {
                if (Boolean.TRUE.equals(p.getIsDeleted())) continue;
                Row row = prodSheet.createRow(rIdx);
                row.createCell(0).setCellValue(rIdx);
                row.createCell(1).setCellValue(p.getName() != null ? p.getName() : "");
                row.createCell(2).setCellValue(p.getUnit() != null ? p.getUnit() : "");
                row.createCell(3).setCellValue(p.getPackageName() != null ? p.getPackageName() : "");
                row.createCell(4).setCellValue(p.getUnitsPerPackage() != null ? p.getUnitsPerPackage().doubleValue() : 1.0);

                Cell buyCell = row.createCell(5);
                buyCell.setCellValue(p.getPurchasePrice() != null ? p.getPurchasePrice().doubleValue() : 0.0);
                buyCell.setCellStyle(moneyStyle);

                Cell sellCell = row.createCell(6);
                sellCell.setCellValue(p.getSellPrice() != null ? p.getSellPrice().doubleValue() : 0.0);
                sellCell.setCellStyle(moneyStyle);

                row.createCell(7).setCellValue(p.getStockQuantity() != null ? p.getStockQuantity() : 0);
                rIdx++;
            }
            for (int i = 0; i < prodCols.length; i++) prodSheet.autoSizeColumn(i);

            // 4-VARAQ: SOTUVLAR TARIXI
            Sheet salesSheet = workbook.createSheet("Sotuvlar tarixi");
            Row saleHeader = salesSheet.createRow(0);
            String[] saleCols = {"ID", "Sana va vaqt", "Do'kon", "Jami summa (so'm)", "Boshlang'ich to'lov", "To'lov turi", "Kim sotdi"};
            for (int i = 0; i < saleCols.length; i++) {
                Cell c = saleHeader.createCell(i);
                c.setCellValue(saleCols[i]);
                c.setCellStyle(headerStyle);
            }
            rIdx = 1;
            for (Sale sale : sales) {
                Row row = salesSheet.createRow(rIdx++);
                row.createCell(0).setCellValue(sale.getId());
                row.createCell(1).setCellValue(sale.getDate() != null ? sale.getDate().format(dtf) : "");
                row.createCell(2).setCellValue(sale.getShop() != null ? sale.getShop().getName() : "");

                Cell totalCell = row.createCell(3);
                totalCell.setCellValue(sale.getTotalAmount() != null ? sale.getTotalAmount().doubleValue() : 0.0);
                totalCell.setCellStyle(moneyStyle);

                Cell initCell = row.createCell(4);
                initCell.setCellValue(sale.getInitialPaidAmount() != null ? sale.getInitialPaidAmount().doubleValue() : 0.0);
                initCell.setCellStyle(moneyStyle);

                row.createCell(5).setCellValue(sale.getPaymentType() != null ? sale.getPaymentType().toString() : "");
                row.createCell(6).setCellValue(sale.getCreatedBy() != null ? sale.getCreatedBy() : "admin");
            }
            for (int i = 0; i < saleCols.length; i++) salesSheet.autoSizeColumn(i);

            // 5-VARAQ: TO'LOVLAR TARIXI
            Sheet paySheet = workbook.createSheet("To'lovlar tarixi");
            Row payHeader = paySheet.createRow(0);
            String[] payCols = {"ID", "Sana va vaqt", "Do'kon", "To'langan summa (so'm)", "To'lov usuli", "Kim qabul qildi"};
            for (int i = 0; i < payCols.length; i++) {
                Cell c = payHeader.createCell(i);
                c.setCellValue(payCols[i]);
                c.setCellStyle(headerStyle);
            }
            rIdx = 1;
            for (Payment p : payments) {
                Row row = paySheet.createRow(rIdx++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getDate() != null ? p.getDate().format(dtf) : "");
                row.createCell(2).setCellValue(p.getShop() != null ? p.getShop().getName() : "");

                Cell amtCell = row.createCell(3);
                amtCell.setCellValue(p.getAmount() != null ? p.getAmount().doubleValue() : 0.0);
                amtCell.setCellStyle(moneyStyle);

                row.createCell(4).setCellValue(p.getMethod() != null ? p.getMethod().toString() : "");
                row.createCell(5).setCellValue(p.getCreatedBy() != null ? p.getCreatedBy() : "admin");
            }
            for (int i = 0; i < payCols.length; i++) paySheet.autoSizeColumn(i);

            // 6-VARAQ: TA'MINOTCHILAR VA QARZLAR
            Sheet supSheet = workbook.createSheet("Ta'minotchilar va Qarzlar");
            Row supHeader = supSheet.createRow(0);
            String[] supCols = {"№", "Nomi", "Telefon", "Kategoriya", "Joriy Qarz", "Valyuta", "Holati", "Qo'shilgan sana"};
            for (int i = 0; i < supCols.length; i++) {
                Cell c = supHeader.createCell(i);
                c.setCellValue(supCols[i]);
                c.setCellStyle(headerStyle);
            }
            rIdx = 1;
            for (Supplier sup : suppliers) {
                Row row = supSheet.createRow(rIdx);
                row.createCell(0).setCellValue(rIdx);
                row.createCell(1).setCellValue(sup.getName() != null ? sup.getName() : "");
                row.createCell(2).setCellValue(sup.getPhone() != null ? sup.getPhone() : "");
                boolean isOil = "YOG".equalsIgnoreCase(sup.getCategory());
                row.createCell(3).setCellValue(isOil ? "Yog'" : "Shakar");

                Cell debtCell = row.createCell(4);
                debtCell.setCellValue(sup.getCurrentDebt() != null ? sup.getCurrentDebt().doubleValue() : 0.0);
                debtCell.setCellStyle(isOil ? dollarStyle : moneyStyle);

                row.createCell(5).setCellValue(isOil ? "$" : "so'm");
                row.createCell(6).setCellValue(Boolean.TRUE.equals(sup.getActive()) ? "Faol" : "Arxivlangan");
                row.createCell(7).setCellValue(sup.getCreatedAt() != null ? sup.getCreatedAt().format(df) : "");
                rIdx++;
            }
            for (int i = 0; i < supCols.length; i++) supSheet.autoSizeColumn(i);

            // 7-VARAQ: TA'MINOT KIRIMLARI
            Sheet supPurchasesSheet = workbook.createSheet("Ta'minot Kirimlari");
            Row spHeader = supPurchasesSheet.createRow(0);
            String[] spCols = {"ID", "Sana va vaqt", "Ta'minotchi", "Kategoriya", "Mahsulot", "Miqdor", "Birlik", "Birlik narxi", "Jami summa", "Bekor qilinganmi", "Izoh"};
            for (int i = 0; i < spCols.length; i++) {
                Cell c = spHeader.createCell(i);
                c.setCellValue(spCols[i]);
                c.setCellStyle(headerStyle);
            }
            rIdx = 1;
            for (SupplyPurchase p : supplyPurchases) {
                Row row = supPurchasesSheet.createRow(rIdx++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getPurchaseDate() != null ? p.getPurchaseDate().format(dtf) : "");
                row.createCell(2).setCellValue(p.getSupplier() != null ? p.getSupplier().getName() : "");
                boolean isOil = "YOG".equalsIgnoreCase(p.getCategory());
                row.createCell(3).setCellValue(isOil ? "Yog'" : "Shakar");
                row.createCell(4).setCellValue(p.getProductName() != null ? p.getProductName() : "");
                row.createCell(5).setCellValue(p.getQuantity() != null ? p.getQuantity().doubleValue() : 0.0);
                row.createCell(6).setCellValue(p.getUnit() != null ? p.getUnit() : "");

                Cell priceCell = row.createCell(7);
                priceCell.setCellValue(p.getUnitPrice() != null ? p.getUnitPrice().doubleValue() : 0.0);
                priceCell.setCellStyle(isOil ? dollarStyle : moneyStyle);

                Cell totalCell = row.createCell(8);
                totalCell.setCellValue(p.getTotalAmount() != null ? p.getTotalAmount().doubleValue() : 0.0);
                totalCell.setCellStyle(isOil ? dollarStyle : moneyStyle);

                row.createCell(9).setCellValue(Boolean.TRUE.equals(p.getIsCancelled()) ? "HA (" + (p.getCancelReason() != null ? p.getCancelReason() : "") + ")" : "YO'Q");
                row.createCell(10).setCellValue(p.getNote() != null ? p.getNote() : "");
            }
            for (int i = 0; i < spCols.length; i++) supPurchasesSheet.autoSizeColumn(i);

            // 8-VARAQ: TA'MINOT TO'LOVLARI
            Sheet supPaySheet = workbook.createSheet("Ta'minot To'lovlari");
            Row sppHeader = supPaySheet.createRow(0);
            String[] sppCols = {"ID", "Sana va vaqt", "Ta'minotchi", "Kategoriya", "To'lov summasi", "To'lov usuli", "Bekor qilinganmi", "Izoh", "Kim qabul qildi"};
            for (int i = 0; i < sppCols.length; i++) {
                Cell c = sppHeader.createCell(i);
                c.setCellValue(sppCols[i]);
                c.setCellStyle(headerStyle);
            }
            rIdx = 1;
            for (SupplyPayment sp : supplyPayments) {
                Row row = supPaySheet.createRow(rIdx++);
                row.createCell(0).setCellValue(sp.getId());
                row.createCell(1).setCellValue(sp.getPaymentDate() != null ? sp.getPaymentDate().format(dtf) : "");
                row.createCell(2).setCellValue(sp.getSupplier() != null ? sp.getSupplier().getName() : "");
                boolean isOil = sp.getSupplier() != null && "YOG".equalsIgnoreCase(sp.getSupplier().getCategory());
                row.createCell(3).setCellValue(isOil ? "Yog'" : "Shakar");

                Cell amtCell = row.createCell(4);
                amtCell.setCellValue(sp.getAmount() != null ? sp.getAmount().doubleValue() : 0.0);
                amtCell.setCellStyle(isOil ? dollarStyle : moneyStyle);

                row.createCell(5).setCellValue(sp.getPaymentMethod() != null ? sp.getPaymentMethod() : "NAQD");
                row.createCell(6).setCellValue(Boolean.TRUE.equals(sp.getIsCancelled()) ? "HA (" + (sp.getCancelReason() != null ? sp.getCancelReason() : "") + ")" : "YO'Q");
                row.createCell(7).setCellValue(sp.getNote() != null ? sp.getNote() : "");
                row.createCell(8).setCellValue(sp.getCreatedBy() != null ? sp.getCreatedBy() : "admin");
            }
            for (int i = 0; i < sppCols.length; i++) supPaySheet.autoSizeColumn(i);

            workbook.write(out);
            log.info("Baza to'liq Excel (.xlsx) fayli muvaffaqiyatli shakllantirildi.");
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Excel baza zaxirasini yaratishda xatolik:", e);
            throw new RuntimeException("Excel fayl yaratishda xatolik: " + e.getMessage());
        }
    }
}
