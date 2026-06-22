package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.DemandeDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemandeDetailRepository extends JpaRepository<DemandeDetail, Long> {
    List<DemandeDetail> findByDemandeId(Long demandeId);
}
