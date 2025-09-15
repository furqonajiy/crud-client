
package com.furqonajiy.crudclient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.furqonajiy.crudclient.event.ClientEventService;
import com.furqonajiy.crudclient.model.*;
import com.furqonajiy.crudclient.service.ClientService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ClientController.class)
class ClientControllerWebTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockBean ClientService clientService;
    @MockBean ClientEventService eventService;

    private ClientResponse sample() {
        ClientDto dto = new ClientDto(1L, "Full", "Disp", "a@b.com", "d", true, "Loc", "NL");
        return new ClientResponse(List.of(dto));
    }

    @Test @DisplayName("GET /api/v1/clients -> 200")
    void getAll_ok() throws Exception {
        when(clientService.getAllClients()).thenReturn(sample());
        mvc.perform(get("/api/v1/clients"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.clients[0].email").value("a@b.com"));
        verify(clientService).getAllClients();
    }

    @Test @DisplayName("POST /api/v1/clients -> 201 Created")
    void create_ok() throws Exception {
        when(clientService.createClient(any(CreateClientRequest.class))).thenReturn(sample());
        CreateClientRequest req = new CreateClientRequest();
        req.setFullName("A"); req.setDisplayName("B"); req.setEmail("a@b.com"); req.setCountry("NL"); req.setActive(true);
        mvc.perform(post("/api/v1/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.clients.length()").value(1));
    }

    @Test @DisplayName("POST /api/v1/clients/bulk expects raw array payload -> 201")
    void bulk_ok_rawArray() throws Exception {
        when(clientService.createClients(any(List.class))).thenReturn(new ClientResponse(List.of()));
        String payload = """
        [
          {"fullName":"A","displayName":"AA","email":"a@x.com","active":true,"country":"NL"},
          {"fullName":"B","displayName":"BB","email":"b@x.com","active":false,"country":"NL"}
        ]
        """;
        mvc.perform(post("/api/v1/clients/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().is2xxSuccessful());
        ArgumentCaptor<List<CreateClientRequest>> cap = ArgumentCaptor.forClass(List.class);
        verify(clientService).createClients(cap.capture());
        assertThat(cap.getValue()).hasSize(2);
    }

    @Test @DisplayName("PUT /api/v1/clients -> 200")
    void update_ok() throws Exception {
        when(clientService.updateClient(any(UpdateClientRequest.class))).thenReturn(sample());
        UpdateClientRequest req = new UpdateClientRequest();
        req.setId(7L); req.setEmail("x@y.com"); req.setFullName("X");
        mvc.perform(put("/api/v1/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk());
    }

    @Test @DisplayName("DELETE /api/v1/clients -> 200 & emits events per id")
    void delete_ok_emits() throws Exception {
        when(clientService.deleteMultipleClients(any(DeleteClientsRequest.class))).thenReturn(sample());
        DeleteClientsRequest req = new DeleteClientsRequest();
        req.setIds(List.of(5L, 6L));
        mvc.perform(delete("/api/v1/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk());
        verify(eventService, times(2)).publish(any());
    }

    @Test @DisplayName("GET /api/v1/clients/events -> 200 SSE")
    void sse_ok() throws Exception {
        when(eventService.subscribe()).thenReturn(new SseEmitter(0L));
        mvc.perform(get("/api/v1/clients/events"))
            .andExpect(status().isOk());
        verify(eventService).subscribe();
    }
}
