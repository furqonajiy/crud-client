package com.furqonajiy.clients.client.web;

import com.furqonajiy.clients.client.dto.ClientDto;
import com.furqonajiy.clients.client.service.ClientService;
import com.furqonajiy.clients.common.api.ClientResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @Operation(
            summary = "Getll All Clients",
            description = "Returns all clients from database")
    @GetMapping
    public Object getAllClients() {
        log.debug("Execute Get All Clients");

        List<ClientDto> data = clientService.getAllClients();
        return new ClientResponse<>(data);
    }
}
