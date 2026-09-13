package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.DailyReportResponse;
import uz.akmal.distributor_app.entity.Payment;
import uz.akmal.distributor_app.entity.Sale;
import uz.akmal.distributor_app.entity.SaleItem;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.enums.PaymentType;
import uz.akmal.distributor_app.repository.PaymentRepository;
import uz.akmal.distributor_app.repository.SaleRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.ReportService;
import org.springframework.stereotype.Service;
import uz.akmal.distributor_app.dto.MonthlyReportResponse;
import java.time.YearMonth;
import java.util.Map;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportServiceImpl implements ReportService {

    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;
    private final ShopRepository shopRepository;

    public ReportServiceImpl(SaleRepository saleRepository,
                             PaymentRepository paymentRepository,
                             ShopRepository shopRepository) {
        this.saleRepository = saleRepository;
        this.paymentRepository = paymentRepository;
        this.shopRepository = shopRepository;
    }


    @Override
    public MonthlyReportResponse getMonthlyReport(YearMonth month) {
        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.plusMonths(1).atDay(1).atStartOfDay();

        List<Sale> sales = saleRepository.findByDateBetween(start, end);

        MonthlyReportResponse response = new MonthlyReportResponse();
        response.setMonth(month);

        // 1) Umumiy sotuv summasi va foyda
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        Map<String, Integer> productVolumeMap = new java.util.HashMap<>();

        for (Sale sale : sales) {
            totalSales = totalSales.add(sale.getTotalAmount());

            for (SaleItem item : sale.getItems()) {
                BigDecimal itemProfit = item.getPriceAtSale()
                        .subtract(item.getCostAtSale())
                        .multiply(BigDecimal.valueOf(item.getPackageCount()));
                totalProfit = totalProfit.add(itemProfit);

                String productName = item.getProduct().getName();
                productVolumeMap.merge(productName, item.getPackageCount(), Integer::sum);
            }
        }
        response.setTotalSalesAmount(totalSales);
        response.setTotalProfit(totalProfit);

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

        // 3) TOP qarzdor do'konlar (eng ko'p qarzi bor 5 tasi)
        List<MonthlyReportResponse.TopShop> topShops = shopRepository.findAll().stream()
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



    @Override
    public DailyReportResponse getDailyReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<Sale> sales = saleRepository.findByDateBetween(start, end);
        List<Payment> payments = paymentRepository.findByDateBetween(start, end);

        DailyReportResponse response = new DailyReportResponse();
        response.setDate(date);

        // 1) Sotuvlar ro'yxati
        response.setSales(sales.stream().map(sale -> {
            DailyReportResponse.SaleSummary s = new DailyReportResponse.SaleSummary();
            s.setShopName(sale.getShop().getName());
            s.setAmount(sale.getTotalAmount());
            s.setPaymentType(sale.getPaymentType());
            return s;
        }).toList());

        // 2) To'lovlar ro'yxati
        response.setPayments(payments.stream().map(payment -> {
            DailyReportResponse.PaymentSummary p = new DailyReportResponse.PaymentSummary();
            p.setShopName(payment.getShop().getName());
            p.setAmount(payment.getAmount());
            return p;
        }).toList());

        // 3) Kunlik foyda — har bir SaleItem bo'yicha (priceAtSale - costAtSale) * packageCount
        BigDecimal profit = BigDecimal.ZERO;
        for (Sale sale : sales) {
            for (SaleItem item : sale.getItems()) {
                BigDecimal itemProfit = item.getPriceAtSale()
                        .subtract(item.getCostAtSale())
                        .multiply(BigDecimal.valueOf(item.getPackageCount()));
                profit = profit.add(itemProfit);
            }
        }
        response.setDailyProfit(profit);

        // 4) To'lov turi bo'yicha summalar (NAQD/KARTA/NASIYA)
        Map<PaymentType, BigDecimal> revenueByType = new EnumMap<>(PaymentType.class);
        for (PaymentType type : PaymentType.values()) {
            revenueByType.put(type, BigDecimal.ZERO);
        }
        for (Sale sale : sales) {
            BigDecimal current = revenueByType.get(sale.getPaymentType());
            revenueByType.put(sale.getPaymentType(), current.add(sale.getTotalAmount()));
        }
        response.setRevenueByType(revenueByType);

        // 5) Barcha do'konlarning umumiy joriy qarzi
        BigDecimal totalDebt = shopRepository.findAll().stream()
                .map(Shop::getCurrentDebt)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalDebtAllShops(totalDebt);

        return response;
    }
}