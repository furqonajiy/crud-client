package com.furqonajiy.clients.client.dto;

import java.util.List;

public record DeleteClientsResponse(
        int deletedCount,
        List<Long> deletedIds,
        List<Long> notFoundIds
) {
}
