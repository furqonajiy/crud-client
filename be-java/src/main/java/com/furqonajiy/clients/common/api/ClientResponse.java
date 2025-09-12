package com.furqonajiy.clients.common.api;

import java.util.List;

public record ClientResponse<T>(List<T> clients) {
}
