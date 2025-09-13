package com.furqonajiy.crudclient.model;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateClientRequest {
    @NotNull
    private Long id;

    private String fullName;
    private String displayName;
    private String email;
    private String details;
    private boolean active;    // boxed for nullability
    private String location;
    private String country;
}
