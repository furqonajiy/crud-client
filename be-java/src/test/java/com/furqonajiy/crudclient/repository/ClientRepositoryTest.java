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

    @Autowired
    ClientRepository repo;

    private ClientEntity newEntity(String email) {
        ClientEntity e = new ClientEntity();
        e.setFullName("John Wick");
        e.setDisplayName("John W.");
        e.setEmail(email);
        e.setDetails("legendary");
        e.setActive(true);
        e.setLocation("New York, USA");
        e.setCountry("USA");
        return e;
    }

    @Test
    @DisplayName("save and find work, id generated")
    void save_ok() {
        ClientEntity saved = repo.save(newEntity("john@wick.com"));
        assertThat(saved.getId()).isNotNull();
        assertThat(repo.findById(saved.getId())).isPresent();
    }

    @Test
    @DisplayName("email unique constraint enforced")
    void uniqueEmail_violation() {
        repo.save(newEntity("dup@x.com"));
        assertThatThrownBy(() -> repo.saveAndFlush(newEntity("dup@x.com")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("not null constraints enforced (fullName, email)")
    void notNull_violation() {
        ClientEntity e = newEntity("z@y.com");
        e.setFullName(null);
        assertThatThrownBy(() -> repo.saveAndFlush(e))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}