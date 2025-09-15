package com.furqonajiy.crudclient.controller;

import com.furqonajiy.crudclient.event.ClientEvent;
import com.furqonajiy.crudclient.event.ClientEventService;
import com.furqonajiy.crudclient.model.*;
import com.furqonajiy.crudclient.service.ClientService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {
    private final ClientService service;
    private final ClientEventService eventService;

    public ClientController(ClientService service, ClientEventService eventService) {
        this.service = service;
        this.eventService = eventService;
    }

    @GetMapping
    public ClientResponse getAll() {
        log.debug("Start Get All Clients API");
        return service.getAllClients();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse create(@Valid @RequestBody CreateClientRequest req) {
        log.debug("Start Create Client API");
        ClientResponse res = service.createClient(req);
        eventService.publish(ClientEvent.created(null, req.getDisplayName()));
        return res;
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse bulkCreate(@Valid @RequestBody List<@Valid CreateClientRequest> reqs) {
        log.debug("Start Bulk Create Client API ({} items)", reqs.size());
        var res = service.createClients(reqs);

        eventService.publish(ClientEvent.created(null, reqs.getFirst().getDisplayName()));
        return res;
    }

    @PutMapping
    public ClientResponse update(@Valid @RequestBody UpdateClientRequest req) {
        log.debug("Start Update Client API");
        ClientResponse res = service.updateClient(req);
        eventService.publish(ClientEvent.updated(req.getId(), req.getDisplayName()));
        return res;
    }

    @DeleteMapping
    public ClientResponse deleteMany(@Valid @RequestBody DeleteClientsRequest req) {
        log.debug("Start Delete Many Clients API");
        ClientResponse res = service.deleteMultipleClients(req);
        if (req.getIds() != null) {
            req.getIds().forEach(id -> eventService.publish(ClientEvent.deleted(id)));
        }
        return res;
    }

    // ===== SSE endpoint =====
    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping(value = "/events")
    public SseEmitter events() {
        log.debug("Event");
        return eventService.subscribe();
    }
}
