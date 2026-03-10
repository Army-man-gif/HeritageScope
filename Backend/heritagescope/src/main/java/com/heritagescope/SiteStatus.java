package com.heritagescope.heritagescope;

import jakarta.persistence.*;

@Entity
@Table(name = "site_status")
public class SiteStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String siteName;
    private Double latitude;
    private Double longitude;
    private String visitorPressure;
    private String weatherCondition;
    private String riskLevel;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getVisitorPressure() { return visitorPressure; }
    public void setVisitorPressure(String visitorPressure) { this.visitorPressure = visitorPressure; }

    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
}