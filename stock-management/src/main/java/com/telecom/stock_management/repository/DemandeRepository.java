package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.Demande;
import com.telecom.stock_management.enums.DemandeStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemandeRepository extends JpaRepository<Demande, Long> {
    List<Demande> findByRegionId(Long regionId);

    List<Demande> findByStatut(DemandeStatus statut);
}
