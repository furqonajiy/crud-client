package com.furqonajiy.crudclient.model;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class DeleteMultipleClientRequest {
        @NotEmpty(message = "ids must not be empty")
        private List<Long> ids;
}