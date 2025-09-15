
package com.furqonajiy.crudclient.service;

import com.furqonajiy.crudclient.model.*;
import com.furqonajiy.crudclient.repository.ClientEntity;
import com.furqonajiy.crudclient.repository.ClientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceUnitTest {

    @Mock ClientRepository repo;
    @InjectMocks ClientService svc;

    private ClientEntity entity(long id, String email) {
        ClientEntity e = new ClientEntity();
        e.setId(id);
        e.setFullName("Full");
        e.setDisplayName("Disp");
        e.setEmail(email);
        e.setDetails("d");
        e.setActive(true);
        e.setLocation("Loc");
        e.setCountry("NL");
        return e;
    }

    @Test @DisplayName("getAllClients sorts by id and maps to response")
    void getAll_ok() {
        when(repo.findAll(any(Sort.class))).thenReturn(List.of(entity(2L, "b@x.com"), entity(1L, "a@x.com")));
        ClientResponse res = svc.getAllClients();
        assertThat(res.getClients()).hasSize(2);
        ArgumentCaptor<Sort> sortCap = ArgumentCaptor.forClass(Sort.class);
        verify(repo).findAll(sortCap.capture());
        assertThat(sortCap.getValue()).isNotNull();
    }

    @Test @DisplayName("createClient normalizes email and saves")
    void create_ok() {
        when(repo.findAll(any(Sort.class))).thenReturn(List.of(entity(1L, "john@email.com")));
        CreateClientRequest req = new CreateClientRequest();
        req.setFullName("John"); req.setDisplayName("J"); req.setEmail(" John@Email.COM ");
        req.setActive(true); req.setCountry("NL");
        svc.createClient(req);
        ArgumentCaptor<ClientEntity> cap = ArgumentCaptor.forClass(ClientEntity.class);
        verify(repo).save(cap.capture());
        assertThat(cap.getValue().getEmail()).isEqualTo("john@email.com");
    }

    @Test @DisplayName("createClients saveAll mapped list")
    void createMany_ok() {
        when(repo.findAll(any(Sort.class))).thenReturn(List.of());
        CreateClientRequest a = new CreateClientRequest();
        a.setFullName("A"); a.setDisplayName("AA"); a.setEmail("a@x.com"); a.setCountry("NL");
        CreateClientRequest b = new CreateClientRequest();
        b.setFullName("B"); b.setDisplayName("BB"); b.setEmail("b@x.com"); b.setCountry("NL");
        svc.createClients(List.of(a,b));
        ArgumentCaptor<List<ClientEntity>> cap = ArgumentCaptor.forClass(List.class);
        verify(repo).saveAll(cap.capture());
        assertThat(cap.getValue()).hasSize(2);
    }

    @Test @DisplayName("updateClient applies fields and normalizes email")
    void update_ok() {
        ClientEntity existing = entity(10L, "old@x.com");
        when(repo.findById(10L)).thenReturn(Optional.of(existing));
        when(repo.findAll(any(Sort.class))).thenReturn(List.of(existing));
        UpdateClientRequest req = new UpdateClientRequest();
        req.setId(10L);
        req.setEmail(" New@X.Com ");
        req.setFullName("New Name");
        req.setActive(false);
        req.setLocation("L2"); req.setCountry("C2"); req.setDetails("d2");
        svc.updateClient(req);
        assertThat(existing.getEmail()).isEqualTo("new@x.com");
        assertThat(existing.getFullName()).isEqualTo("New Name");
        assertThat(existing.isActive()).isFalse();
        assertThat(existing.getLocation()).isEqualTo("L2");
        assertThat(existing.getCountry()).isEqualTo("C2");
        assertThat(existing.getDetails()).isEqualTo("d2");
        verify(repo).save(existing);
    }

    @Test @DisplayName("updateClient throws when missing")
    void update_notFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        UpdateClientRequest req = new UpdateClientRequest();
        req.setId(99L);
        assertThatThrownBy(() -> svc.updateClient(req))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test @DisplayName("deleteMultipleClients filters nulls & duplicates")
    void deleteMany_ok() {
        when(repo.findAll(any(Sort.class))).thenReturn(List.of());
        DeleteClientsRequest req = new DeleteClientsRequest();
        req.setIds(List.of(2L, 1L, 4L, 3L));
        svc.deleteMultipleClients(req);
        ArgumentCaptor<List<Long>> cap = ArgumentCaptor.forClass(List.class);
        verify(repo).deleteAllByIdInBatch(cap.capture());
        assertThat(cap.getValue()).containsExactlyInAnyOrder(1L, 2L, 3L, 4L);
    }
}
