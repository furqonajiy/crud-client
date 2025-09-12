package com.furqonajiy.clients.client.service;

import com.furqonajiy.clients.client.dto.DeleteClientsRequest;
import com.furqonajiy.clients.client.dto.DeleteClientsResponse;
import com.furqonajiy.clients.client.model.ClientEntity;
import com.furqonajiy.clients.repo.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ClientServiceImpl implements IClientService {

    private final ClientRepository repo;

    public ClientServiceImpl(ClientRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public DeleteClientsResponse deleteMany(DeleteClientsRequest req) {
        // de-dup and normalize input
        List<Long> requested = req.ids().stream().filter(Objects::nonNull).distinct().toList();
        if (requested.isEmpty()) {
            return new DeleteClientsResponse(0, List.of(), List.of());
        }

        // find what actually exists
        List<ClientEntity> existing = repo.findAllById(requested);
        List<Long> existingIds = existing.stream().map(ClientEntity::getId).collect(Collectors.toList());

        // delete in batch (single SQL)
        if (!existingIds.isEmpty()) {
            repo.deleteAllByIdInBatch(existingIds);
        }

        // compute not-found = requested - existing
        Set<Long> existingSet = new HashSet<>(existingIds);
        List<Long> notFound = requested.stream().filter(id -> !existingSet.contains(id)).toList();

        return new DeleteClientsResponse(existingIds.size(), existingIds, notFound);
    }
}
