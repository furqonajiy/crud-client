package com.furqonajiy.crudclient.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClientDto {
    private Long id;
    private String fullName;
    private String displayName;
    private String email;
    private String details;
    private Boolean active;
    private String location;
    private String country;
}