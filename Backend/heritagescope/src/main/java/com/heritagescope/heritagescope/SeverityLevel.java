package com.heritagescope.heritagescope;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SeverityLevel {
    LOW,
    MEDIUM,
    HIGH;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SeverityLevel fromString(String value) {
        if (value == null) {
            return null;
        }
        try {
            return SeverityLevel.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown severity: " + value);
        }
    }
}
