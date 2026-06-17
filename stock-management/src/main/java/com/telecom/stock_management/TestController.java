package com.telecom.stock_management;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5174")
public class TestController {

    @GetMapping("/api/test")
    public String test() {
        return "Connexion React + Spring Boot OK";
    }
}