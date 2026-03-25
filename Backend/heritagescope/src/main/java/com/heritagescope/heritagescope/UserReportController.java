package com.heritagescope.heritagescope;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/reports")

public class UserReportController {

    private final Reporting reporting;

    public UserReportController() {
        this.reporting = new Reporting();
    }

    @GetMapping
    public List<UserReport> getAllReports() {
        return reporting.getAllReports();
    }

    @PostMapping
    public List<String> submitReport(@RequestBody UserReport report) {
        return reporting.submitReport(report);
    }

    @PostMapping("/{id}/upvote")
    public boolean upvoteReport(@PathVariable int id) {
        return reporting .upvoteReport(id);
    }
}