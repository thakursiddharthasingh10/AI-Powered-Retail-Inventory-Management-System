package com.retail.management.service;

import com.retail.management.dto.SupplierDto;
import com.retail.management.entity.Supplier;
import com.retail.management.exception.BadRequestException;
import com.retail.management.exception.ResourceNotFoundException;
import com.retail.management.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final AuditLogService auditLogService;

    public SupplierService(SupplierRepository supplierRepository, AuditLogService auditLogService) {
        this.supplierRepository = supplierRepository;
        this.auditLogService = auditLogService;
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public List<Supplier> getActiveSuppliers() {
        return supplierRepository.findByIsActiveTrue();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    @Transactional
    public Supplier createSupplier(SupplierDto dto) {
        if (supplierRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Supplier code already exists: " + dto.getCode());
        }

        Supplier s = new Supplier();
        s.setCode(dto.getCode());
        s.setName(dto.getName());
        s.setContactPerson(dto.getContactPerson());
        s.setEmail(dto.getEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        s.setLeadTimeDays(dto.getLeadTimeDays() != null ? dto.getLeadTimeDays() : 3);
        s.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Supplier saved = supplierRepository.save(s);
        auditLogService.logAction("user", "CREATE_SUPPLIER", "SUPPLIER", saved.getId().toString(), "Created supplier " + saved.getName());
        return saved;
    }

    @Transactional
    public Supplier updateSupplier(Long id, SupplierDto dto) {
        Supplier s = getSupplierById(id);

        if (!s.getCode().equalsIgnoreCase(dto.getCode()) && supplierRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Supplier code already exists: " + dto.getCode());
        }

        s.setCode(dto.getCode());
        s.setName(dto.getName());
        s.setContactPerson(dto.getContactPerson());
        s.setEmail(dto.getEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        if (dto.getLeadTimeDays() != null) s.setLeadTimeDays(dto.getLeadTimeDays());
        if (dto.getIsActive() != null) s.setIsActive(dto.getIsActive());

        Supplier updated = supplierRepository.save(s);
        auditLogService.logAction("user", "UPDATE_SUPPLIER", "SUPPLIER", id.toString(), "Updated supplier " + updated.getName());
        return updated;
    }
}
