package com.practice.foodordering.repository;

import com.practice.foodordering.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<AppUser, UUID> {
    @Query("SELECT u FROM AppUser u WHERE u.phoneOrEmail = :val")
    Optional<AppUser> findByPhoneOrEmail(@Param("val") String val);
}
