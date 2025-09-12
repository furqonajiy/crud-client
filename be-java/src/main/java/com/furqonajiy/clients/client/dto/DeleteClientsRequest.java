package com.furqonajiy.clients.client.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record DeleteClientsRequest(
        @NotEmpty(message = "ids must not be empty")
        List<Long> ids
) { }