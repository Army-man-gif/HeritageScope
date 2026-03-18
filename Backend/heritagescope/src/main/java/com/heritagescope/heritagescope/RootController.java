package com.heritagescope.heritagescope;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public String root() {
        return "HeritageScope backend is running.";
    }
}
