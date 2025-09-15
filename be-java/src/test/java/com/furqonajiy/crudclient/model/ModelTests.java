
package com.furqonajiy.crudclient.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.furqonajiy.crudclient.event.ClientEvent;
import com.furqonajiy.crudclient.event.ClientEventType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ModelTests {

    @Test
    void clientResponse_serializesClientsArray() throws Exception {
        ObjectMapper om = new ObjectMapper();
        ClientResponse resp = new ClientResponse(List.of(new ClientDto(1L,"F","D","e@x.com",null,true,null,null)));
        String json = om.writeValueAsString(resp);
        assertThat(json).contains("\"clients\"");
        assertThat(json).contains("\"id\":1");
    }

    @Test
    void clientEvent_factories() {
        ClientEvent c = ClientEvent.created(1L, "A");
        ClientEvent u = ClientEvent.updated(2L, "B");
        ClientEvent d = ClientEvent.deleted(3L);
        assertThat(c.getType()).isEqualTo(ClientEventType.CREATED);
        assertThat(u.getType()).isEqualTo(ClientEventType.UPDATED);
        assertThat(d.getType()).isEqualTo(ClientEventType.DELETED);
        assertThat(c.getAt()).isNotNull();
    }
}
