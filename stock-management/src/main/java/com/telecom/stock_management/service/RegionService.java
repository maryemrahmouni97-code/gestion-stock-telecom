package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.Region;
import com.telecom.stock_management.repository.RegionRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RegionService {

    private final RegionRepository regionRepository;

    public RegionService(RegionRepository regionRepository) {
        this.regionRepository = regionRepository;
    }

    public List<Region> findAll() {
        return regionRepository.findAll();
    }

    public Region findById(Long id) {
        return regionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Region not found"));
    }

    public Region create(Region region) {
        region.setId(null);
        return regionRepository.save(region);
    }

    public Region update(Long id, Region region) {
        findById(id);
        region.setId(id);
        return regionRepository.save(region);
    }

    public void delete(Long id) {
        Region region = findById(id);
        regionRepository.delete(region);
    }
}
