package com.retail.management.service;

import com.retail.management.dto.*;
import com.retail.management.entity.*;
import com.retail.management.exception.ResourceNotFoundException;
import com.retail.management.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SaleItemRepository saleItemRepository;
    private final SaleRepository saleRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final RestClient restClient;

    @Value("${app.ai.service-url:${AI_SERVICE_URL:http://localhost:8000}}")
    private String aiServiceUrl;

    @Value("${app.ai.openai-key:${OPENAI_API_KEY:}}")
    private String openAiKey;

    public AiService(ProductRepository productRepository,
                      InventoryRepository inventoryRepository,
                      SaleItemRepository saleItemRepository,
                      SaleRepository saleRepository,
                      SupplierRepository supplierRepository,
                      PurchaseOrderRepository purchaseOrderRepository,
                      WarehouseRepository warehouseRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.saleItemRepository = saleItemRepository;
        this.saleRepository = saleRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.warehouseRepository = warehouseRepository;
        this.restClient = RestClient.builder().build();
    }

    /**
     * Module 1: AI Safety Stock & Replenishment Intelligence
     * Calculates operations research safety-stock replenishment recommendations
     * based on actual inventory balances, historical sales velocity, lead times, and safety stock.
     */
    public List<ReorderRecommendationDto> getReorderRecommendations() {
        List<Product> products = productRepository.findByIsActiveTrue();
        List<Supplier> suppliers = supplierRepository.findByIsActiveTrue();
        Supplier defaultSupplier = !suppliers.isEmpty() ? suppliers.get(0) : null;

        List<ReorderRecommendationDto> list = new ArrayList<>();
        LocalDateTime past30Days = LocalDateTime.now().minusDays(30);

        for (Product product : products) {
            List<Inventory> inventories = inventoryRepository.findByProductId(product.getId());
            if (inventories.isEmpty()) continue;

            // Historical sales in last 30 days
            List<SaleItem> recentSales = saleItemRepository.findSalesForProductSince(product.getId(), past30Days);
            int totalSold30d = recentSales.stream().mapToInt(SaleItem::getQuantity).sum();
            boolean hasSalesHistory = totalSold30d > 0;

            // Daily sales rate (units/day) or baseline demand from reorder level
            double avgDailyDemand = hasSalesHistory 
                    ? (totalSold30d / 30.0) 
                    : Math.max(0.5, (product.getReorderLevel() != null ? product.getReorderLevel() : 10) / 10.0);

            int leadTimeDays = defaultSupplier != null && defaultSupplier.getLeadTimeDays() != null 
                    ? defaultSupplier.getLeadTimeDays() : 3;
            double leadTimeDemand = avgDailyDemand * leadTimeDays;
            int safetyStock = product.getSafetyStock() != null ? product.getSafetyStock() : 5;
            double reorderPoint = leadTimeDemand + safetyStock;

            for (Inventory inv : inventories) {
                int currentStock = inv.getQuantity() != null ? inv.getQuantity() : 0;
                int reserved = inv.getReservedQuantity() != null ? inv.getReservedQuantity() : 0;
                int availableStock = Math.max(0, currentStock - reserved);

                String urgency;
                int recommendedOrderQty;

                if (availableStock <= safetyStock) {
                    urgency = "CRITICAL";
                    // Bring stock to reorder point + 7-day operational cycle buffer
                    int baseNeed = (int) Math.ceil(reorderPoint - availableStock + (avgDailyDemand * 7));
                    recommendedOrderQty = Math.max(product.getReorderLevel() != null ? product.getReorderLevel() : 10, baseNeed);
                } else if (availableStock <= reorderPoint) {
                    urgency = "MEDIUM";
                    int baseNeed = (int) Math.ceil(reorderPoint - availableStock + (avgDailyDemand * 7));
                    recommendedOrderQty = Math.max(product.getReorderLevel() != null ? product.getReorderLevel() : 10, baseNeed);
                } else {
                    urgency = "NORMAL";
                    recommendedOrderQty = 0;
                }

                ReorderRecommendationDto rec = new ReorderRecommendationDto();
                rec.setProductId(product.getId());
                rec.setProductSku(product.getSku());
                rec.setProductName(product.getName());
                rec.setWarehouseId(inv.getWarehouse().getId());
                rec.setWarehouseName(inv.getWarehouse().getName());
                rec.setCurrentStock(currentStock);
                rec.setReservedStock(reserved);
                rec.setAvailableStock(availableStock);
                rec.setAvgDailyDemand(Math.round(avgDailyDemand * 100.0) / 100.0);
                rec.setLeadTimeDays(leadTimeDays);
                rec.setLeadTimeDemand(Math.round(leadTimeDemand * 100.0) / 100.0);
                rec.setSafetyStock(safetyStock);
                rec.setReorderPoint(Math.round(reorderPoint * 100.0) / 100.0);
                rec.setRecommendedOrderQty(recommendedOrderQty);
                if (defaultSupplier != null) {
                    rec.setSuggestedSupplierId(defaultSupplier.getId());
                    rec.setSuggestedSupplierName(defaultSupplier.getName());
                }
                rec.setUrgency(urgency);
                rec.setFormulaExplanation(String.format("Demand: %.2f u/day%s × Lead Time: %dd + Safety Buffer: %d = Reorder Point: %.1f",
                        avgDailyDemand, hasSalesHistory ? " (30d actual)" : " (baseline)", leadTimeDays, safetyStock, reorderPoint));

                list.add(rec);
            }
        }

        // Sort: CRITICAL first, then MEDIUM, then NORMAL, and by quantity needed descending
        list.sort((a, b) -> {
            int scoreA = "CRITICAL".equals(a.getUrgency()) ? 2 : ("MEDIUM".equals(a.getUrgency()) ? 1 : 0);
            int scoreB = "CRITICAL".equals(b.getUrgency()) ? 2 : ("MEDIUM".equals(b.getUrgency()) ? 1 : 0);
            if (scoreA != scoreB) return Integer.compare(scoreB, scoreA);
            return Integer.compare(b.getRecommendedOrderQty(), a.getRecommendedOrderQty());
        });

        return list;
    }

    /**
     * Module 2: AI Retail Intelligence Copilot
     * Processes natural language retail queries grounded directly in live SQL database records.
     */
    public AiChatResponseDto processNaturalLanguageQuery(AiChatRequestDto request) {
        String q = (request.getQuestion() != null ? request.getQuestion() : request.getQuery() != null ? request.getQuery() : "").toLowerCase().trim();
        Map<String, Object> metrics = new HashMap<>();
        String answer;
        String intent;

        // 1. Lowest Stock Products
        if (q.contains("lowest stock") || q.contains("lowest") || (q.contains("low stock") && !q.contains("reorder"))) {
            intent = "LOWEST_STOCK_INQUIRY";
            List<Inventory> allInv = inventoryRepository.findAll();
            // Sort by available stock ASC
            allInv.sort(Comparator.comparingInt(i -> (i.getQuantity() != null ? i.getQuantity() : 0) - (i.getReservedQuantity() != null ? i.getReservedQuantity() : 0)));
            List<Map<String, Object>> lowestItems = new ArrayList<>();
            for (int i = 0; i < Math.min(allInv.size(), 5); i++) {
                Inventory inv = allInv.get(i);
                if (inv.getProduct() != null && Boolean.TRUE.equals(inv.getProduct().getIsActive())) {
                    int avail = (inv.getQuantity() != null ? inv.getQuantity() : 0) - (inv.getReservedQuantity() != null ? inv.getReservedQuantity() : 0);
                    lowestItems.add(Map.of(
                            "productName", inv.getProduct().getName(),
                            "sku", inv.getProduct().getSku(),
                            "warehouse", inv.getWarehouse().getName(),
                            "availableQuantity", avail,
                            "reorderLevel", inv.getProduct().getReorderLevel()
                    ));
                }
            }
            metrics.put("lowestStockItems", lowestItems);
            metrics.put("evaluatedRecords", allInv.size());

            String itemsSummary = lowestItems.stream()
                    .map(item -> item.get("productName") + " (" + item.get("availableQuantity") + " units in " + item.get("warehouse") + ")")
                    .collect(Collectors.joining("; "));

            answer = String.format("The products with the lowest current inventory are: %s. Review replenishment needs to prevent stockouts.", itemsSummary);

        // 2. Top-Selling Products by Quantity / Revenue
        } else if (q.contains("top") || q.contains("best selling") || q.contains("top-selling") || q.contains("popular") || (q.contains("selling") && q.contains("product"))) {
            intent = "TOP_SELLING_INQUIRY";
            List<Object[]> top = saleItemRepository.getTopSellingProducts();
            List<Map<String, Object>> topSellers = new ArrayList<>();
            List<String> topList = new ArrayList<>();

            for (int i = 0; i < Math.min(top.size(), 5); i++) {
                Object[] r = top.get(i);
                topSellers.add(Map.of(
                        "productId", r[0],
                        "productName", r[1],
                        "quantitySold", r[2],
                        "revenue", r[3]
                ));
                topList.add(r[1] + " (" + r[2] + " units sold, ₹" + r[3] + ")");
            }
            metrics.put("topSellers", topSellers);

            if (topList.isEmpty()) {
                answer = "No product sales records were found in the current period.";
            } else {
                answer = "Top-performing products ranked by sales quantity: " + String.join(", ", topList) + ".";
            }

        // 3. Sales Revenue Today & Totals
        } else if (q.contains("today") || (q.contains("revenue") && !q.contains("valuation")) || (q.contains("sales") && !q.contains("product"))) {
            intent = "SALES_REVENUE_INQUIRY";
            LocalDateTime startToday = LocalDateTime.of(LocalDate.now(), java.time.LocalTime.MIN);
            BigDecimal todayRev = saleRepository.getRevenueSince(startToday);
            Long todayCount = saleRepository.countSalesSince(startToday);
            BigDecimal totalRev = saleRepository.getTotalSalesRevenue();

            if (todayRev == null) todayRev = BigDecimal.ZERO;
            if (todayCount == null) todayCount = 0L;
            if (totalRev == null) totalRev = BigDecimal.ZERO;

            metrics.put("todayRevenue", todayRev);
            metrics.put("todayTransactionCount", todayCount);
            metrics.put("allTimeRevenue", totalRev);

            if (todayCount > 0) {
                answer = String.format("Today's sales revenue is ₹%.2f across %d completed transaction(s). Total cumulative revenue is ₹%.2f.",
                        todayRev, todayCount, totalRev);
            } else {
                answer = String.format("Today has 0 completed transactions recorded (₹0.00). Total cumulative revenue across all past sessions is ₹%.2f.", totalRev);
            }

        // 4. Pending Purchase Orders
        } else if (q.contains("purchase order") || q.contains("pending receipt") || q.contains("po") || q.contains("supplier order")) {
            intent = "PENDING_PURCHASE_ORDERS_INQUIRY";
            List<PurchaseOrder> allPos = purchaseOrderRepository.findAll();
            List<PurchaseOrder> pendingPos = allPos.stream()
                    .filter(po -> "APPROVED".equalsIgnoreCase(po.getStatus()) || "DRAFT".equalsIgnoreCase(po.getStatus()) || "PARTIALLY_RECEIVED".equalsIgnoreCase(po.getStatus()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> poList = new ArrayList<>();
            for (PurchaseOrder po : pendingPos) {
                poList.add(Map.of(
                        "poNumber", po.getPoNumber(),
                        "supplier", po.getSupplier() != null ? po.getSupplier().getName() : "Unknown",
                        "status", po.getStatus(),
                        "expectedDate", po.getApprovedAt() != null ? po.getApprovedAt().toLocalDate().toString() : po.getCreatedAt().toLocalDate().toString(),
                        "totalAmount", po.getTotalAmount() != null ? po.getTotalAmount() : BigDecimal.ZERO
                ));
            }

            metrics.put("pendingPoCount", pendingPos.size());
            metrics.put("pendingPurchaseOrders", poList);

            if (pendingPos.isEmpty()) {
                answer = "There are currently no purchase orders awaiting receipt. All issued procurement orders are fully received or closed.";
            } else {
                String poSummary = pendingPos.stream()
                        .map(po -> po.getPoNumber() + " [" + po.getStatus() + "] from " + (po.getSupplier() != null ? po.getSupplier().getName() : "Supplier") + " (₹" + po.getTotalAmount() + ")")
                        .limit(4)
                        .collect(Collectors.joining("; "));
                answer = String.format("Found %d pending purchase order(s): %s.", pendingPos.size(), poSummary);
            }

        // 5. Inventory Valuation by Warehouse
        } else if (q.contains("valuation") || q.contains("warehouse value") || q.contains("inventory value")) {
            intent = "VALUATION_BY_WAREHOUSE_INQUIRY";
            List<Inventory> allInv = inventoryRepository.findAll();
            Map<String, BigDecimal> valByWh = new HashMap<>();
            Map<String, Integer> unitsByWh = new HashMap<>();
            BigDecimal grandTotal = BigDecimal.ZERO;
            int totalUnits = 0;

            for (Inventory inv : allInv) {
                if (inv.getProduct() != null && inv.getWarehouse() != null) {
                    String whName = inv.getWarehouse().getName();
                    int qty = inv.getQuantity() != null ? inv.getQuantity() : 0;
                    BigDecimal val = inv.getProduct().getCostPrice().multiply(BigDecimal.valueOf(qty));

                    valByWh.put(whName, valByWh.getOrDefault(whName, BigDecimal.ZERO).add(val));
                    unitsByWh.put(whName, unitsByWh.getOrDefault(whName, 0) + qty);
                    grandTotal = grandTotal.add(val);
                    totalUnits += qty;
                }
            }

            metrics.put("valuationByWarehouse", valByWh);
            metrics.put("unitsByWarehouse", unitsByWh);
            metrics.put("totalInventoryCostValuation", grandTotal);
            metrics.put("totalPhysicalUnits", totalUnits);

            List<String> whSummaries = new ArrayList<>();
            valByWh.forEach((wh, val) -> {
                whSummaries.add(String.format("%s: ₹%.2f (%d units)", wh, val, unitsByWh.getOrDefault(wh, 0)));
            });

            answer = String.format("Total inventory valuation on cost basis is ₹%.2f across %d physical units. Facility breakdown: %s.",
                    grandTotal, totalUnits, String.join("; ", whSummaries));

        // 6. Products to Reorder / Replenishment
        } else if (q.contains("reorder") || q.contains("replenish") || q.contains("shortage") || q.contains("safety stock")) {
            intent = "REORDER_RECOMMENDATIONS_INQUIRY";
            List<ReorderRecommendationDto> recs = getReorderRecommendations();
            List<ReorderRecommendationDto> urgent = recs.stream()
                    .filter(r -> "CRITICAL".equals(r.getUrgency()) || "MEDIUM".equals(r.getUrgency()))
                    .limit(5)
                    .collect(Collectors.toList());

            metrics.put("totalRecommendations", recs.size());
            metrics.put("criticalCount", recs.stream().filter(r -> "CRITICAL".equals(r.getUrgency())).count());
            metrics.put("mediumCount", recs.stream().filter(r -> "MEDIUM".equals(r.getUrgency())).count());

            List<String> recItems = urgent.stream()
                    .map(r -> r.getProductName() + " (" + r.getAvailableStock() + " left, ROP: " + r.getReorderPoint() + ", suggest +" + r.getRecommendedOrderQty() + " units)")
                    .collect(Collectors.toList());
            metrics.put("recommendedActions", recItems);

            if (urgent.isEmpty()) {
                answer = "All monitored inventory levels are currently above reorder points with healthy safety stock buffers.";
            } else {
                answer = String.format("Found %d item(s) requiring replenishment. Top priorities: %s.",
                        recs.stream().filter(r -> !"NORMAL".equals(r.getUrgency())).count(),
                        String.join("; ", recItems));
            }

        // 7. General Operational Assistance
        } else {
            intent = "GENERAL_RETAIL_ASSISTANCE";
            Long products = productRepository.count();
            Long units = inventoryRepository.getTotalUnitsAcrossAllWarehouses();
            metrics.put("totalCatalogSkus", products);
            metrics.put("totalStockUnits", units != null ? units : 0);

            answer = String.format("Retail Inventory Management System is operational. Managing %d catalog SKUs with %d physical units across central and retail facilities. You can ask about lowest stock, top-selling products, today's sales revenue, pending purchase orders, inventory valuation by warehouse, or replenishment recommendations.",
                    products, units != null ? units : 0);
        }

        // Forward to Python AI microservice if available, supplying the real database metrics
        try {
            Map<String, Object> aiPayload = new HashMap<>();
            aiPayload.put("question", request.getQuestion() != null ? request.getQuestion() : request.getQuery());
            aiPayload.put("storeId", request.getStoreId());
            aiPayload.put("contextData", metrics);

            Map<String, Object> aiResp = restClient.post()
                    .uri(aiServiceUrl + "/chat")
                    .body(aiPayload)
                    .retrieve()
                    .body(Map.class);

            if (aiResp != null && aiResp.get("answer") != null) {
                String aiAnswer = (String) aiResp.get("answer");
                if (aiAnswer != null && !aiAnswer.isBlank()) {
                    return new AiChatResponseDto(aiAnswer, (String) aiResp.getOrDefault("intentDetected", intent), metrics, Boolean.TRUE.equals(aiResp.get("externalLlmUsed")));
                }
            }
        } catch (Exception e) {
            log.info("AI microservice at {} /chat is offline or timed out ({}); returning live grounded database response.", aiServiceUrl, e.getMessage());
        }

        return new AiChatResponseDto(answer, intent, metrics, false);
    }

    /**
     * Module 3: Time-Series Demand Forecasting
     */
    public ForecastResponseDto generateDemandForecast(ForecastRequestDto request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        int horizon = request.getHorizonDays() != null ? request.getHorizonDays() : 14;

        // Try Python FastAPI forecasting service first
        try {
            Map<String, Object> payload = Map.of(
                    "productId", product.getId(),
                    "horizonDays", horizon,
                    "modelPreference", request.getModelPreference() != null ? request.getModelPreference() : "LINEAR_REGRESSION"
            );

            ForecastResponseDto response = restClient.post()
                    .uri(aiServiceUrl + "/forecast")
                    .body(payload)
                    .retrieve()
                    .body(ForecastResponseDto.class);

            if (response != null && response.getForecastPoints() != null && !response.getForecastPoints().isEmpty()) {
                return response;
            }
        } catch (Exception e) {
            log.info("FastAPI AI service at {} is unavailable ({}), using Java statistical forecasting engine.", aiServiceUrl, e.getMessage());
        }

        // Java built-in linear regression & moving average statistical forecasting engine
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<SaleItem> history = saleItemRepository.findSalesForProductSince(product.getId(), since);

        // Aggregate daily demand
        Map<LocalDate, Integer> dailyTotals = new HashMap<>();
        for (int i = 30; i >= 0; i--) {
            dailyTotals.put(LocalDate.now().minusDays(i), 0);
        }
        for (SaleItem si : history) {
            if (si.getSale() != null && si.getSale().getSaleDate() != null) {
                LocalDate d = si.getSale().getSaleDate().toLocalDate();
                dailyTotals.put(d, dailyTotals.getOrDefault(d, 0) + si.getQuantity());
            }
        }

        List<Integer> series = new ArrayList<>(dailyTotals.values());
        double avgDaily = series.stream().mapToInt(Integer::intValue).average().orElse(1.5);
        if (avgDaily <= 0) avgDaily = 1.0;

        // Fit linear regression y = m*x + c
        int n = series.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            double x = i + 1;
            double y = series.get(i);
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;

        // Calculate MAE and RMSE on historical series
        double absErrSum = 0;
        double sqErrSum = 0;
        double baseAbsErrSum = 0;
        for (int i = 0; i < n; i++) {
            double actual = series.get(i);
            double predicted = Math.max(0, slope * (i + 1) + intercept);
            absErrSum += Math.abs(actual - predicted);
            sqErrSum += Math.pow(actual - predicted, 2);
            baseAbsErrSum += Math.abs(actual - avgDaily);
        }
        double mae = Math.round((absErrSum / n) * 100.0) / 100.0;
        double rmse = Math.round(Math.sqrt(sqErrSum / n) * 100.0) / 100.0;
        double baseMae = Math.round((baseAbsErrSum / n) * 100.0) / 100.0;

        List<ForecastResponseDto.DailyForecastPoint> points = new ArrayList<>();
        double totalDemand = 0;
        for (int h = 1; h <= horizon; h++) {
            LocalDate fDate = LocalDate.now().plusDays(h);
            double pred = Math.max(0, slope * (n + h) + intercept);
            if (Double.isNaN(pred) || pred <= 0) pred = avgDaily;
            pred = Math.round(pred * 10.0) / 10.0;
            totalDemand += pred;

            double lower = Math.max(0, Math.round((pred - 1.96 * mae) * 10.0) / 10.0);
            double upper = Math.round((pred + 1.96 * mae) * 10.0) / 10.0;
            points.add(new ForecastResponseDto.DailyForecastPoint(fDate, pred, lower, upper));
        }

        ForecastResponseDto response = new ForecastResponseDto();
        response.setProductId(product.getId());
        response.setProductSku(product.getSku());
        response.setProductName(product.getName());
        response.setHorizonDays(horizon);
        response.setModelName("Linear Regression Time-Series (FastAPI Fallback)");
        response.setMae(mae);
        response.setRmse(rmse);
        response.setBaselineMae(baseMae);
        response.setTotalPredictedDemand(Math.round(totalDemand * 10.0) / 10.0);
        response.setForecastPoints(points);
        response.setConfidenceInterpretation(String.format("Model evaluated across 30 days of sales history. MAE: %.2f units vs Baseline MAE: %.2f units. 95%% Prediction interval provided.", mae, baseMae));

        return response;
    }
}
