package com.furqonajiy.crudclient.model;

import java.util.List;

public record DeleteClientsResponse(
        int deletedCount,
        List<Long> deletedIds,
        List<Long> notFoundIds
) {
}
