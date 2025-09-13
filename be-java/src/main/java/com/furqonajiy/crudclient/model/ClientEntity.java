package com.furqonajiy.crudclient.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(schema = "public", name = "clients")
public class ClientEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "display_name", nullable = false, length = 80)
    private String displayName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private Boolean active;

    @Column()
    private String location;

    @Column()
    private String country;
}