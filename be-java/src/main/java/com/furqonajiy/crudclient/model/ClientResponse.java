package com.furqonajiy.crudclient.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    @JsonProperty("clients")
    private List<ClientDto> clients;
}
