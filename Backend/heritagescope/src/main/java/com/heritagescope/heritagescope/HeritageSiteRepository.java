package com.heritagescope.heritagescope;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HeritageSiteRepository extends JpaRepository<HeritageSite, Long> {
}