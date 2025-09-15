package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.*;
import com.furqonajiy.crudclient.repository.ClientEntity;
import com.furqonajiy.crudclient.repository.ClientRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional(readOnly = true)
public class ClientService implements IClientService {

    private final ClientRepository repo;

    public ClientService(ClientRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public ClientResponse createClient(CreateClientRequest req) {
        repo.save(mapToEntity(req));
        return snapshot();
    }

    @Override
    @Transactional
    public ClientResponse createClients(List<CreateClientRequest> reqs) {
        if (reqs != null && !reqs.isEmpty()) {
            var entities = reqs.stream().map(this::mapToEntity).toList();
            repo.saveAll(entities);
        }
        return snapshot();
    }

    @Override
    public ClientResponse getAllClients() {
        return snapshot();
    }

    @Override
    @Transactional
    public ClientResponse updateClient(UpdateClientRequest req) {
        var e = repo.findById(req.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Client not found: " + req.getId()));

        if (req.getFullName() != null)
            e.setFullName(req.getFullName());
        if (req.getDisplayName() != null)
            e.setDisplayName(req.getDisplayName());
        if (req.getEmail() != null)
            e.setEmail(normalizeEmail(req.getEmail()));
        if (req.getDetails() != null)
            e.setDetails(req.getDetails());
        e.setActive(req.isActive());
        if (req.getLocation() != null)
            e.setLocation(req.getLocation());
        if (req.getCountry() != null)
            e.setCountry(req.getCountry());

        repo.save(e);
        return snapshot();
    }

    @Override
    @Transactional
    public ClientResponse deleteMultipleClients(DeleteMultipleClientRequest req) {
        var ids = req.getIds().stream().filter(Objects::nonNull).distinct().toList();
        if (!ids.isEmpty()) {
            repo.deleteAllByIdInBatch(ids);
        }
        return snapshot();
    }

    // ---- helpers ----

    private ClientEntity mapToEntity(CreateClientRequest req) {
        var e = new ClientEntity();
        e.setFullName(req.getFullName());
        e.setDisplayName(req.getDisplayName());
        e.setEmail(normalizeEmail(req.getEmail()));
        e.setDetails(req.getDetails());
        e.setActive(req.isActive());
        e.setLocation(req.getLocation());
        e.setCountry(req.getCountry());
        return e;
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private ClientDto toDto(ClientEntity e) {
        return new ClientDto(
                e.getId(),
                e.getFullName(),
                e.getDisplayName(),
                e.getEmail(),
                e.getDetails(),
                e.isActive(),
                e.getLocation(),
                e.getCountry()
        );
    }

    /**
     * Returns full list sorted by id ASC (done by DB).
     */
    private ClientResponse snapshot() {
        var dtos = repo.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toDto)
                .toList();
        return new ClientResponse(dtos);
    }
}
