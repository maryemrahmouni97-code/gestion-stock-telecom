package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.Materiel;
import com.telecom.stock_management.repository.MaterielRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MaterielService {

    private final MaterielRepository materielRepository;

    public MaterielService(MaterielRepository materielRepository) {
        this.materielRepository = materielRepository;
    }

    public List<Materiel> findAll() {
        return materielRepository.findAll();
    }

    public Materiel findById(Long id) {
        return materielRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Materiel not found"));
    }

    public Materiel create(Materiel materiel) {
        materiel.setId(null);
        return materielRepository.save(materiel);
    }

    public Materiel update(Long id, Materiel materiel) {
        findById(id);
        materiel.setId(id);
        return materielRepository.save(materiel);
    }

    public void delete(Long id) {
        Materiel materiel = findById(id);
        materielRepository.delete(materiel);
    }
}
