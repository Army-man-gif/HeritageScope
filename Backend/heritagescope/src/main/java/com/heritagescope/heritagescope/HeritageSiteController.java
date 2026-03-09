package com.heritagescope.heritagescope;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sites")
@CrossOrigin(origins = "*")
public class HeritageSiteController {

    @Autowired
    private HeritageSiteRepository repository;

    @GetMapping
    public List<HeritageSite> getAllSites() {
        return repository.findAll();
    }

    @PostMapping
    public HeritageSite addSite(@RequestBody HeritageSite site) {
        return repository.save(site);
    }
}