package com.furqonajiy.crudclient.controller;

import com.furqonajiy.crudclient.model.ClientDto;
import com.furqonajiy.crudclient.model.ClientResponse;
import com.furqonajiy.crudclient.model.DeleteClientsRequest;
import com.furqonajiy.crudclient.model.DeleteClientsResponse;
import com.furqonajiy.crudclient.service.ClientService;
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

    @DeleteMapping
    @ResponseStatus(HttpStatus.OK)
    public DeleteClientsResponse deleteMany(@Valid @RequestBody DeleteClientsRequest req) {
        return clientService.deleteMany(req);
    }
}
