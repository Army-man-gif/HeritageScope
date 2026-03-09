package com.heritagescope.heritagescope;

import jakarta.persistence.*;

@Entity
@Table(name = "heritage_site")
public class HeritageSite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private String siteType;
    private String area;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getSiteType() { return siteType; }
    public void setSiteType(String siteType) { this.siteType = siteType; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
}