package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.Maintenance;
import com.telecom.stock_management.enums.DecisionMaintenance;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByRegionId(Long regionId);

    List<Maintenance> findByDecisionAdmin(DecisionMaintenance decisionAdmin);
}
