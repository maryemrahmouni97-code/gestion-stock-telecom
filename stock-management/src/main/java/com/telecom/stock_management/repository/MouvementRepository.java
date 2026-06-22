package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.Mouvement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MouvementRepository extends JpaRepository<Mouvement, Long> {
    List<Mouvement> findByMaterielId(Long materielId);

    List<Mouvement> findByRegionSourceIdOrRegionDestinationId(Long regionSourceId, Long regionDestinationId);
}
