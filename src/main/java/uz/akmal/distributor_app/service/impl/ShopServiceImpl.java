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
import uz.akmal.distributor_app.entity.Payment;
import uz.akmal.distributor_app.repository.PaymentRepository;
import java.time.Duration;
import java.util.ArrayList;


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
    public ShopLedgerResponse getLedger(Long shopId) {
        Shop shop = findEntityById(shopId);

        List<LedgerEntryResponse> entries = new ArrayList<>();

        // Sotuvlarni qo'shamiz
        for (Sale sale : saleRepository.findByShopId(shopId)) {
            LedgerEntryResponse entry = new LedgerEntryResponse();
            entry.setDate(sale.getDate());
            entry.setType("SOTUV");

            String description = sale.getItems().stream()
                    .map(item -> item.getPackageCount() + "x " + item.getProduct().getName())
                    .collect(Collectors.joining(", "));
            entry.setDescription(description);

            entry.setAmount(sale.getTotalAmount());
            entries.add(entry);
        }

        // To'lovlarni qo'shamiz
        for (Payment payment : paymentRepository.findByShopId(shopId)) {
            LedgerEntryResponse entry = new LedgerEntryResponse();
            entry.setDate(payment.getDate());
            entry.setType("TOLOV");
            entry.setDescription(payment.getMethod().toString());
            entry.setAmount(payment.getAmount());
            entries.add(entry);
        }

        // Sana bo'yicha tartiblaymiz (eskisidan yangisiga)
        entries.sort(Comparator.comparing(LedgerEntryResponse::getDate));

        // Har bir amaldan keyingi qoldiq qarzni hisoblaymiz
        BigDecimal runningBalance = BigDecimal.ZERO;
        for (LedgerEntryResponse entry : entries) {
            if (entry.getType().equals("SOTUV")) {
                runningBalance = runningBalance.add(entry.getAmount());
            } else {
                runningBalance = runningBalance.subtract(entry.getAmount());
            }
            entry.setBalanceAfter(runningBalance);
        }

        ShopLedgerResponse response = new ShopLedgerResponse();
        response.setShopId(shop.getId());
        response.setShopName(shop.getName());
        response.setCurrentDebt(shop.getCurrentDebt());
        response.setEntries(entries);

        return response;
    }


    @Override
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
    public ShopResponse update(Long id, ShopRequest request) {
        Shop existing = findEntityById(id);
        existing.setName(request.getName());
        existing.setOwnerName(request.getOwnerName());
        existing.setPhone(request.getPhone());
        existing.setMarketGroup(findMarketGroup(request.getMarketGroupId()));
        return ShopMapper.toResponse(shopRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Shop existing = findEntityById(id);
        existing.setIsDeleted(true);
        shopRepository.save(existing);
    }

    @Override
    public BigDecimal getDebt(Long shopId) {
        return findEntityById(shopId).getCurrentDebt();
    }

    private Shop findEntityById(Long id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi, id: " + id));
    }

    private MarketGroup findMarketGroup(Long id) {
        return marketGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi, id: " + id));
    }


    @Override
    public List<OverdueShopResponse> getOverdueShops(int thresholdDays) {
        List<Shop> debtorShops = shopRepository.findAll().stream()
                .filter(s -> s.getCurrentDebt() != null && s.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        LocalDateTime now = LocalDateTime.now();
        List<OverdueShopResponse> result = new ArrayList<>();

        for (Shop shop : debtorShops) {
            List<Payment> payments = paymentRepository.findByShopId(shop.getId());

            LocalDateTime lastPaymentDate = payments.stream()
                    .map(Payment::getDate)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            LocalDateTime lastSaleDate = saleRepository.findByShopId(shop.getId()).stream()
                    .map(Sale::getDate)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            LocalDateTime referenceDate = (lastPaymentDate != null) ? lastPaymentDate : lastSaleDate;
            if (referenceDate == null) {
                continue; // sotuv ham, to'lov ham yo'q — o'tkazib yuboramiz
            }

            long daysSince = Duration.between(referenceDate, now).toDays();

            if (daysSince >= thresholdDays) {
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