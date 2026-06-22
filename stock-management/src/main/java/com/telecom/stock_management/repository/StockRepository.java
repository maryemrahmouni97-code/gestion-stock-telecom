package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.Stock;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByRegionId(Long regionId);

    List<Stock> findByMaterielId(Long materielId);

    Optional<Stock> findByRegionIdAndMaterielId(Long regionId, Long materielId);
}
