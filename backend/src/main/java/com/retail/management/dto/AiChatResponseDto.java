package com.retail.management.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class AiChatResponseDto {
    private String answer;
    private String intentDetected;
    private Map<String, Object> groundedMetrics;
    private boolean externalLlmUsed;
    private LocalDateTime timestamp;

    public AiChatResponseDto() {
        this.timestamp = LocalDateTime.now();
    }

    public AiChatResponseDto(String answer, String intentDetected, Map<String, Object> groundedMetrics, boolean externalLlmUsed) {
        this.answer = answer;
        this.intentDetected = intentDetected;
        this.groundedMetrics = groundedMetrics;
        this.externalLlmUsed = externalLlmUsed;
        this.timestamp = LocalDateTime.now();
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getIntentDetected() { return intentDetected; }
    public void setIntentDetected(String intentDetected) { this.intentDetected = intentDetected; }

    public Map<String, Object> getGroundedMetrics() { return groundedMetrics; }
    public void setGroundedMetrics(Map<String, Object> groundedMetrics) { this.groundedMetrics = groundedMetrics; }

    public boolean isExternalLlmUsed() { return externalLlmUsed; }
    public void setExternalLlmUsed(boolean externalLlmUsed) { this.externalLlmUsed = externalLlmUsed; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
