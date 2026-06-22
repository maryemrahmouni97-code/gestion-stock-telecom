package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.DemandeDetail;
import com.telecom.stock_management.repository.DemandeDetailRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DemandeDetailService {

    private final DemandeDetailRepository demandeDetailRepository;

    public DemandeDetailService(DemandeDetailRepository demandeDetailRepository) {
        this.demandeDetailRepository = demandeDetailRepository;
    }

    public List<DemandeDetail> findAll() {
        return demandeDetailRepository.findAll();
    }

    public List<DemandeDetail> findByDemandeId(Long demandeId) {
        return demandeDetailRepository.findByDemandeId(demandeId);
    }

    public DemandeDetail findById(Long id) {
        return demandeDetailRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande detail not found"));
    }

    public DemandeDetail create(DemandeDetail demandeDetail) {
        demandeDetail.setId(null);
        return demandeDetailRepository.save(demandeDetail);
    }

    public DemandeDetail update(Long id, DemandeDetail demandeDetail) {
        findById(id);
        demandeDetail.setId(id);
        return demandeDetailRepository.save(demandeDetail);
    }

    public void delete(Long id) {
        DemandeDetail demandeDetail = findById(id);
        demandeDetailRepository.delete(demandeDetail);
    }
}
