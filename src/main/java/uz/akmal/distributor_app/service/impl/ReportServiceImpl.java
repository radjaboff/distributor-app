package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.DailyReportResponse;
import uz.akmal.distributor_app.entity.*;
import uz.akmal.distributor_app.enums.PaymentType;
import uz.akmal.distributor_app.repository.*;
import uz.akmal.distributor_app.service.ReportService;
import org.springframework.stereotype.Service;
import uz.akmal.distributor_app.dto.MonthlyReportResponse;
import java.time.YearMonth;
import java.util.Map;
import uz.akmal.distributor_app.dto.DashboardSummaryResponse;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import uz.akmal.distributor_app.dto.RangeReportResponse;
import uz.akmal.distributor_app.enums.PaymentMethod;

@Service
public class ReportServiceImpl implements ReportService {

    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final StockInRepository stockInRepository;

    public ReportServiceImpl(SaleRepository saleRepository,
                             PaymentRepository paymentRepository,
                             ShopRepository shopRepository,
                             ProductRepository productRepository,
                             StockInRepository stockInRepository) {
        this.saleRepository = saleRepository;
        this.paymentRepository = paymentRepository;
        this.shopRepository = shopRepository;
        this.productRepository = productRepository;
        this.stockInRepository = stockInRepository;
    }


