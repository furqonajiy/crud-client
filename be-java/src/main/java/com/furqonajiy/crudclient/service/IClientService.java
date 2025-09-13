package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.ClientResponse;
import com.furqonajiy.crudclient.model.CreateClientRequest;
import com.furqonajiy.crudclient.model.DeleteClientsRequest;
import com.furqonajiy.crudclient.model.UpdateClientRequest;

public interface IClientService {
    ClientResponse createClient(CreateClientRequest req);
    ClientResponse getAllClients();
    ClientResponse updateClient(UpdateClientRequest req);
    ClientResponse deleteMultipleClients(DeleteClientsRequest req);
}