package com.heritagescope.heritagescope;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaPolygonRepository extends JpaRepository<AreaPolygon, Long> {

    /* Yi modified with codex: marker clicks query the database by marker coordinates before falling back to a generated mock area. */
    @Query("""
        SELECT area
        FROM AreaPolygon area
        WHERE ABS(area.markerLatitude - :latitude) < 0.000001
          AND ABS(area.markerLongitude - :longitude) < 0.000001
        """)
    Optional<AreaPolygon> findByMarkerPosition(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude
    );

    /* Yi modified with codex: fallback lookup returns the closest polygon when marker coordinates differ slightly in precision. */
    @Query(
        value = """
            SELECT *
            FROM area_polygon
            WHERE ABS(marker_latitude - :latitude) <= :tolerance
              AND ABS(marker_longitude - :longitude) <= :tolerance
            ORDER BY ABS(marker_latitude - :latitude) + ABS(marker_longitude - :longitude)
            LIMIT 1
            """,
        nativeQuery = true
    )
    Optional<AreaPolygon> findClosestByMarkerPosition(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("tolerance") Double tolerance
    );
}
