package uz.akmal.distributor_app.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.distributor_app.dto.*;
import uz.akmal.distributor_app.entity.Supplier;
import uz.akmal.distributor_app.entity.SupplyPurchase;
import uz.akmal.distributor_app.entity.SupplyPayment;
import uz.akmal.distributor_app.exception.InvalidPaymentException;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.SupplierRepository;
import uz.akmal.distributor_app.repository.SupplyPurchaseRepository;
import uz.akmal.distributor_app.repository.SupplyPaymentRepository;
import uz.akmal.distributor_app.service.SupplierService;
import uz.akmal.distributor_app.util.SecurityUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplyPurchaseRepository purchaseRepository;
    private final SupplyPaymentRepository paymentRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository,
                               SupplyPurchaseRepository purchaseRepository,
                               SupplyPaymentRepository paymentRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getSuppliers(String category) {
        List<Supplier> list;
        if (category != null && !category.trim().isEmpty()) {
            list = supplierRepository.findByCategoryAndActiveTrueOrderByNameAsc(category.trim().toUpperCase());
        } else {
            list = supplierRepository.findByActiveTrueOrderByNameAsc();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .filter(Supplier::getActive)
                .orElseThrow(() -> new ResourceNotFoundException("Ta'minotchi / birja topilmadi"));
        return mapToResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.getName().trim());
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        String category = (request.getCategory() != null && !request.getCategory().trim().isEmpty()) 
                ? request.getCategory().trim().toUpperCase() : "SHAKAR";
        if (!"SHAKAR".equals(category) && !"YOG".equals(category)) {
            throw new InvalidPaymentException("Ta'minotchi kategoriyasi faqat SHAKAR yoki YOG bo'lishi shart!");
        }
        supplier.setCategory(category);
        supplier.setCurrentDebt(BigDecimal.ZERO);
        supplier.setActive(true);
        Supplier saved = supplierRepository.save(supplier);
        log.info("Yangi ta'minotchi yaratildi: {} (ID: {})", saved.getName(), saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .filter(Supplier::getActive)
                .orElseThrow(() -> new ResourceNotFoundException("Ta'minotchi / birja topilmadi"));
        supplier.setName(request.getName().trim());
        if (request.getPhone() != null) {
            supplier.setPhone(request.getPhone().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            String newCat = request.getCategory().trim().toUpperCase();
            if (!"SHAKAR".equals(newCat) && !"YOG".equals(newCat)) {
                throw new InvalidPaymentException("Ta'minotchi kategoriyasi faqat SHAKAR yoki YOG bo'lishi shart!");
            }
            if (!newCat.equalsIgnoreCase(supplier.getCategory())) {
                boolean hasDebt = supplier.getCurrentDebt() != null && supplier.getCurrentDebt().compareTo(BigDecimal.ZERO) != 0;
                boolean hasPurchases = purchaseRepository.existsBySupplierId(id);
                boolean hasPayments = paymentRepository.existsBySupplierId(id);
                if (hasDebt || hasPurchases || hasPayments) {
                    throw new InvalidPaymentException("Ta'minotchi kategoriyasini (" + supplier.getCategory() + " -> " + newCat + ") o'zgartirib bo'lmaydi! Chunki ushbu ta'minotchida avvalgi kirimlar, to'lovlar yoki qarz mavjud.");
                }
                supplier.setCategory(newCat);
            }
        }
        Supplier updated = supplierRepository.save(supplier);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ta'minotchi topilmadi"));
        
        if (supplier.getCurrentDebt() != null && supplier.getCurrentDebt().compareTo(BigDecimal.ZERO) > 0) {
            String debtStr = "YOG".equalsIgnoreCase(supplier.getCategory())
                    ? "$" + supplier.getCurrentDebt()
                    : supplier.getCurrentDebt() + " so'm";
            throw new InvalidPaymentException("Ushbu ta'minotchida " + debtStr + " qarz mavjud! Avval hisob-kitobni to'liq yoping.");
        }

        supplier.setActive(false);
        supplierRepository.save(supplier);
        log.info("Ta'minotchi o'chirildi (arxivlandi): {} (ID: {})", supplier.getName(), supplier.getId());
    }

    @Override
    @Transactional
    public SupplyPurchase addPurchase(Long supplierId, SupplyPurchaseRequest request) {
        Supplier supplier = supplierRepository.findByIdWithLock(supplierId)
                .filter(Supplier::getActive)
                .orElseThrow(() -> new ResourceNotFoundException("Ta'minotchi topilmadi"));

        LocalDateTime purchaseDateTime = parseDateTime(request.getPurchaseDate());
        if (purchaseDateTime.toLocalDate().isAfter(LocalDate.now())) {
            throw new InvalidPaymentException("Kirim sanasi kelajak sanada bo'lishi mumkin emas!");
        }

        BigDecimal totalAmount;
        BigDecimal finalQuantity = request.getQuantity();
        BigDecimal finalUnitPrice = request.getUnitPrice();
        BigDecimal finalTotalLiters = request.getTotalLiters();
        String finalUnit = request.getUnit() != null ? request.getUnit().trim().toUpperCase() : "QOP";

        boolean isOilSupplier = "YOG".equalsIgnoreCase(supplier.getCategory());
        boolean hasBoxDetails = request.getBoxesCount() != null || request.getPricePerLiter() != null;

        if (isOilSupplier || hasBoxDetails) {
            if (request.getBoxesCount() == null || request.getBoxesCount() <= 0) {
                throw new InvalidPaymentException("Karobkalar soni 0 dan katta bo'lishi kerak!");
            }
            if (request.getItemsPerBox() == null || request.getItemsPerBox() <= 0) {
                throw new InvalidPaymentException("Karobka ichidagi dona soni 0 dan katta bo'lishi kerak!");
            }
            if (request.getLitersPerItem() == null || request.getLitersPerItem().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidPaymentException("1 dona idish hajmi (litr) 0 dan katta bo'lishi kerak!");
            }
            if (request.getPricePerLiter() == null || request.getPricePerLiter().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidPaymentException("1 litr narxi ($) 0 dan katta bo'lishi kerak!");
            }

            BigDecimal boxLiters = request.getLitersPerItem().multiply(BigDecimal.valueOf(request.getItemsPerBox()));
            finalTotalLiters = boxLiters.multiply(BigDecimal.valueOf(request.getBoxesCount())).setScale(2, RoundingMode.HALF_UP);
            totalAmount = finalTotalLiters.multiply(request.getPricePerLiter()).setScale(2, RoundingMode.HALF_UP);
            finalQuantity = BigDecimal.valueOf(request.getBoxesCount());
            finalUnitPrice = request.getPricePerLiter();
            finalUnit = "KAROPKA";
        } else {
            if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidPaymentException("Miqdori 0 dan katta bo'lishi kerak!");
            }
            if (request.getUnitPrice() == null || request.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidPaymentException("Birlik narxi 0 dan katta bo'lishi kerak!");
            }
            totalAmount = request.getQuantity().multiply(request.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
        }

        SupplyPurchase purchase = new SupplyPurchase();
        purchase.setSupplier(supplier);
        purchase.setCategory(supplier.getCategory());
        purchase.setProductName(request.getProductName().trim());
        purchase.setUnit(finalUnit);
        purchase.setQuantity(finalQuantity);
        purchase.setUnitPrice(finalUnitPrice);
        purchase.setTotalAmount(totalAmount);
        purchase.setPurchaseDate(purchaseDateTime);
        purchase.setNote(request.getNote() != null ? request.getNote().trim() : null);
        purchase.setLitersPerItem(request.getLitersPerItem());
        purchase.setItemsPerBox(request.getItemsPerBox());
        purchase.setBoxesCount(request.getBoxesCount());
        purchase.setPricePerLiter(request.getPricePerLiter());
        purchase.setTotalLiters(finalTotalLiters);
        purchase.setIsCancelled(false);

        // Qarzni ko'paytiramiz (Bizning qarzimiz)
        BigDecimal currentDebt = supplier.getCurrentDebt() != null ? supplier.getCurrentDebt() : BigDecimal.ZERO;
        supplier.setCurrentDebt(currentDebt.add(totalAmount));
        supplierRepository.save(supplier);

        SupplyPurchase saved = purchaseRepository.save(purchase);
        log.info("Ta'minotchi kirimi saqlandi: SupplierID={}, Total={}, Unit={}", supplierId, totalAmount, finalUnit);
        return saved;
    }

    @Override
    @Transactional
    public SupplyPayment addPayment(Long supplierId, SupplyPaymentRequest request) {
        Supplier supplier = supplierRepository.findByIdWithLock(supplierId)
                .filter(Supplier::getActive)
                .orElseThrow(() -> new ResourceNotFoundException("Ta'minotchi topilmadi"));

        LocalDateTime paymentDateTime = parseDateTime(request.getPaymentDate());
        if (paymentDateTime.toLocalDate().isAfter(LocalDate.now())) {
            throw new InvalidPaymentException("To'lov sanasi kelajak sanada bo'lishi mumkin emas!");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidPaymentException("To'lov summasi 0 dan katta bo'lishi kerak!");
        }

        BigDecimal currentDebt = supplier.getCurrentDebt() != null ? supplier.getCurrentDebt() : BigDecimal.ZERO;
        if (currentDebt.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidPaymentException("Ta'minotchida qarzdorlik yo'q! To'lov qabul qilinmaydi.");
        }

        if (request.getAmount().compareTo(currentDebt) > 0) {
            throw new InvalidPaymentException("To'lov summasi joriy qarzdorlikdan (" + currentDebt + ") ortiq bo'lishi mumkin emas!");
        }

        String method = (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty())
                ? request.getPaymentMethod().trim().toUpperCase() : "NAQD";
        if (!"NAQD".equals(method) && !"KARTA".equals(method)) {
            throw new InvalidPaymentException("To'lov usuli faqat NAQD yoki KARTA bo'lishi shart! (Noto'g'ri tur: " + method + ")");
        }

        SupplyPayment payment = new SupplyPayment();
        payment.setSupplier(supplier);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(method);
        payment.setPaymentDate(paymentDateTime);
        payment.setNote(request.getNote() != null ? request.getNote().trim() : null);
        payment.setIsCancelled(false);

        // Qarzni kamaytiramiz
        supplier.setCurrentDebt(currentDebt.subtract(request.getAmount()));
        supplierRepository.save(supplier);

        SupplyPayment saved = paymentRepository.save(payment);
        log.info("Ta'minotchi to'lovi saqlandi: SupplierID={}, Amount={}", supplierId, request.getAmount());
        return saved;
    }

    @Override
    @Transactional
    public void cancelEntry(Long supplierId, String type, Long entryId, String reason) {
        Supplier supplier = supplierRepository.findByIdWithLock(supplierId)
                .filter(Supplier::getActive)
                .orElseThrow(() -> new ResourceNotFoundException("Ta'minotchi topilmadi"));

        String currentUser = SecurityUtils.getCurrentUsername();
        String cancelReasonText = reason != null && !reason.trim().isEmpty() ? reason.trim() : "Xato kiritilgan";

        if ("KIRIM".equalsIgnoreCase(type)) {
            SupplyPurchase purchase = purchaseRepository.findById(entryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kirim topilmadi"));
            if (Boolean.TRUE.equals(purchase.getIsCancelled())) {
                return;
            }
            if (!purchase.getSupplier().getId().equals(supplierId)) {
                throw new InvalidPaymentException("Kirim ushbu ta'minotchiga tegishli emas");
            }

            BigDecimal currentDebt = supplier.getCurrentDebt() != null ? supplier.getCurrentDebt() : BigDecimal.ZERO;
            if (currentDebt.compareTo(purchase.getTotalAmount()) < 0) {
                throw new InvalidPaymentException("Ushbu kirim bo'yicha to'lovlar amalga oshirilgan! Avval to'lovlarni bekor qiling.");
            }

            purchase.setIsCancelled(true);
            purchase.setCancelReason(cancelReasonText);
            purchase.setCancelledBy(currentUser);
            purchase.setCancelledAt(LocalDateTime.now());
            purchaseRepository.save(purchase);

            supplier.setCurrentDebt(currentDebt.subtract(purchase.getTotalAmount()));
            supplierRepository.save(supplier);
            log.info("Ta'minotchi kirimi bekor qilindi: PurchaseID={}", entryId);

        } else if ("TOLOV".equalsIgnoreCase(type)) {
            SupplyPayment payment = paymentRepository.findById(entryId)
                    .orElseThrow(() -> new ResourceNotFoundException("To'lov topilmadi"));
            if (Boolean.TRUE.equals(payment.getIsCancelled())) {
                return;
            }
            if (!payment.getSupplier().getId().equals(supplierId)) {
                throw new InvalidPaymentException("To'lov ushbu ta'minotchiga tegishli emas");
            }

            payment.setIsCancelled(true);
            payment.setCancelReason(cancelReasonText);
            payment.setCancelledBy(currentUser);
            payment.setCancelledAt(LocalDateTime.now());
            paymentRepository.save(payment);

            BigDecimal currentDebt = supplier.getCurrentDebt() != null ? supplier.getCurrentDebt() : BigDecimal.ZERO;
            supplier.setCurrentDebt(currentDebt.add(payment.getAmount()));
            supplierRepository.save(supplier);
            log.info("Ta'minotchi to'lovi bekor qilindi: PaymentID={}", entryId);
        } else {
            throw new IllegalArgumentException("Noma'lum amal turi: " + type);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierLedgerResponse getSupplierLedger(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .filter(Supplier::getActive)
                .orElseThrow(() -> new ResourceNotFoundException("Ta'minotchi topilmadi"));

        List<SupplyPurchase> purchases = purchaseRepository.findBySupplierIdOrderByPurchaseDateAsc(supplierId);
        List<SupplyPayment> payments = paymentRepository.findBySupplierIdOrderByPaymentDateAsc(supplierId);

        List<SupplierLedgerEntryResponse> entries = new ArrayList<>();

        for (SupplyPurchase p : purchases) {
            entries.add(SupplierLedgerEntryResponse.builder()
                    .id(p.getId())
                    .type("KIRIM")
                    .date(p.getPurchaseDate())
                    .productName(p.getProductName())
                    .unit(p.getUnit())
                    .quantity(p.getQuantity())
                    .unitPrice(p.getUnitPrice())
                    .amount(p.getTotalAmount())
                    .note(p.getNote())
                    .litersPerItem(p.getLitersPerItem())
                    .itemsPerBox(p.getItemsPerBox())
                    .boxesCount(p.getBoxesCount())
                    .pricePerLiter(p.getPricePerLiter())
                    .totalLiters(p.getTotalLiters())
                    .isCancelled(p.getIsCancelled())
                    .cancelReason(p.getCancelReason())
                    .cancelledBy(p.getCancelledBy())
                    .createdBy(p.getCreatedBy())
                    .build());
        }

        for (SupplyPayment p : payments) {
            entries.add(SupplierLedgerEntryResponse.builder()
                    .id(p.getId())
                    .type("TOLOV")
                    .date(p.getPaymentDate())
                    .amount(p.getAmount())
                    .paymentMethod(p.getPaymentMethod())
                    .note(p.getNote())
                    .isCancelled(p.getIsCancelled())
                    .cancelReason(p.getCancelReason())
                    .cancelledBy(p.getCancelledBy())
                    .createdBy(p.getCreatedBy())
                    .build());
        }

        // Xronologik tartibda saralash
        entries.sort(Comparator.comparing(SupplierLedgerEntryResponse::getDate));

        // Balansni hisoblash (running balance)
        BigDecimal runningBalance = BigDecimal.ZERO;
        BigDecimal totalPurchased = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;

        for (SupplierLedgerEntryResponse e : entries) {
            if (!Boolean.TRUE.equals(e.getIsCancelled())) {
                if ("KIRIM".equals(e.getType())) {
                    runningBalance = runningBalance.add(e.getAmount());
                    totalPurchased = totalPurchased.add(e.getAmount());
                } else if ("TOLOV".equals(e.getType())) {
                    runningBalance = runningBalance.subtract(e.getAmount());
                    totalPaid = totalPaid.add(e.getAmount());
                }
            }
            e.setBalanceAfter(runningBalance);
        }

        return SupplierLedgerResponse.builder()
                .supplierId(supplier.getId())
                .supplierName(supplier.getName())
                .phone(supplier.getPhone())
                .category(supplier.getCategory())
                .currentDebt(supplier.getCurrentDebt())
                .totalPurchasedAmount(totalPurchased)
                .totalPaidAmount(totalPaid)
                .entries(entries)
                .build();
    }

    private SupplierResponse mapToResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .phone(s.getPhone())
                .category(s.getCategory())
                .currentDebt(s.getCurrentDebt() != null ? s.getCurrentDebt() : BigDecimal.ZERO)
                .createdAt(s.getCreatedAt())
                .createdBy(s.getCreatedBy())
                .build();
    }

    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return LocalDateTime.now();
        }
        String clean = dateStr.trim();
        if (clean.length() == 10) {
            return LocalDate.parse(clean).atTime(LocalTime.now());
        }
        try {
            return LocalDateTime.parse(clean);
        } catch (Exception e) {
            return LocalDate.parse(clean.substring(0, 10)).atTime(LocalTime.now());
        }
    }
}
