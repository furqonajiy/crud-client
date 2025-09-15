package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.*;

import java.util.List;

public interface IClientService {
    ClientResponse createClient(CreateClientRequest req);
    ClientResponse createClients(List<CreateClientRequest> reqs);
    ClientResponse getAllClients();
    ClientResponse updateClient(UpdateClientRequest req);
    ClientResponse deleteMultipleClients(DeleteClientsRequest req);
}