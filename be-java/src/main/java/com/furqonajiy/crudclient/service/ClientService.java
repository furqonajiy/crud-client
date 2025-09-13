package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.ClientDto;
import com.furqonajiy.crudclient.model.ClientEntity;
import com.furqonajiy.crudclient.model.DeleteClientsRequest;
import com.furqonajiy.crudclient.model.DeleteClientsResponse;
import com.furqonajiy.crudclient.repository.ClientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ClientService implements IClientService {
    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<ClientDto> getAllClients() {
        return clientRepository.findAll().stream().map(this::clientEntityToClientDto).toList();
    }

    private ClientDto clientEntityToClientDto(ClientEntity clientEntity) {
        ClientDto clientDto = new ClientDto();
        clientDto.setId(clientEntity.getId());
        clientDto.setFullName(clientEntity.getFullName());
        clientDto.setDisplayName(clientEntity.getDisplayName());
        clientDto.setEmail(clientEntity.getEmail());
        clientDto.setDetails(clientEntity.getDetails());
        clientDto.setActive(clientEntity.getActive());
        clientDto.setLocation(clientEntity.getLocation());
        clientDto.setCountry(clientEntity.getCountry());
        return clientDto;
    }

    @Override
    @Transactional
    public DeleteClientsResponse deleteMany(DeleteClientsRequest req) {
        // de-dup and normalize input
        List<Long> idReq = req.ids().stream().filter(Objects::nonNull).distinct().toList();
        if (idReq.isEmpty()) {
            return new DeleteClientsResponse(0, List.of(), List.of());
        }

        // find what actually exists
        List<ClientEntity> existing = clientRepository.findAllById(idReq);
        List<Long> existingIds = existing.stream().map(ClientEntity::getId).collect(Collectors.toList());

        // delete in batch (single SQL)
        if (!existingIds.isEmpty()) {
            clientRepository.deleteAllByIdInBatch(existingIds);
        }

        // compute not-found = requested - existing
        Set<Long> existingSet = new HashSet<>(existingIds);
        List<Long> notFound = idReq.stream().filter(id -> !existingSet.contains(id)).toList();

        return new DeleteClientsResponse(existingIds.size(), existingIds, notFound);
    }
}
