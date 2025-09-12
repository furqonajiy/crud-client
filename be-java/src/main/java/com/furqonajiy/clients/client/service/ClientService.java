package com.furqonajiy.clients.client.service;

import com.furqonajiy.clients.client.dto.ClientDto;
import com.furqonajiy.clients.client.model.ClientEntity;
import com.furqonajiy.clients.repo.ClientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class ClientService {
    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<ClientDto> getAllClients() {
        return clientRepository.findAll().stream().map(this::clientEntityToClientDto).toList();
    }

    private ClientDto clientEntityToClientDto(ClientEntity clientEntity) {
        ClientDto clientDto = new ClientDto();
        clientDto.id = clientEntity.getId();
        clientDto.fullName = clientEntity.getFullName();
        clientDto.displayName = clientEntity.getDisplayName();
        clientDto.email = clientEntity.getEmail();
        clientDto.details = clientEntity.getDetails();
        clientDto.active = clientEntity.getActive();
        clientDto.location = clientEntity.getLocation();
        clientDto.country = clientEntity.getCountry();
        return clientDto;
    }
}
