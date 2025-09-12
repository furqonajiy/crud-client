package com.furqonajiy.clients.repo;

import com.furqonajiy.clients.client.model.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<ClientEntity, Long> {
}