
package com.furqonajiy.crudclient.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class ClientRepositoryTest {

    @Autowired ClientRepository repo;

    private ClientEntity newE(String email) {
        ClientEntity e = new ClientEntity();
        e.setFullName("A"); e.setDisplayName("B");
        e.setEmail(email); e.setDetails("d");
        e.setActive(true); e.setLocation("Loc"); e.setCountry("NL");
        return e;
    }

    @Test @DisplayName("save generates id and findById works")
    void save_ok() {
        ClientEntity saved = repo.save(newE("x@y.com"));
        assertThat(saved.getId()).isNotNull();
        assertThat(repo.findById(saved.getId())).isPresent();
    }

    @Test @DisplayName("unique email enforced")
    void unique_violation() {
        repo.save(newE("dup@y.com"));
        assertThatThrownBy(() -> repo.saveAndFlush(newE("dup@y.com")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
