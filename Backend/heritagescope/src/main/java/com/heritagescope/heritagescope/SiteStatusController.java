package com.heritagescope.heritagescope;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "*")
public class SiteStatusController {

    @Autowired
    private SiteStatusRepository repository;

    @GetMapping
    public List<SiteStatus> getAllStatus() {
        return repository.findAll();
    }

    @GetMapping("/at-risk")
    public List<SiteStatus> getAtRiskSites() {
        List<SiteStatus> red = repository.findByRiskLevel("RED");
        List<SiteStatus> amber = repository.findByRiskLevel("AMBER");
        red.addAll(amber);
        return red;
    }
}