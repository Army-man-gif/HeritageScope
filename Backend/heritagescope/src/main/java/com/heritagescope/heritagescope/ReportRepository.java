package com.heritagescope.heritagescope;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ReportRepository {

    public boolean addReport(UserReport report) {

        String sql =
            "INSERT INTO reports " +
            "(latitude, longitude, category, severity, affected_groups, description, photo_path) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (
            Connection conn = DatabaseConnection.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {

            stmt.setDouble(1, report.getLatitude());
            stmt.setDouble(2, report.getLongitude());
            stmt.setString(3, report.getCategory().toString());
            stmt.setString(4, report.getSeverity().toString());
            stmt.setString(5, joinAffectedGroups(report.getAffectedGroups()));
            stmt.setString(6, report.getDescription());
            stmt.setString(7, report.getPhotoPath());

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }


    public boolean upvoteReport(int id) {
        String sql = "UPDATE reports SET upvotes = upvotes + 1 WHERE id = ?";

        try (
            Connection conn = DatabaseConnection.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
        ) {
            stmt.setInt(1, id);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.out.println("Upvote Failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
   

    public List<UserReport> getAllReports() {

        List<UserReport> reports = new ArrayList<>();

        String sql = "SELECT * FROM reports";

        try (
            Connection conn = DatabaseConnection.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery()
        ) {

            while (rs.next()) {

                UserReport report = new UserReport(
                    rs.getInt("id"),
                    rs.getDouble("latitude"),
                    rs.getDouble("longitude"),
                    ReportCategory.fromString(rs.getString("category")),
                    SeverityLevel.fromString(rs.getString("severity")),
                    splitAffectedGroups(rs.getString("affected_groups")),
                    rs.getString("description"),
                    rs.getString("photo_path")
                );
                report.setUpvotes(rs.getInt("upvotes"));

                reports.add(report);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return reports;
    }

    private String joinAffectedGroups(List<String> affectedGroups) {
        return String.join(",", affectedGroups);
        
    }



    private List<String> splitAffectedGroups(String affectedGroupsText) {
        if (affectedGroupsText == null || affectedGroupsText.isBlank()) {
            return new ArrayList<>();
        }

        return new ArrayList<>(Arrays.asList(affectedGroupsText.split(",")));
    }
}