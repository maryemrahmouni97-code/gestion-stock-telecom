package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.Stock;
import com.telecom.stock_management.repository.StockRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    public List<Stock> findAll() {
        return stockRepository.findAll();
    }

    public List<Stock> findByRegionId(Long regionId) {
        return stockRepository.findByRegionId(regionId);
    }

    public Stock findById(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stock not found"));
    }

    public Stock create(Stock stock) {
        stock.setId(null);
        return stockRepository.save(stock);
    }

    public Stock update(Long id, Stock stock) {
        findById(id);
        stock.setId(id);
        return stockRepository.save(stock);
    }

    public void delete(Long id) {
        Stock stock = findById(id);
        stockRepository.delete(stock);
    }
}
