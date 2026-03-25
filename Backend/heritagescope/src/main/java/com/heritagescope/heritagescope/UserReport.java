package com.heritagescope.heritagescope;

import java.util.ArrayList;
import java.util.List;

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

    public int getId() {
        return id;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;

    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
        
    }

    public ReportCategory getCategory() {
        return category;
    }

    public void setCategory(ReportCategory category) {
        this.category = category;
        
    }

    public SeverityLevel getSeverity() {
        return severity;
    }

    public void setSeverity(SeverityLevel severity) {
        this.severity = severity;
        
    }

    public List<String> getAffectedGroups() {
        return new ArrayList<>(affectedGroups);
    }

     public void setAffectedGroups(List<String> affectedGroups) {
        this.affectedGroups = new ArrayList<>(affectedGroups);
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }
    

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