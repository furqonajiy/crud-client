package com.furqonajiy.crudclient.event;

import lombok.Data;

import java.time.Instant;

@Data
public class ClientEvent {
    private ClientEventType type;
    private Long clientId;         // optional
    private String displayName;    // optional
    private String message;        // optional
    private Instant at = Instant.now();

    public ClientEvent(ClientEventType type, Long clientId, String displayName, String message) {
        this.type = type;
        this.clientId = clientId;
        this.displayName = displayName;
        this.message = message;
    }

    public static ClientEvent created(Long id, String name) {
        return new ClientEvent(ClientEventType.CREATED, id, name, null);
    }

    public static ClientEvent updated(Long id, String name) {
        return new ClientEvent(ClientEventType.UPDATED, id, name, null);
    }

    public static ClientEvent deleted(Long id) {
        return new ClientEvent(ClientEventType.DELETED, id, null, null);
    }
}
