
package com.furqonajiy.crudclient.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    @Test
    void handle_returns500() {
        GlobalExceptionHandler h = new GlobalExceptionHandler();
        ResponseEntity<Map<String, Object>> resp = h.handle(new RuntimeException("nope"));
        assertThat(resp.getStatusCode().value()).isEqualTo(500);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).containsKeys("timestamp", "error", "message");
    }
}
