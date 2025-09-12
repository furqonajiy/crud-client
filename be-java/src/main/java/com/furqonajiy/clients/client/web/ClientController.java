package com.furqonajiy.clients.client.web;

import com.furqonajiy.clients.client.dto.ClientDto;
import com.furqonajiy.clients.client.dto.DeleteClientsRequest;
import com.furqonajiy.clients.client.dto.DeleteClientsResponse;
import com.furqonajiy.clients.client.service.ClientService;
import com.furqonajiy.clients.client.service.ClientServiceImpl;
import com.furqonajiy.clients.common.api.ClientResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {
    private final ClientService clientService;
    private final ClientServiceImpl clientServiceImpl;

    public ClientController(ClientService clientService, ClientServiceImpl clientServiceImpl) {
        this.clientService = clientService;
        this.clientServiceImpl = clientServiceImpl;
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

    @DeleteMapping
    @ResponseStatus(HttpStatus.OK)
    public DeleteClientsResponse deleteMany(@Valid @RequestBody DeleteClientsRequest req) {
        return clientServiceImpl.deleteMany(req);
    }
}
