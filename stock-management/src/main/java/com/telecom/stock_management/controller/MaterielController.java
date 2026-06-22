package com.telecom.stock_management.controller;

import com.telecom.stock_management.entity.Materiel;
import com.telecom.stock_management.service.MaterielService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/materiels")
@CrossOrigin(origins = "http://localhost:5174")
public class MaterielController {

    private final MaterielService materielService;

    public MaterielController(MaterielService materielService) {
        this.materielService = materielService;
    }

    @GetMapping
    public List<Materiel> findAll() {
        return materielService.findAll();
    }

    @GetMapping("/{id}")
    public Materiel findById(@PathVariable Long id) {
        return materielService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Materiel create(@RequestBody Materiel materiel) {
        return materielService.create(materiel);
    }

    @PutMapping("/{id}")
    public Materiel update(@PathVariable Long id, @RequestBody Materiel materiel) {
        return materielService.update(id, materiel);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        materielService.delete(id);
    }
}
