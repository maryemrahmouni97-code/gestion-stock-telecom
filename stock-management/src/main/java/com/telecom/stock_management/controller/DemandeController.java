package com.telecom.stock_management.controller;

import com.telecom.stock_management.entity.Demande;
import com.telecom.stock_management.enums.DemandeStatus;
import com.telecom.stock_management.service.DemandeService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demandes")
@CrossOrigin(origins = "http://localhost:5174")
public class DemandeController {

    private final DemandeService demandeService;

    public DemandeController(DemandeService demandeService) {
        this.demandeService = demandeService;
    }

    @GetMapping
    public List<Demande> findAll(@RequestParam(required = false) DemandeStatus statut) {
        if (statut != null) {
            return demandeService.findByStatut(statut);
        }
        return demandeService.findAll();
    }

    @GetMapping("/{id}")
    public Demande findById(@PathVariable Long id) {
        return demandeService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Demande create(@RequestBody Demande demande) {
        return demandeService.create(demande);
    }

    @PutMapping("/{id}")
    public Demande update(@PathVariable Long id, @RequestBody Demande demande) {
        return demandeService.update(id, demande);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        demandeService.delete(id);
    }
}
