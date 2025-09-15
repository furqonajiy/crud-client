package com.furqonajiy.crudclient.eventservice;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ClientEventService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /** Subscribe to the stream (no timeout). */
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        this.emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("INIT").data("connected"));
        } catch (IOException ignored) {}
        return emitter;
    }

    /** Broadcast a single event to all subscribers. */
    public void publish(ClientEvent event) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(event.getType().name())
                        .data(event));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
