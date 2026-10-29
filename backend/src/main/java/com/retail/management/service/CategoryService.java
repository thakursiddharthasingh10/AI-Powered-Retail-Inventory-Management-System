package com.retail.management.service;

import com.retail.management.dto.CategoryDto;
import com.retail.management.entity.Category;
import com.retail.management.exception.BadRequestException;
import com.retail.management.exception.ResourceNotFoundException;
import com.retail.management.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public CategoryService(CategoryRepository categoryRepository, AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public Category createCategory(CategoryDto dto) {
        if (categoryRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Category code already exists: " + dto.getCode());
        }

        Category cat = new Category();
        cat.setCode(dto.getCode());
        cat.setName(dto.getName());
        cat.setDescription(dto.getDescription());
        cat.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Category saved = categoryRepository.save(cat);
        auditLogService.logAction("user", "CREATE_CATEGORY", "CATEGORY", saved.getId().toString(), "Created category " + saved.getName());
        return saved;
    }

    @Transactional
    public Category updateCategory(Long id, CategoryDto dto) {
        Category cat = getCategoryById(id);

        if (!cat.getCode().equalsIgnoreCase(dto.getCode()) && categoryRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Category code already exists: " + dto.getCode());
        }

        cat.setCode(dto.getCode());
        cat.setName(dto.getName());
        cat.setDescription(dto.getDescription());
        if (dto.getIsActive() != null) cat.setIsActive(dto.getIsActive());

        Category updated = categoryRepository.save(cat);
        auditLogService.logAction("user", "UPDATE_CATEGORY", "CATEGORY", id.toString(), "Updated category " + updated.getName());
        return updated;
    }

    @Transactional
    public void deleteOrDeactivateCategory(Long id) {
        Category cat = getCategoryById(id);
        cat.setIsActive(false);
        categoryRepository.save(cat);
        auditLogService.logAction("user", "DEACTIVATE_CATEGORY", "CATEGORY", id.toString(), "Deactivated category " + cat.getName());
    }
}
