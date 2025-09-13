package com.furqonajiy.crudclient.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateClientRequest {
    @NotBlank
    @Size(max = 120)
    private String fullName;

    @NotBlank
    @Size(max = 120)
    private String displayName;

    @NotBlank
    @Email
    String email;

    @Size(max = 1000)
    String details;

    boolean active;

    @Size(max = 100)
    String location;

    @NotBlank
    @Size(max = 100)
    String country;
}
