package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.Mouvement;
import com.telecom.stock_management.repository.MouvementRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MouvementService {

    private final MouvementRepository mouvementRepository;

    public MouvementService(MouvementRepository mouvementRepository) {
        this.mouvementRepository = mouvementRepository;
    }

    public List<Mouvement> findAll() {
        return mouvementRepository.findAll();
    }

    public Mouvement findById(Long id) {
        return mouvementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mouvement not found"));
    }

    public Mouvement create(Mouvement mouvement) {
        mouvement.setId(null);
        return mouvementRepository.save(mouvement);
    }

    public Mouvement update(Long id, Mouvement mouvement) {
        findById(id);
        mouvement.setId(id);
        return mouvementRepository.save(mouvement);
    }

    public void delete(Long id) {
        Mouvement mouvement = findById(id);
        mouvementRepository.delete(mouvement);
    }
}
