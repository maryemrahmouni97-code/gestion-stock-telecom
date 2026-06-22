package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.Materiel;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterielRepository extends JpaRepository<Materiel, Long> {
    Optional<Materiel> findByReference(String reference);
}
