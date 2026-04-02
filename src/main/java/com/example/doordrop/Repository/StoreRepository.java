package com.example.doordrop.Repository;

import com.example.doordrop.Entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {

    /** All active, currently-open stores — used for proximity search. */
    List<Store> findByIsActiveTrueAndIsOpenTrue();

    /** Look up the store owned by a given user (STORE_OWNER role). */
    Optional<Store> findByUserId(Long userId);

    List<Store> findByIsActiveTrue();
}
