package com.furqonajiy.clients.client.service;

import com.furqonajiy.clients.client.dto.DeleteClientsRequest;
import com.furqonajiy.clients.client.dto.DeleteClientsResponse;

public interface IClientService {
    DeleteClientsResponse deleteMany(DeleteClientsRequest req);
}
