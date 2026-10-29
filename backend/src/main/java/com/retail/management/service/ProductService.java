package com.retail.management.service;

import com.retail.management.dto.ProductDto;
import com.retail.management.entity.Category;
import com.retail.management.entity.Product;
import com.retail.management.exception.BadRequestException;
import com.retail.management.exception.ResourceNotFoundException;
import com.retail.management.repository.CategoryRepository;
import com.retail.management.repository.InventoryRepository;
import com.retail.management.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditLogService auditLogService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          InventoryRepository inventoryRepository,
                          AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
        this.auditLogService = auditLogService;
    }

    public Page<ProductDto> searchProducts(String query, Long categoryId, Boolean isActive, Pageable pageable) {
        Page<Product> products = productRepository.searchProducts(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                categoryId,
                isActive,
                pageable
        );
        return products.map(this::convertToDto);
    }

    public List<ProductDto> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public ProductDto getProductById(Long id) {
        return convertToDto(getProductEntityById(id));
    }

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("Product SKU already exists: " + dto.getSku());
        }
        if (dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty() && productRepository.existsByBarcode(dto.getBarcode())) {
            throw new BadRequestException("Product Barcode already exists: " + dto.getBarcode());
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Product product = new Product();
        product.setCategory(category);
        product.setSku(dto.getSku());
        product.setBarcode(dto.getBarcode());
        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setDescription(dto.getDescription());
        product.setUnit(dto.getUnit() != null ? dto.getUnit() : "PCS");
        product.setCostPrice(dto.getCostPrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setReorderLevel(dto.getReorderLevel() != null ? dto.getReorderLevel() : 10);
        product.setSafetyStock(dto.getSafetyStock() != null ? dto.getSafetyStock() : 5);
        product.setImageUrl(dto.getImageUrl());
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Product saved = productRepository.save(product);
        auditLogService.logAction("user", "CREATE_PRODUCT", "PRODUCT", saved.getId().toString(), "Created product " + saved.getName() + " [SKU: " + saved.getSku() + "]");
        return convertToDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = getProductEntityById(id);

        if (!product.getSku().equalsIgnoreCase(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("Product SKU already exists: " + dto.getSku());
        }

        if (dto.getBarcode() != null && !dto.getBarcode().equalsIgnoreCase(product.getBarcode()) && productRepository.existsByBarcode(dto.getBarcode())) {
            throw new BadRequestException("Product Barcode already exists: " + dto.getBarcode());
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        product.setCategory(category);
        product.setSku(dto.getSku());
        product.setBarcode(dto.getBarcode());
        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setDescription(dto.getDescription());
        if (dto.getUnit() != null) product.setUnit(dto.getUnit());
        product.setCostPrice(dto.getCostPrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setReorderLevel(dto.getReorderLevel());
        product.setSafetyStock(dto.getSafetyStock());
        product.setImageUrl(dto.getImageUrl());
        if (dto.getIsActive() != null) product.setIsActive(dto.getIsActive());

        Product updated = productRepository.save(product);
        auditLogService.logAction("user", "UPDATE_PRODUCT", "PRODUCT", id.toString(), "Updated product " + updated.getName());
        return convertToDto(updated);
    }

    @Transactional
    public ProductDto toggleProductStatus(Long id) {
        Product product = getProductEntityById(id);
        product.setIsActive(!Boolean.TRUE.equals(product.getIsActive()));
        Product updated = productRepository.save(product);
        auditLogService.logAction("user", "TOGGLE_PRODUCT_STATUS", "PRODUCT", id.toString(), "Set product active to: " + product.getIsActive());
        return convertToDto(updated);
    }

    public ProductDto convertToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setCategoryId(p.getCategory() != null ? p.getCategory().getId() : null);
        dto.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : "");
        dto.setSku(p.getSku());
        dto.setBarcode(p.getBarcode());
        dto.setName(p.getName());
        dto.setBrand(p.getBrand());
        dto.setDescription(p.getDescription());
        dto.setUnit(p.getUnit());
        dto.setCostPrice(p.getCostPrice());
        dto.setSellingPrice(p.getSellingPrice());
        dto.setReorderLevel(p.getReorderLevel());
        dto.setSafetyStock(p.getSafetyStock());
        dto.setImageUrl(p.getImageUrl());
        dto.setIsActive(p.getIsActive());

        Integer totalStock = inventoryRepository.getTotalStockByProductId(p.getId());
        dto.setTotalStock(totalStock != null ? totalStock : 0);
        return dto;
    }
}
