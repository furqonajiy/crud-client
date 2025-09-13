package com.furqonajiy.crudclient.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClientDto {
    private Long id;
    private String fullName;
    private String displayName;
    private String email;
    private String details;
    private boolean active;
    private String location;
    private String country;
}