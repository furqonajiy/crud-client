package com.furqonajiy.crudclient.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ModelSerializationTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void clientResponse_serializesWithClientsProperty() throws Exception {
        ClientDto dto = new ClientDto(1L, "A", "B", "a@b.com", null, true, null, null);
        ClientResponse resp = new ClientResponse(List.of(dto));

        String json = mapper.writeValueAsString(resp);

        assertThat(json).contains("\"clients\"");
        assertThat(json).doesNotContain("null");
    }

    @Test
    void clientDto_serializationOmitsNulls() throws Exception {
        ClientDto dto = new ClientDto(2L, "Full", "Disp", "x@y.com", null, false, null, null);
        String json = mapper.writeValueAsString(dto);
        assertThat(json).doesNotContain("null");
        assertThat(json).contains("\"fullName\":\"Full\"");
    }
}