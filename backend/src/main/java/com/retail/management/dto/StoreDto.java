package com.retail.management.dto;

import jakarta.validation.constraints.NotBlank;

public class StoreDto {
    private Long id;

    @NotBlank(message = "Store code is required")
    private String code;

    @NotBlank(message = "Store name is required")
    private String name;

    private String address;
    private String city;
    private String state;
    private String phone;
    private Boolean isActive = true;

    public StoreDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
