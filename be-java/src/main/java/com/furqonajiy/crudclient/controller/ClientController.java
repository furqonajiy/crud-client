package com.furqonajiy.crudclient.controller;

import com.furqonajiy.crudclient.model.*;
import com.furqonajiy.crudclient.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {

    private final ClientService service;

    public ClientController(ClientService service) {
        this.service = service;
    }

    @GetMapping
    public ClientResponse getAll() {
        return service.getAllClients();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse create(@Valid @RequestBody CreateClientRequest req) {
        return service.createClient(req);
    }

    @PutMapping
    public ClientResponse update(@Valid @RequestBody UpdateClientRequest req) {
        return service.updateClient(req);
    }

    @DeleteMapping
    public ClientResponse deleteMany(@Valid @RequestBody DeleteClientsRequest req) {
        return service.deleteMultipleClients(req);
    }
}
