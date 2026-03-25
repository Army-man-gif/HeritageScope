package com.heritagescope.heritagescope;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import com.heritagescope.heritagescope.Comment;

public class UserReport {
    private int id;
    private double latitude;
    private double longitude;
    private ReportCategory category;
    private SeverityLevel severity;
    private List<String> affectedGroups;
    private String description;
    private String photoPath;
    private int upvotes;
    private List<Comment> comments;

    public UserReport() {
        this.upvotes = 0;
        this.comments = new ArrayList<>();
        this.affectedGroups = new ArrayList<>();
    }

    @JsonIgnore
    public UserReport(int id, double latitude, double longitude, ReportCategory category,
                       SeverityLevel severity, List<String> affectedGroups,
                       String description, String photoPath) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.category = category;
        this.severity = severity;
        this.affectedGroups = new ArrayList<>(affectedGroups);
        this.description = description;
        this.photoPath = photoPath;
        this.upvotes = 0;
        this.comments = new ArrayList<>();
    }

    @JsonProperty("id")
    public int getId() {
        return id;
    }

    @JsonProperty("latitude")
    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;

    }

    @JsonProperty("longitude")
    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
        
    }

    @JsonProperty("category")
    public ReportCategory getCategory() {
        return category;
    }

    public void setCategory(ReportCategory category) {
        this.category = category;
        
    }

    @JsonProperty("severity")
    public SeverityLevel getSeverity() {
        return severity;
    }

    public void setSeverity(SeverityLevel severity) {
        this.severity = severity;
        
    }

    @JsonProperty("affectedGroups")
    public List<String> getAffectedGroups() {
        return new ArrayList<>(affectedGroups);
    }

     public void setAffectedGroups(List<String> affectedGroups) {
        this.affectedGroups = new ArrayList<>(affectedGroups);
    }

    @JsonProperty("description")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @JsonProperty("photoPath")
    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }
    

    @JsonProperty("upvotes")
    public int getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(int upvotes) {
        this.upvotes = upvotes;
    }

    public void addComment(Comment comment) {
        comments.add(comment);
    }
}
