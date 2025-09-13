package com.furqonajiy.crudclient.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClientDto {
    public Long id;
    public String fullName;
    public String displayName;
    public String email;
    public String details;
    public Boolean active;
    public String location;
    public String country;
}