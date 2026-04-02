package com.example.doordrop.Repository;

import com.example.doordrop.Entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);

    List<Address> findByUserId(Long userId);
}
