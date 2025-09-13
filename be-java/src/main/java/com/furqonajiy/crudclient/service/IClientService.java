package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.ClientDto;
import com.furqonajiy.crudclient.model.CreateClientRequest;
import com.furqonajiy.crudclient.model.DeleteClientsRequest;
import com.furqonajiy.crudclient.model.UpdateClientRequest;

import java.util.List;

public interface IClientService {
    List<ClientDto> createClient(CreateClientRequest req);
    List<ClientDto> getAllClients();
    List<ClientDto> updateClient(UpdateClientRequest req);
    List<ClientDto> deleteMultipleClients(DeleteClientsRequest req);
}