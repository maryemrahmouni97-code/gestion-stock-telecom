package com.telecom.stock_management.repository;

import com.telecom.stock_management.entity.User;
import com.telecom.stock_management.enums.UserRole;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findFirstByRole(UserRole role);
}
