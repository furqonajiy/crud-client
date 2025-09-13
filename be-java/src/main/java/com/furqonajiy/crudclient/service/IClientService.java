package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.ClientDto;
import com.furqonajiy.crudclient.model.DeleteClientsRequest;
import com.furqonajiy.crudclient.model.DeleteClientsResponse;

import java.util.List;

public interface IClientService {
    List<ClientDto> getAllClients();

    DeleteClientsResponse deleteMany(DeleteClientsRequest req);
}
