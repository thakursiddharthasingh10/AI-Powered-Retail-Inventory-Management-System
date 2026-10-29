package com.retail.management.controller;

import com.retail.management.dto.*;
import com.retail.management.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Demand Intelligence & Assistant", description = "Endpoints for demand forecasting, reorder intelligence, and grounded business assistance")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/health")
    @Operation(summary = "Check AI service status and capability readiness")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiHealth() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "status", "UP",
                "service", "Retail AI Intelligence Microservice",
                "capabilities", List.of("Time-Series Demand Forecasting", "Deterministic Safety-Stock Reorder", "Grounded Natural Language Assistant")
        )));
    }

    @PostMapping("/forecasts")
    @Operation(summary = "Generate multi-day demand forecast using regression / moving-average time-series")
    public ResponseEntity<ApiResponse<ForecastResponseDto>> generateForecast(@Valid @RequestBody ForecastRequestDto request) {
        ForecastResponseDto response = aiService.generateDemandForecast(request);
        return ResponseEntity.ok(ApiResponse.ok("Forecast generated successfully", response));
    }

    @GetMapping("/reorder-recommendations")
    @Operation(summary = "Get transparent safety-stock and lead-time based replenishment recommendations")
    public ResponseEntity<ApiResponse<List<ReorderRecommendationDto>>> getReorderRecommendations() {
        List<ReorderRecommendationDto> recommendations = aiService.getReorderRecommendations();
        return ResponseEntity.ok(ApiResponse.ok("Reorder recommendations calculated", recommendations));
    }

    @PostMapping("/reorder-recommendations/recalculate")
    @Operation(summary = "Recalculate safety-stock and lead-time replenishment recommendations across all warehouses")
    public ResponseEntity<ApiResponse<List<ReorderRecommendationDto>>> recalculateReorderRecommendations() {
        List<ReorderRecommendationDto> recommendations = aiService.getReorderRecommendations();
        return ResponseEntity.ok(ApiResponse.ok("Reorder recommendations recalculated successfully", recommendations));
    }

    @PostMapping("/chat")
    @Operation(summary = "Query natural-language retail assistant grounded in real database figures")
    public ResponseEntity<ApiResponse<AiChatResponseDto>> chatWithAssistant(@Valid @RequestBody AiChatRequestDto request) {
        AiChatResponseDto response = aiService.processNaturalLanguageQuery(request);
        return ResponseEntity.ok(ApiResponse.ok("Query answered", response));
    }
}
