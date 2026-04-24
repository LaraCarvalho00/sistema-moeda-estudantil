package com.moedaestudantil.infrastructure.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtPropriedades(String secret, int expirationMinutes) {}
