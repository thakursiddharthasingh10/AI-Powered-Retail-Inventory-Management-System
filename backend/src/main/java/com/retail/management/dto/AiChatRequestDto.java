package com.retail.management.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class AiChatRequestDto {

    @JsonAlias({"query", "prompt", "message"})
    @NotBlank(message = "Question or prompt cannot be empty")
    private String question;

    private Long storeId;

    public AiChatRequestDto() {}

    public AiChatRequestDto(String question) {
        this.question = question;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public void setQuery(String query) {
        if (this.question == null || this.question.isBlank()) {
            this.question = query;
        }
    }

    public String getQuery() { return question; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }
}
