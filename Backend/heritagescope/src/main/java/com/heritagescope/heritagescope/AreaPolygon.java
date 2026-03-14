package com.heritagescope.heritagescope;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/* Yi modified with codex: database-backed area polygons for explicit mock areas used by marker and LID lookups. */
@Entity
@Table(name = "area_polygon")
public class AreaPolygon {

    @Id
    private Long id;

    @Column(nullable = false)
    private Double markerLatitude;

    @Column(nullable = false)
    private Double markerLongitude;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String polyData;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getMarkerLatitude() { return markerLatitude; }
    public void setMarkerLatitude(Double markerLatitude) { this.markerLatitude = markerLatitude; }

    public Double getMarkerLongitude() { return markerLongitude; }
    public void setMarkerLongitude(Double markerLongitude) { this.markerLongitude = markerLongitude; }

    public String getPolyData() { return polyData; }
    public void setPolyData(String polyData) { this.polyData = polyData; }
}
