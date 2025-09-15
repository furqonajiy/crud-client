package com.furqonajiy.crudclient.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateMultipleClientRequest(
        @NotEmpty List<@Valid CreateClientRequest> clients
) {}