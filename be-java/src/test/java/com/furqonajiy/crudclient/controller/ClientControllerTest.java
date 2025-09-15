package com.furqonajiy.crudclient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.furqonajiy.crudclient.eventservice.ClientEvent;
import com.furqonajiy.crudclient.eventservice.ClientEventService;
import com.furqonajiy.crudclient.eventservice.ClientEventType;
import com.furqonajiy.crudclient.model.ClientDto;
import com.furqonajiy.crudclient.model.ClientResponse;
import com.furqonajiy.crudclient.model.CreateClientRequest;
import com.furqonajiy.crudclient.model.DeleteMultipleClientRequest;
import com.furqonajiy.crudclient.model.UpdateClientRequest;
import com.furqonajiy.crudclient.service.ClientService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Controller slice tests. */
@WebMvcTest(controllers = ClientController.class)
class ClientControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    ClientService clientService;

    @MockBean
    ClientEventService eventService;

    private ClientResponse sampleResponse() {
        ClientDto dto = new ClientDto(1L, "John Wick", "John W.", "john@wick.com",
                "legendary", true, "New York, USA", "USA");
        return new ClientResponse(List.of(dto));
    }

    @Test
    @DisplayName("GET /api/v1/clients returns clients from service")
    void getAll_ok() throws Exception {
        when(clientService.getAllClients()).thenReturn(sampleResponse());

        mvc.perform(get("/api/v1/clients"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.clients[0].fullName").value("John Wick"))
                .andExpect(jsonPath("$.clients[0].active").value(true));

        verify(clientService, times(1)).getAllClients();
        verifyNoInteractions(eventService);
    }

    @Test
    @DisplayName("POST /api/v1/clients creates and emits CREATED event")
    void create_ok_emitsEvent() throws Exception {
        when(clientService.createClient(any(CreateClientRequest.class))).thenReturn(sampleResponse());

        CreateClientRequest req = new CreateClientRequest();
        // minimal fields for serialization; validations are skipped at controller-slice
        req.setFullName("Bruce Wayne");
        req.setDisplayName("Batman");
        req.setEmail("batman@gotham.com");
        req.setDetails("Dark Knight");
        req.setActive(true);
        req.setLocation("Gotham");
        req.setCountry("USA");

        mvc.perform(post("/api/v1/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clients[0].fullName").value("John Wick"));

        // capture emitted event
        ArgumentCaptor<ClientEvent> captor = ArgumentCaptor.forClass(ClientEvent.class);
        verify(eventService, times(1)).publish(captor.capture());
        ClientEvent ev = captor.getValue();
        assertThat(ev.getType()).isEqualTo(ClientEventType.CREATED);
        assertThat(ev.getDisplayName()).isEqualTo("Batman");

        verify(clientService, times(1)).createClient(any(CreateClientRequest.class));
    }

    @Test
    @DisplayName("PUT /api/v1/clients updates and emits UPDATED event")
    void update_ok_emitsEvent() throws Exception {
        when(clientService.updateClient(any(UpdateClientRequest.class))).thenReturn(sampleResponse());

        UpdateClientRequest req = new UpdateClientRequest();
        req.setId(42L);
        req.setDisplayName("Clark K.");
        req.setFullName("Clark Kent");
        req.setEmail("superman@dailyplanet.com");
        req.setActive(true);

        mvc.perform(put("/api/v1/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clients[0].email").value("john@wick.com"));

        ArgumentCaptor<ClientEvent> captor = ArgumentCaptor.forClass(ClientEvent.class);
        verify(eventService, times(1)).publish(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(ClientEventType.UPDATED);
        assertThat(captor.getValue().getClientId()).isEqualTo(42L);
        assertThat(captor.getValue().getDisplayName()).isEqualTo("Clark K.");
    }

    @Test
    @DisplayName("DELETE /api/v1/clients deletes many and emits DELETED events for each id")
    void deleteMany_ok_emitsEvents() throws Exception {
        when(clientService.deleteMultipleClients(any(DeleteMultipleClientRequest.class))).thenReturn(sampleResponse());

        DeleteMultipleClientRequest req = new DeleteMultipleClientRequest();
        req.setIds(List.of(5L, 6L));

        mvc.perform(delete("/api/v1/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clients").isArray());

        // verify publish called twice (for 2 ids)
        verify(eventService, times(2)).publish(any(ClientEvent.class));
    }

    @Test
    @DisplayName("GET /api/v1/clients/events subscribes to SSE")
    void sse_subscribe_ok() throws Exception {
        when(eventService.subscribe()).thenReturn(new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L));
        mvc.perform(get("/api/v1/clients/events"))
                .andExpect(status().isOk());
        verify(eventService, times(1)).subscribe();
    }
}