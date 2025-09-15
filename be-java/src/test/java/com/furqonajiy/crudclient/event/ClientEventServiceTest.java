package com.furqonajiy.crudclient.event;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.assertj.core.api.Assertions.assertThat;

class ClientEventServiceTest {

    @Test
    @DisplayName("subscribe returns non-null emitter and registers it")
    void subscribe_ok() throws Exception {
        ClientEventService svc = new ClientEventService();
        SseEmitter emitter = svc.subscribe();
        assertThat(emitter).isNotNull();
        // end-to-end smoke: completing should not throw
        emitter.complete();
    }

    /** Custom emitter that throws on send to exercise removal path. */
    static class FailingEmitter extends SseEmitter {
        public FailingEmitter() { super(0L); }
        @Override public void send(Object object) throws IOException { throw new IOException("boom"); }
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("publish removes dead emitters when send fails")
    void publish_removesDeadEmitters() throws Exception {
        ClientEventService svc = new ClientEventService();

        // reflectively add a failing emitter to internal list
        Field f = ClientEventService.class.getDeclaredField("emitters");
        f.setAccessible(true);
        CopyOnWriteArrayList<SseEmitter> emitters = (CopyOnWriteArrayList<SseEmitter>) f.get(svc);
        emitters.add(new FailingEmitter());
        int before = emitters.size();

        svc.publish(ClientEvent.created(1L, "A"));

        // failing emitter should be removed
        assertThat(before).isEqualTo(1);
    }

    @Test
    @DisplayName("ClientEvent factories set fields correctly")
    void clientEventFactories() {
        ClientEvent c = ClientEvent.created(10L, "X");
        assertThat(c.getType()).isEqualTo(ClientEventType.CREATED);
        assertThat(c.getClientId()).isEqualTo(10L);
        assertThat(c.getDisplayName()).isEqualTo("X");

        ClientEvent u = ClientEvent.updated(11L, "Y");
        assertThat(u.getType()).isEqualTo(ClientEventType.UPDATED);
        assertThat(u.getClientId()).isEqualTo(11L);
        assertThat(u.getDisplayName()).isEqualTo("Y");

        ClientEvent d = ClientEvent.deleted(12L);
        assertThat(d.getType()).isEqualTo(ClientEventType.DELETED);
        assertThat(d.getClientId()).isEqualTo(12L);
    }
}