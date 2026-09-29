package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.ShopMapper;
import uz.akmal.distributor_app.dto.ShopRequest;
import uz.akmal.distributor_app.dto.ShopResponse;
import uz.akmal.distributor_app.entity.MarketGroup;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.MarketGroupRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.ShopService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.distributor_app.dto.LedgerEntryResponse;
import uz.akmal.distributor_app.dto.ShopLedgerResponse;
import uz.akmal.distributor_app.entity.Sale;
import uz.akmal.distributor_app.entity.Payment;
import uz.akmal.distributor_app.repository.SaleRepository;
import uz.akmal.distributor_app.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;
import uz.akmal.distributor_app.dto.OverdueShopResponse;
import java.time.Duration;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ShopServiceImpl implements ShopService {

    private final ShopRepository shopRepository;
    private final MarketGroupRepository marketGroupRepository;
    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;

    public ShopServiceImpl(ShopRepository shopRepository,
                           MarketGroupRepository marketGroupRepository,
                           SaleRepository saleRepository,
                           PaymentRepository paymentRepository) {
        this.shopRepository = shopRepository;
        this.marketGroupRepository = marketGroupRepository;
        this.saleRepository = saleRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ShopLedgerResponse getLedger(Long shopId) {
        Shop shop = findEntityById(shopId);

        List<LedgerEntryResponse> entries = new ArrayList<>();
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalPayments = BigDecimal.ZERO;

        // Sotuvlarni qo'shamiz (JOIN FETCH orqali bitta tezkor so'rovda)
        for (Sale sale : saleRepository.findByShopId(shopId)) {
            LedgerEntryResponse entry = new LedgerEntryResponse();
            entry.setId(sale.getId());
            entry.setDate(sale.getDate());
            entry.setType("SOTUV");
            entry.setIsCancelled(Boolean.TRUE.equals(sale.getIsCancelled()));
            entry.setCancelReason(sale.getCancelReason());
            entry.setCancelledAt(sale.getCancelledAt());
            entry.setCancelledBy(sale.getCancelledBy());

            String description = sale.getItems().stream()
                    .map(item -> item.getPackageCount() + "x " + item.getEffectiveProductName())
                    .collect(Collectors.joining(", "));
            entry.setDescription(description);

            entry.setAmount(sale.getTotalAmount());
            entry.setInitialPaidAmount(sale.getInitialPaidAmount());
            entry.setPaymentMethod(sale.getPaymentType() != null ? sale.getPaymentType().toString() : "");
            entry.setCreatedBy(sale.getCreatedBy() != null && !sale.getCreatedBy().trim().isEmpty() ? sale.getCreatedBy() : "admin");

            List<LedgerEntryResponse.SaleItemDetailDto> itemDetails = sale.getItems().stream().map(item -> {
                LedgerEntryResponse.SaleItemDetailDto d = new LedgerEntryResponse.SaleItemDetailDto();
                d.setProductName(item.getEffectiveProductName());
                d.setPackageCount(item.getPackageCount());
                d.setPrice(item.getPriceAtSale());
                d.setTotal(item.getPriceAtSale() != null ? item.getPriceAtSale().multiply(BigDecimal.valueOf(item.getPackageCount())) : BigDecimal.ZERO);
                return d;
            }).toList();
            entry.setItems(itemDetails);

            if (!Boolean.TRUE.equals(sale.getIsCancelled())) {
                totalSales = totalSales.add(sale.getTotalAmount());
            }
            entries.add(entry);
        }

        // To'lovlarni qo'shamiz
        for (Payment payment : paymentRepository.findByShopId(shopId)) {
            LedgerEntryResponse entry = new LedgerEntryResponse();
            entry.setId(payment.getId());
            entry.setDate(payment.getDate());
            entry.setType("TOLOV");
            entry.setIsCancelled(Boolean.TRUE.equals(payment.getIsCancelled()));
            entry.setCancelReason(payment.getCancelReason());
            entry.setCancelledAt(payment.getCancelledAt());
            entry.setCancelledBy(payment.getCancelledBy());
            entry.setDescription(payment.getMethod().toString());
            entry.setAmount(payment.getAmount());
            entry.setPaymentMethod(payment.getMethod().toString());
            entry.setCreatedBy(payment.getCreatedBy() != null && !payment.getCreatedBy().trim().isEmpty() ? payment.getCreatedBy() : "admin");

            if (!Boolean.TRUE.equals(payment.getIsCancelled())) {
                totalPayments = totalPayments.add(payment.getAmount());
            }
            entries.add(entry);
        }

        // Sana bo'yicha tartiblaymiz (eskisidan yangisiga)
        entries.sort(Comparator.comparing(LedgerEntryResponse::getDate));

        // Har bir amaldan keyingi qoldiq qarzni hisoblaymiz (bekor qilinganlar balansga ta'sir qilmaydi)
        BigDecimal runningBalance = BigDecimal.ZERO;
        for (LedgerEntryResponse entry : entries) {
            if (!Boolean.TRUE.equals(entry.getIsCancelled())) {
                if (entry.getType().equals("SOTUV")) {
                    runningBalance = runningBalance.add(entry.getAmount());
                } else {
                    runningBalance = runningBalance.subtract(entry.getAmount());
                }
            }
            entry.setBalanceAfter(runningBalance);
        }

        ShopLedgerResponse response = new ShopLedgerResponse();
        response.setShopId(shop.getId());
        response.setShopName(shop.getName());
        response.setOwnerName(shop.getOwnerName());
        response.setPhone(shop.getPhone());
        response.setMarketGroupName(shop.getMarketGroup() != null ? shop.getMarketGroup().getName() : "");
        response.setCurrentDebt(shop.getCurrentDebt());
        response.setTotalSalesAmount(totalSales);
        response.setTotalPaymentsAmount(totalPayments);
        response.setEntries(entries);

        return response;
    }


    @Override
    @Transactional
    public ShopResponse create(ShopRequest request) {
        MarketGroup marketGroup = findMarketGroup(request.getMarketGroupId());
        Shop shop = ShopMapper.toEntity(request, marketGroup);
        return ShopMapper.toResponse(shopRepository.save(shop));
    }

    @Override
    public List<ShopResponse> getAll() {
        return shopRepository.findByIsDeletedFalse().stream()
                .map(ShopMapper::toResponse)
                .toList();
    }

    @Override
    public List<ShopResponse> getByMarketGroup(Long marketGroupId) {
        return shopRepository.findByMarketGroupIdAndIsDeletedFalse(marketGroupId).stream()
                .map(ShopMapper::toResponse)
                .toList();
    }

    @Override
    public ShopResponse getById(Long id) {
        return ShopMapper.toResponse(findEntityById(id));
    }

    @Override
    @Transactional
    public ShopResponse update(Long id, ShopRequest request) {
        Shop existing = shopRepository.findByIdWithLock(id)
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi yoki o'chirilgan, id: " + id));
        existing.setName(request.getName());
        existing.setOwnerName(request.getOwnerName());
        existing.setPhone(request.getPhone());
        existing.setMarketGroup(findMarketGroup(request.getMarketGroupId()));
        return ShopMapper.toResponse(shopRepository.save(existing));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Shop existing = shopRepository.findByIdWithLock(id)
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi yoki o'chirilgan, id: " + id));

        if (existing.getCurrentDebt() != null && existing.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0) {
            String debtStr = String.format("%,.0f", existing.getCurrentDebt().doubleValue()).replace(',', ' ');
            throw new IllegalStateException("Ushbu do'konda " + debtStr + " so'm qarz mavjud! Do'konni o'chirishdan oldin qarzni to'liq yopish kerak.");
        }

        if (existing.getCurrentDebt() != null && existing.getCurrentDebt().compareTo(BigDecimal.ZERO) < 0) {
            String avansStr = String.format("%,.0f", existing.getCurrentDebt().abs().doubleValue()).replace(',', ' ');
            throw new IllegalStateException("Ushbu do'konda " + avansStr + " so'm ortiqcha to'lov (avans) mavjud! Avval hisob-kitobni yakunlang.");
        }

        existing.setIsDeleted(true);
        shopRepository.save(existing);
    }

    @Override
    public BigDecimal getDebt(Long shopId) {
        return findEntityById(shopId).getCurrentDebt();
    }

    private Shop findEntityById(Long id) {
        return shopRepository.findById(id)
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi yoki o'chirilgan, id: " + id));
    }

    private MarketGroup findMarketGroup(Long id) {
        return marketGroupRepository.findByIdWithLock(id)
                .filter(mg -> !Boolean.TRUE.equals(mg.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi yoki o'chirilgan, id: " + id));
    }


    @Override
    public List<OverdueShopResponse> getOverdueShops(int thresholdDays) {
        final int effectiveThreshold = Math.max(0, thresholdDays);
        List<Shop> debtorShops = shopRepository.findByIsDeletedFalse().stream()
                .filter(s -> s.getCurrentDebt() != null && s.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        LocalDateTime now = LocalDateTime.now();
        List<OverdueShopResponse> result = new ArrayList<>();

        for (Shop shop : debtorShops) {
            LocalDateTime lastPaymentDate = paymentRepository.findLastActivePaymentDateByShopId(shop.getId());
            LocalDateTime lastSaleDate = saleRepository.findLastActiveSaleDateByShopId(shop.getId());

            LocalDateTime referenceDate = (lastPaymentDate != null) ? lastPaymentDate : lastSaleDate;
            if (referenceDate == null) {
                continue; // faol sotuv ham, to'lov ham yo'q — o'tkazib yuboramiz
            }

            long daysSince = Duration.between(referenceDate, now).toDays();

            if (daysSince >= effectiveThreshold) {
                OverdueShopResponse r = new OverdueShopResponse();
                r.setShopId(shop.getId());
                r.setShopName(shop.getName());
                r.setCurrentDebt(shop.getCurrentDebt());
                r.setDaysSinceLastPayment((int) daysSince);
                r.setLastPaymentDate(lastPaymentDate);
                result.add(r);
            }
        }

        result.sort((a, b) -> b.getDaysSinceLastPayment() - a.getDaysSinceLastPayment());
        return result;
    }



}