package com.furqonajiy.crudclient.model;

import java.util.List;

public record ClientResponse<T>(List<T> clients) {
}