    @Override
    public MonthlyReportResponse getMonthlyReport(YearMonth month) {
        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.plusMonths(1).atDay(1).atStartOfDay();

        List<Sale> sales = saleRepository.findByDateBetweenWithDetails(start, end).stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsCancelled()))
                .toList();
        List<Payment> payments = paymentRepository.findByDateBetweenWithShop(start, end).stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsCancelled()))
                .toList();

        MonthlyReportResponse response = new MonthlyReportResponse();
        response.setMonth(month);

        // 1) Umumiy sotuv summasi va foyda
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        Map<String, Integer> productVolumeMap = new java.util.HashMap<>();

        for (Sale sale : sales) {
            totalSales = totalSales.add(sale.getTotalAmount());

            for (SaleItem item : sale.getItems()) {
                BigDecimal price = (item.getPriceAtSale() != null) ? item.getPriceAtSale() : BigDecimal.ZERO;
                BigDecimal cost = (item.getCostAtSale() != null) ? item.getCostAtSale() : BigDecimal.ZERO;
                int count = (item.getPackageCount() != null) ? item.getPackageCount() : 0;
                BigDecimal itemProfit = price.subtract(cost).multiply(BigDecimal.valueOf(count));
                totalProfit = totalProfit.add(itemProfit);

                String productName = item.getEffectiveProductName();
                productVolumeMap.merge(productName, count, Integer::sum);
            }
        }
        response.setTotalSalesAmount(totalSales);
        response.setTotalProfit(totalProfit);

        // 1.1) To'lov turi bo'yicha tushum (NAQD/KARTA/NASIYA)
        Map<PaymentType, BigDecimal> revenueByType = new EnumMap<>(PaymentType.class);
        for (PaymentType type : PaymentType.values()) {
            revenueByType.put(type, BigDecimal.ZERO);
        }
        for (Payment payment : payments) {
            if (payment.getMethod() == PaymentMethod.NAQD) {
                revenueByType.put(PaymentType.NAQD, revenueByType.get(PaymentType.NAQD).add(payment.getAmount()));
            } else if (payment.getMethod() == PaymentMethod.KARTA) {
                revenueByType.put(PaymentType.KARTA, revenueByType.get(PaymentType.KARTA).add(payment.getAmount()));
            }
        }
        for (Sale sale : sales) {
            BigDecimal initialPaid = (sale.getInitialPaidAmount() != null) ? sale.getInitialPaidAmount() : BigDecimal.ZERO;
            BigDecimal debtPortion = sale.getTotalAmount().subtract(initialPaid);
            revenueByType.put(PaymentType.NASIYA, revenueByType.get(PaymentType.NASIYA).add(debtPortion));
        }
        response.setRevenueByType(revenueByType);

        // 2) Mahsulot bo'yicha sotuv hajmi
        List<MonthlyReportResponse.ProductVolume> productVolumes = productVolumeMap.entrySet().stream()
                .map(entry -> {
                    MonthlyReportResponse.ProductVolume pv = new MonthlyReportResponse.ProductVolume();
                    pv.setProductName(entry.getKey());
                    pv.setTotalPackagesSold(entry.getValue());
                    return pv;
                })
                .sorted((a, b) -> b.getTotalPackagesSold().compareTo(a.getTotalPackagesSold()))
                .toList();
        response.setProductSalesVolume(productVolumes);

        List<StockIn> stockIns = stockInRepository.findByDateBetweenWithProduct(start, end);

        BigDecimal totalStockInCost = stockIns.stream()
                .map(StockIn::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalStockInCost(totalStockInCost);

        Map<String, Integer> stockInVolumeMap = new java.util.HashMap<>();
        for (StockIn stockIn : stockIns) {
            int pCount = (stockIn.getPackageCount() != null) ? stockIn.getPackageCount() : 0;
            stockInVolumeMap.merge(stockIn.getEffectiveProductName(), pCount, Integer::sum);
        }
        List<MonthlyReportResponse.StockInVolume> stockInVolumes = stockInVolumeMap.entrySet().stream()
                .map(entry -> {
                    MonthlyReportResponse.StockInVolume sv = new MonthlyReportResponse.StockInVolume();
                    sv.setProductName(entry.getKey());
                    sv.setTotalPackagesReceived(entry.getValue());
                    return sv;
                })
                .sorted((a, b) -> b.getTotalPackagesReceived().compareTo(a.getTotalPackagesReceived()))
                .toList();
        response.setStockInVolume(stockInVolumes);

        // 3) TOP qarzdor do'konlar (eng ko'p qarzi bor 5 tasi)
        List<MonthlyReportResponse.TopShop> topShops = shopRepository.findByIsDeletedFalse().stream()
                .filter(s -> s.getCurrentDebt() != null && s.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0)
                .sorted((a, b) -> {
                    BigDecimal debtA = a.getCurrentDebt() != null ? a.getCurrentDebt() : BigDecimal.ZERO;
                    BigDecimal debtB = b.getCurrentDebt() != null ? b.getCurrentDebt() : BigDecimal.ZERO;
                    return debtB.compareTo(debtA);
                }).limit(5)
                .map(shop -> {
                    MonthlyReportResponse.TopShop ts = new MonthlyReportResponse.TopShop();
                    ts.setShopName(shop.getName());
                    ts.setCurrentDebt(shop.getCurrentDebt() != null ? shop.getCurrentDebt() : BigDecimal.ZERO);
                    return ts;
                })
                .toList();
        response.setTopDebtorShops(topShops);

        return response;
    }


    @Override
    public DailyReportResponse getDailyReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<Sale> sales = saleRepository.findByDateBetweenWithDetails(start, end).stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsCancelled()))
                .toList();
        List<Payment> payments = paymentRepository.findByDateBetweenWithShop(start, end).stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsCancelled()))
                .toList();
        List<StockIn> stockIns = stockInRepository.findByDateBetweenWithProduct(start, end);

        DailyReportResponse response = new DailyReportResponse();
        response.setDate(date);

        BigDecimal totalSales = sales.stream()
                .map(Sale::getTotalAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalSalesAmount(totalSales);

        // 1) Sotuvlar ro'yxati
        response.setSales(sales.stream().map(sale -> {
            DailyReportResponse.SaleSummary s = new DailyReportResponse.SaleSummary();
            s.setShopName(sale.getShop().getName());
            s.setAmount(sale.getTotalAmount());
            s.setPaymentType(sale.getPaymentType());
            s.setCreatedBy(sale.getCreatedBy() != null && !sale.getCreatedBy().trim().isEmpty() ? sale.getCreatedBy() : "admin");
            return s;
        }).toList());

        // 2) To'lovlar ro'yxati
        response.setPayments(payments.stream().map(payment -> {
            DailyReportResponse.PaymentSummary p = new DailyReportResponse.PaymentSummary();
            p.setShopName(payment.getShop().getName());
            p.setAmount(payment.getAmount());
            p.setCreatedBy(payment.getCreatedBy() != null && !payment.getCreatedBy().trim().isEmpty() ? payment.getCreatedBy() : "admin");
            return p;
        }).toList());

        // 3) Kunlik foyda — har bir SaleItem bo'yicha (priceAtSale - costAtSale) * packageCount
        BigDecimal profit = BigDecimal.ZERO;
        for (Sale sale : sales) {
            for (SaleItem item : sale.getItems()) {
                BigDecimal price = (item.getPriceAtSale() != null) ? item.getPriceAtSale() : BigDecimal.ZERO;
                BigDecimal cost = (item.getCostAtSale() != null) ? item.getCostAtSale() : BigDecimal.ZERO;
                int count = (item.getPackageCount() != null) ? item.getPackageCount() : 0;
                BigDecimal itemProfit = price.subtract(cost).multiply(BigDecimal.valueOf(count));
                profit = profit.add(itemProfit);
            }
        }
        response.setDailyProfit(profit);

        // 4) To'lov turi bo'yicha summalar (NAQD/KARTA/NASIYA)
        Map<PaymentType, BigDecimal> revenueByType = new EnumMap<>(PaymentType.class);
        for (PaymentType type : PaymentType.values()) {
            revenueByType.put(type, BigDecimal.ZERO);
        }
        for (Payment payment : payments) {
            if (payment.getMethod() == PaymentMethod.NAQD) {
                revenueByType.put(PaymentType.NAQD, revenueByType.get(PaymentType.NAQD).add(payment.getAmount()));
            } else if (payment.getMethod() == PaymentMethod.KARTA) {
                revenueByType.put(PaymentType.KARTA, revenueByType.get(PaymentType.KARTA).add(payment.getAmount()));
            }
        }
        for (Sale sale : sales) {
            BigDecimal initialPaid = (sale.getInitialPaidAmount() != null) ? sale.getInitialPaidAmount() : BigDecimal.ZERO;
            BigDecimal debtPortion = sale.getTotalAmount().subtract(initialPaid);
            revenueByType.put(PaymentType.NASIYA, revenueByType.get(PaymentType.NASIYA).add(debtPortion));
        }
        response.setRevenueByType(revenueByType);

        // 5) Barcha do'konlarning umumiy joriy qarzi
        BigDecimal totalDebt = shopRepository.findByIsDeletedFalse().stream()
                .filter(shop -> shop.getCurrentDebt() != null && shop.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0)
                .map(Shop::getCurrentDebt)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalDebtAllShops(totalDebt);

        // 6) Bazadan kirimlar (StockIn) ro'yxati va umumiy xarajat
        response.setStockIns(stockIns.stream().map(stockIn -> {
            DailyReportResponse.StockInSummary s = new DailyReportResponse.StockInSummary();
            s.setProductName(stockIn.getEffectiveProductName());
            s.setPackageCount(stockIn.getPackageCount());
            s.setTotalCost(stockIn.getTotalCost());
            s.setCreatedBy(stockIn.getCreatedBy() != null && !stockIn.getCreatedBy().trim().isEmpty() ? stockIn.getCreatedBy() : "admin");
            return s;
        }).toList());

        BigDecimal totalStockInCost = stockIns.stream()
                .map(StockIn::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalStockInCost(totalStockInCost);

        return response;
    }


    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        DashboardSummaryResponse response = new DashboardSummaryResponse();

        // 1) Barcha do'konlarning umumiy joriy qarzi
        BigDecimal totalDebt = shopRepository.findByIsDeletedFalse().stream()
                .filter(shop -> shop.getCurrentDebt() != null && shop.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0)
                .map(Shop::getCurrentDebt)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalDebtAllShops(totalDebt);

        // 2) Bugungi sotuvlar va foyda
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().plusDays(1).atStartOfDay();
        List<Sale> todaysSales = saleRepository.findByDateBetweenWithDetails(todayStart, todayEnd).stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsCancelled()))
                .toList();

        BigDecimal salesTotal = BigDecimal.ZERO;
        BigDecimal profit = BigDecimal.ZERO;
        for (Sale sale : todaysSales) {
            if (sale.getTotalAmount() != null) {
                salesTotal = salesTotal.add(sale.getTotalAmount());
            }
            if (sale.getItems() != null) {
                for (SaleItem item : sale.getItems()) {
                    BigDecimal price = (item.getPriceAtSale() != null) ? item.getPriceAtSale() : BigDecimal.ZERO;
                    BigDecimal cost = (item.getCostAtSale() != null) ? item.getCostAtSale() : BigDecimal.ZERO;
                    int count = (item.getPackageCount() != null) ? item.getPackageCount() : 0;
                    BigDecimal itemProfit = price.subtract(cost).multiply(BigDecimal.valueOf(count));
                    profit = profit.add(itemProfit);
                }
            }
        }
        response.setTodaysSalesTotal(salesTotal);
        response.setTodaysProfit(profit);

        // 3) Bugungi undirilgan to'lovlar (kassa tushumi)
        List<Payment> todaysPayments = paymentRepository.findByDateBetweenWithShop(todayStart, todayEnd).stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsCancelled()))
                .toList();
        BigDecimal paymentsTotal = BigDecimal.ZERO;
        for (Payment payment : todaysPayments) {
            if (payment.getAmount() != null) {
                paymentsTotal = paymentsTotal.add(payment.getAmount());
            }
        }
        response.setTodaysPaymentsTotal(paymentsTotal);

        // 4) Ombor qoldig'i nazorati olib tashlanganligi sababli bo'sh ro'yxat qaytariladi
        response.setLowStockProducts(java.util.Collections.emptyList());

        return response;
    }


    @Override
    public RangeReportResponse getRangeReport(LocalDate start, LocalDate end) {
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.plusDays(1).atStartOfDay();

        List<Sale> sales = saleRepository.findByDateBetweenWithDetails(startDt, endDt).stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsCancelled()))
                .toList();
        List<Payment> payments = paymentRepository.findByDateBetweenWithShop(startDt, endDt).stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsCancelled()))
                .toList();

        RangeReportResponse response = new RangeReportResponse();
        response.setStartDate(start);
        response.setEndDate(end);

        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        Map<String, Integer> productVolumeMap = new java.util.HashMap<>();

        for (Sale sale : sales) {
            totalSales = totalSales.add(sale.getTotalAmount());

            for (SaleItem item : sale.getItems()) {
                BigDecimal price = (item.getPriceAtSale() != null) ? item.getPriceAtSale() : BigDecimal.ZERO;
                BigDecimal cost = (item.getCostAtSale() != null) ? item.getCostAtSale() : BigDecimal.ZERO;
                int count = (item.getPackageCount() != null) ? item.getPackageCount() : 0;
                BigDecimal itemProfit = price.subtract(cost).multiply(BigDecimal.valueOf(count));
                totalProfit = totalProfit.add(itemProfit);

                productVolumeMap.merge(item.getEffectiveProductName(), count, Integer::sum);
            }
        }
        response.setTotalSalesAmount(totalSales);
        response.setTotalProfit(totalProfit);

        // To'lov turi bo'yicha tushum (NAQD/KARTA/NASIYA) — Payment yozuvlari + Sale'ning NASIYA qismi orqali
        Map<PaymentType, BigDecimal> revenueByType = new EnumMap<>(PaymentType.class);
        for (PaymentType type : PaymentType.values()) {
            revenueByType.put(type, BigDecimal.ZERO);
        }
        for (Payment payment : payments) {
            if (payment.getMethod() == PaymentMethod.NAQD) {
                revenueByType.put(PaymentType.NAQD, revenueByType.get(PaymentType.NAQD).add(payment.getAmount()));
            } else if (payment.getMethod() == PaymentMethod.KARTA) {
                revenueByType.put(PaymentType.KARTA, revenueByType.get(PaymentType.KARTA).add(payment.getAmount()));
            }
        }
        for (Sale sale : sales) {
            BigDecimal initialPaid = (sale.getInitialPaidAmount() != null) ? sale.getInitialPaidAmount() : BigDecimal.ZERO;
            BigDecimal debtPortion = sale.getTotalAmount().subtract(initialPaid);
            revenueByType.put(PaymentType.NASIYA, revenueByType.get(PaymentType.NASIYA).add(debtPortion));
        }
        response.setRevenueByType(revenueByType);

        List<MonthlyReportResponse.ProductVolume> productVolumes = productVolumeMap.entrySet().stream()
                .map(entry -> {
                    MonthlyReportResponse.ProductVolume pv = new MonthlyReportResponse.ProductVolume();
                    pv.setProductName(entry.getKey());
                    pv.setTotalPackagesSold(entry.getValue());
                    return pv;
                })
                .sorted((a, b) -> b.getTotalPackagesSold().compareTo(a.getTotalPackagesSold()))
                .toList();
        response.setProductSalesVolume(productVolumes);

        List<StockIn> stockIns = stockInRepository.findByDateBetweenWithProduct(startDt, endDt);

        BigDecimal totalStockInCost = stockIns.stream()
                .map(StockIn::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalStockInCost(totalStockInCost);

        Map<String, Integer> stockInVolumeMap = new java.util.HashMap<>();
        for (StockIn stockIn : stockIns) {
            int pCount = (stockIn.getPackageCount() != null) ? stockIn.getPackageCount() : 0;
            stockInVolumeMap.merge(stockIn.getEffectiveProductName(), pCount, Integer::sum);
        }
        List<MonthlyReportResponse.StockInVolume> stockInVolumes = stockInVolumeMap.entrySet().stream()
                .map(entry -> {
                    MonthlyReportResponse.StockInVolume sv = new MonthlyReportResponse.StockInVolume();
                    sv.setProductName(entry.getKey());
                    sv.setTotalPackagesReceived(entry.getValue());
                    return sv;
                })
                .sorted((a, b) -> b.getTotalPackagesReceived().compareTo(a.getTotalPackagesReceived()))
                .toList();
        response.setStockInVolume(stockInVolumes);

        List<MonthlyReportResponse.TopShop> topShops = shopRepository.findByIsDeletedFalse().stream()
                .filter(s -> s.getCurrentDebt() != null && s.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0)
                .sorted((a, b) -> b.getCurrentDebt().compareTo(a.getCurrentDebt()))
                .limit(5)
                .map(shop -> {
                    MonthlyReportResponse.TopShop ts = new MonthlyReportResponse.TopShop();
                    ts.setShopName(shop.getName());
                    ts.setCurrentDebt(shop.getCurrentDebt());
                    return ts;
                })
                .toList();
        response.setTopDebtorShops(topShops);

        return response;
    }

}