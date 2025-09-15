
package com.furqonajiy.crudclient.config;

import com.furqonajiy.crudclient.eventservice.ClientEventService;
import com.furqonajiy.crudclient.service.ClientService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WebConfigCorsTest {

    @Autowired MockMvc mvc;
    @MockBean ClientService clientService;
    @MockBean ClientEventService eventService;

    @Test @DisplayName("CORS preflight allows localhost:4200 on /api/**")
    void preflight_ok() throws Exception {
        mvc.perform(options("/api/v1/clients")
                .header("Origin", "http://localhost:4200")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }
}
