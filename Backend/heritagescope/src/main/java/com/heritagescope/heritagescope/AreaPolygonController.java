package com.heritagescope.heritagescope;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/* Yi modified with codex: exposes database-backed area polygons for direct id lookups and marker-position lookups. */
@RestController
@RequestMapping("/api/areas")
@CrossOrigin(origins = "*")
public class AreaPolygonController {

    private static final double MARKER_LOOKUP_TOLERANCE = 0.001;

    @Autowired
    private AreaPolygonRepository repository;

    @GetMapping("/{id}")
    public ResponseEntity<AreaPolygon> getAreaById(@PathVariable Long id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-marker")
    public ResponseEntity<AreaPolygon> getAreaByMarker(
        @RequestParam Double latitude,
        @RequestParam Double longitude
    ) {
        return repository.findByMarkerPosition(latitude, longitude)
            .or(() -> repository.findClosestByMarkerPosition(latitude, longitude, MARKER_LOOKUP_TOLERANCE))
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
