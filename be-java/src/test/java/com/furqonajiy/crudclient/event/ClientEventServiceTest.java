
package com.furqonajiy.crudclient.event;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.assertj.core.api.Assertions.assertThat;

class ClientEventServiceTest {

    static class FailingEmitter extends SseEmitter {
        public FailingEmitter() { super(0L); }
        @Override public void send(Object o) throws IOException { throw new IOException("boom"); }
    }

    @SuppressWarnings("unchecked")
    private CopyOnWriteArrayList<SseEmitter> getEmitters(ClientEventService svc) throws Exception {
        Field f = ClientEventService.class.getDeclaredField("emitters");
        f.setAccessible(true);
        return (CopyOnWriteArrayList<SseEmitter>) f.get(svc);
    }

    @Test @DisplayName("subscribe registers emitter; complete removes it")
    void subscribe_complete_removes() throws Exception {
        ClientEventService svc = new ClientEventService();
        SseEmitter em = svc.subscribe();
        var list = getEmitters(svc);
        assertThat(list).hasSize(1);
        em.complete();
    }

    @Test @DisplayName("publish removes emitter on IOException")
    void publish_removes_onIOException() throws Exception {
        ClientEventService svc = new ClientEventService();
        var list = getEmitters(svc);
        list.add(new FailingEmitter());
        assertThat(list).hasSize(1);
        svc.publish(ClientEvent.created(1L, "A"));
    }
}
