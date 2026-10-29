package com.retail.management.service;

import com.retail.management.dto.StoreDto;
import com.retail.management.dto.WarehouseDto;
import com.retail.management.entity.Store;
import com.retail.management.entity.Warehouse;
import com.retail.management.exception.BadRequestException;
import com.retail.management.exception.ResourceNotFoundException;
import com.retail.management.repository.StoreRepository;
import com.retail.management.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final StoreRepository storeRepository;
    private final AuditLogService auditLogService;

    public WarehouseService(WarehouseRepository warehouseRepository,
                            StoreRepository storeRepository,
                            AuditLogService auditLogService) {
        this.warehouseRepository = warehouseRepository;
        this.storeRepository = storeRepository;
        this.auditLogService = auditLogService;
    }

    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<WarehouseDto> getActiveWarehouses() {
        return warehouseRepository.findByIsActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Warehouse getWarehouseEntityById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
    }

    @Transactional
    public WarehouseDto createWarehouse(WarehouseDto dto) {
        if (warehouseRepository.findByCode(dto.getCode()).isPresent()) {
            throw new BadRequestException("Warehouse code already exists: " + dto.getCode());
        }

        Warehouse wh = new Warehouse();
        wh.setCode(dto.getCode());
        wh.setName(dto.getName());
        wh.setLocation(dto.getLocation());
        wh.setCapacity(dto.getCapacity() != null ? dto.getCapacity() : 10000);
        wh.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        if (dto.getStoreId() != null) {
            storeRepository.findById(dto.getStoreId()).ifPresent(wh::setStore);
        }

        Warehouse saved = warehouseRepository.save(wh);
        auditLogService.logAction("user", "CREATE_WAREHOUSE", "WAREHOUSE", saved.getId().toString(), "Created warehouse " + saved.getName());
        return convertToDto(saved);
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @Transactional
    public Store createStore(StoreDto dto) {
        if (storeRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Store code already exists: " + dto.getCode());
        }

        Store s = new Store();
        s.setCode(dto.getCode());
        s.setName(dto.getName());
        s.setAddress(dto.getAddress());
        s.setCity(dto.getCity());
        s.setState(dto.getState());
        s.setPhone(dto.getPhone());
        s.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Store saved = storeRepository.save(s);
        auditLogService.logAction("user", "CREATE_STORE", "STORE", saved.getId().toString(), "Created store " + saved.getName());
        return saved;
    }

    private WarehouseDto convertToDto(Warehouse w) {
        WarehouseDto dto = new WarehouseDto();
        dto.setId(w.getId());
        dto.setCode(w.getCode());
        dto.setName(w.getName());
        dto.setLocation(w.getLocation());
        dto.setCapacity(w.getCapacity());
        dto.setIsActive(w.getIsActive());
        if (w.getStore() != null) {
            dto.setStoreId(w.getStore().getId());
            dto.setStoreName(w.getStore().getName());
        }
        return dto;
    }
}
