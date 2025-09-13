package com.furqonajiy.crudclient.repository;

import com.furqonajiy.crudclient.model.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<ClientEntity, Long> {
}