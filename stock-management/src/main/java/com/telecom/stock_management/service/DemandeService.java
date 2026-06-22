package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.Demande;
import com.telecom.stock_management.entity.DemandeDetail;
import com.telecom.stock_management.enums.DemandeStatus;
import com.telecom.stock_management.repository.DemandeRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DemandeService {

    private final DemandeRepository demandeRepository;

    public DemandeService(DemandeRepository demandeRepository) {
        this.demandeRepository = demandeRepository;
    }

    public List<Demande> findAll() {
        return demandeRepository.findAll();
    }

    public List<Demande> findByStatut(DemandeStatus statut) {
        return demandeRepository.findByStatut(statut);
    }

    public Demande findById(Long id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande not found"));
    }

    public Demande create(Demande demande) {
        demande.setId(null);
        attachDetails(demande);
        return demandeRepository.save(demande);
    }

    public Demande update(Long id, Demande demande) {
        findById(id);
        demande.setId(id);
        attachDetails(demande);
        return demandeRepository.save(demande);
    }

    public void delete(Long id) {
        Demande demande = findById(id);
        demandeRepository.delete(demande);
    }

    private void attachDetails(Demande demande) {
        if (demande.getDetails() == null) {
            return;
        }
        for (DemandeDetail detail : demande.getDetails()) {
            detail.setDemande(demande);
        }
    }
}
