package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.Region;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Long> {
    Optional<Region> findByNomRegion(String nomRegion);
}
