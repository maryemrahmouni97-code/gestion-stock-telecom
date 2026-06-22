package com.telecom.stock_management.controller;

import com.telecom.stock_management.entity.DemandeDetail;
import com.telecom.stock_management.service.DemandeDetailService;
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
@RequestMapping("/api/demande-details")
@CrossOrigin(origins = "http://localhost:5174")
public class DemandeDetailController {

    private final DemandeDetailService demandeDetailService;

    public DemandeDetailController(DemandeDetailService demandeDetailService) {
        this.demandeDetailService = demandeDetailService;
    }

    @GetMapping
    public List<DemandeDetail> findAll(@RequestParam(required = false) Long demandeId) {
        if (demandeId != null) {
            return demandeDetailService.findByDemandeId(demandeId);
        }
        return demandeDetailService.findAll();
    }

    @GetMapping("/{id}")
    public DemandeDetail findById(@PathVariable Long id) {
        return demandeDetailService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DemandeDetail create(@RequestBody DemandeDetail demandeDetail) {
        return demandeDetailService.create(demandeDetail);
    }

    @PutMapping("/{id}")
    public DemandeDetail update(@PathVariable Long id, @RequestBody DemandeDetail demandeDetail) {
        return demandeDetailService.update(id, demandeDetail);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        demandeDetailService.delete(id);
    }
}
