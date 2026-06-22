package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.Maintenance;
import com.telecom.stock_management.enums.DecisionMaintenance;
import com.telecom.stock_management.repository.MaintenanceRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository) {
        this.maintenanceRepository = maintenanceRepository;
    }

    public List<Maintenance> findAll() {
        return maintenanceRepository.findAll();
    }

    public List<Maintenance> findByDecisionAdmin(DecisionMaintenance decisionAdmin) {
        return maintenanceRepository.findByDecisionAdmin(decisionAdmin);
    }

    public Maintenance findById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found"));
    }

    public Maintenance create(Maintenance maintenance) {
        maintenance.setId(null);
        return maintenanceRepository.save(maintenance);
    }

    public Maintenance update(Long id, Maintenance maintenance) {
        findById(id);
        maintenance.setId(id);
        return maintenanceRepository.save(maintenance);
    }

    public void delete(Long id) {
        Maintenance maintenance = findById(id);
        maintenanceRepository.delete(maintenance);
    }
}
