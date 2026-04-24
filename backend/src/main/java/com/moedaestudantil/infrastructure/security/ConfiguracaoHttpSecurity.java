package com.moedaestudantil.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
class ConfiguracaoHttpSecurity {

  private final JwtFiltroHttp jwtFiltroHttp;

  @Bean
  SecurityFilterChain cadeia(HttpSecurity http) throws Exception {
    http.cors(
            c -> {
            })
        .csrf(cs -> cs.disable())
        .sessionManagement(
            s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            r ->
                r.requestMatchers(
                        HttpMethod.POST, "/api/v1/auth/registrar", "/api/v1/auth/entrar", "/error")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET, "/api/v1/instituicoes", "/api/v1/vantagens")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(
            jwtFiltroHttp, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  PasswordEncoder codificadorSenha() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  CorsConfigurationSource origensCors() {
    var c = new CorsConfiguration();
    c.addAllowedOriginPattern("http://localhost:*");
    c.addAllowedHeader(CorsConfiguration.ALL);
    c.addAllowedMethod(CorsConfiguration.ALL);
    c.setAllowCredentials(true);
    var s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
  }
}
