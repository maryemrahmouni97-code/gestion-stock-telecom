package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.Stock;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByRegionId(Long regionId);

    List<Stock> findByMaterielId(Long materielId);

    Optional<Stock> findByRegionIdAndMaterielId(Long regionId, Long materielId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Stock s where s.region.id = :regionId and s.materiel.id = :materielId")
    Optional<Stock> findWithLockByRegionIdAndMaterielId(
            @Param("regionId") Long regionId, @Param("materielId") Long materielId);
}
