package com.heritagescope.heritagescope;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReportCategory {
    ACCESSIBILITY,
    SAFETY,
    ENVIRONMENTAL;

    @JsonValue
    public String toString() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static ReportCategory fromString(String value) {
        if (value == null) {
            return null;
        }
        try {
            return ReportCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown category: " + value);
        }
    }
}
