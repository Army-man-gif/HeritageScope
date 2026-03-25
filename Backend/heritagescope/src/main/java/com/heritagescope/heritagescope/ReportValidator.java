package com.heritagescope.heritagescope;

import java.util.ArrayList;
import java.util.List;

public class ReportValidator {

    public List<String> validate(UserReport report) {

        List<String> errors = new ArrayList<>();

        if (report == null) {
            errors.add("Report cannot be null.");
            return errors;
        }

        if (report.getLatitude() < -90 || report.getLatitude() > 90) {
            errors.add("Latitude must be between -90 and 90.");
        }

        if (report.getLongitude() < -180 || report.getLongitude() > 180) {
            errors.add("Longitude must be between -180 and 180.");
        }

        if (report.getCategory() == null) {
            errors.add("Report category not specified.");
        }

        if (report.getSeverity() == null) {
            errors.add("Severity level not specified.");
        }

        if (report.getAffectedGroups() == null || report.getAffectedGroups().isEmpty()) {
            errors.add("At least one affected group must be specified.");
        }

        if (report.getDescription() != null && report.getDescription().length() > 500) {
            errors.add("Description must be less than 500 characters.");
        }

        return errors;
    }
}