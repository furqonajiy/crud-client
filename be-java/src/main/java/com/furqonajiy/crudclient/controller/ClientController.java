package com.furqonajiy.crudclient.controller;

import com.furqonajiy.crudclient.model.ClientDto;
import com.furqonajiy.crudclient.model.CreateClientRequest;
import com.furqonajiy.crudclient.model.DeleteClientsRequest;
import com.furqonajiy.crudclient.model.UpdateClientRequest;
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
    public List<ClientDto> getAll() {
        return service.getAllClients();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public List<ClientDto> create(@Valid @RequestBody CreateClientRequest req) {
        return service.createClient(req);
    }

    @PutMapping
    public List<ClientDto> update(@Valid @RequestBody UpdateClientRequest req) {
        return service.updateClient(req);
    }

    @DeleteMapping
    public List<ClientDto> deleteMany(@Valid @RequestBody DeleteClientsRequest req) {
        return service.deleteMultipleClients(req);
    }
}
