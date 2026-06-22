package com.telecom.stock_management.controller;

import com.telecom.stock_management.entity.Mouvement;
import com.telecom.stock_management.service.MouvementService;
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
@RequestMapping("/api/mouvements")
@CrossOrigin(origins = "http://localhost:5174")
public class MouvementController {

    private final MouvementService mouvementService;

    public MouvementController(MouvementService mouvementService) {
        this.mouvementService = mouvementService;
    }

    @GetMapping
    public List<Mouvement> findAll() {
        return mouvementService.findAll();
    }

    @GetMapping("/{id}")
    public Mouvement findById(@PathVariable Long id) {
        return mouvementService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mouvement create(@RequestBody Mouvement mouvement) {
        return mouvementService.create(mouvement);
    }

    @PutMapping("/{id}")
    public Mouvement update(@PathVariable Long id, @RequestBody Mouvement mouvement) {
        return mouvementService.update(id, mouvement);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        mouvementService.delete(id);
    }
}
