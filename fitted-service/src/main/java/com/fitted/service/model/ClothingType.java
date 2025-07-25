package com.fitted.service.model;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum ClothingType {
    TOP("top"),
    BOTTOM("bottom"),
    SHOES("shoes"),
    ACCESSORY("accessory"),
    DRESS("dress"),
    OUTERWEAR("outerwear");

    private final String type;

    ClothingType(String type) {
        this.type = type;
    }

    @JsonValue
    public String getType() {
        return this.type;
    }
}
