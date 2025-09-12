package com.furqonajiy.clients.common.api;

import java.util.List;

public record ClientsResponse<T>(List<T> clients) {
}
