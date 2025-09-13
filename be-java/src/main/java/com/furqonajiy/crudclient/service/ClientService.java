package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.*;
import com.furqonajiy.crudclient.repository.ClientRepository;
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
    public List<ClientDto> createClient(CreateClientRequest req) {
        var e = new ClientEntity();
        e.setFullName(req.getFullName());
        e.setDisplayName(req.getDisplayName());
        e.setEmail(req.getEmail());
        e.setDetails(req.getDetails());
        e.setActive(req.isActive());
        e.setLocation(req.getLocation());
        e.setCountry(req.getCountry());
        repo.save(e);

        return toDtoList(repo.findAll());
    }

    @Override
    public List<ClientDto> getAllClients() {
        return toDtoList(repo.findAll());
    }

    @Override
    @Transactional
    public List<ClientDto> updateClient(UpdateClientRequest req) {
        var e = repo.findById(req.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Client not found: " + req.getId()));

        if (req.getFullName() != null) {
            e.setFullName(req.getFullName());
        }

        if (req.getDisplayName() != null) {
            e.setDisplayName(req.getDisplayName());
        }

        if (req.getEmail() != null) {
            e.setEmail(req.getEmail());
        }

        if (req.getDetails() != null) {
            e.setDetails(req.getDetails());
        }

        e.setActive(req.isActive());

        if (req.getLocation() != null) {
            e.setLocation(req.getLocation());
        }

        if (req.getCountry() != null) {
            e.setCountry(req.getCountry());
        }

        repo.save(e);
        return toDtoList(repo.findAll());
    }

    @Override
    @Transactional
    public List<ClientDto> deleteMultipleClients(DeleteClientsRequest req) {
        var ids = req.ids().stream().filter(Objects::nonNull).distinct().toList();
        if (!ids.isEmpty()) {
            repo.deleteAllByIdInBatch(ids);
        }
        return toDtoList(repo.findAll());
    }

    private static ClientDto clientEntityToDto(ClientEntity e) {
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

    private static List<ClientDto> toDtoList(List<ClientEntity> entities) {
        return entities.stream().map(ClientService::clientEntityToDto).toList();
    }
}
