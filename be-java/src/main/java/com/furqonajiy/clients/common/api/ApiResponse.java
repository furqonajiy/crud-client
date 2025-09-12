package com.furqonajiy.clients.common.api;

import java.util.List;

public record ApiResponse<T>(List<T> clients) {
}
