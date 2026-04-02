package com.example.doordrop.Repository;

import com.example.doordrop.Entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {

    Optional<Seller> findByUserId(Long userId);

    Optional<Seller> findByGstNumber(String gstNumber);

    List<Seller> findByIsActiveTrue();

    List<Seller> findByIsActiveTrueAndIsVerifiedTrue();
}
