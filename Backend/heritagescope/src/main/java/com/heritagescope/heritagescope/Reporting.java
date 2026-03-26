package com.heritagescope.heritagescope;

import java.util.List;

public class Reporting {

    private ReportRepository repository;
    private ReportValidator validator;

    public Reporting() {
        repository = new ReportRepository();
        validator = new ReportValidator();
    }

    public List<String> submitReport(UserReport report) {

        List<String> errors = validator.validate(report);

        if (!errors.isEmpty()) {
            return errors;
        }

        boolean saved = repository.addReport(report);

        if (!saved) {
            errors.add("Report not saved to database");
        }

        return errors;
    }

    public boolean upvoteReport(int id) {
        return repository.upvoteReport(id);
    }

    public List<UserReport> getAllReports() {
        
        return repository.getAllReports();
    }

}