package com.moedaestudantil.web.it;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class ApiSmokeTest {

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine")
          .withDatabaseName("moeda")
          .withUsername("moeda")
          .withPassword("moeda");

  @DynamicPropertySource
  static void props(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    r.add("spring.datasource.username", POSTGRES::getUsername);
    r.add("spring.datasource.password", POSTGRES::getPassword);
  }

  @Autowired TestRestTemplate rest;

  @Test
  void instituicoes_publicas_incluem_seed() {
    var res = rest.getForEntity("/api/v1/instituicoes", String.class);
    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(res.getBody()).contains("Universidade Demo Sul");
  }

  @Test
  void login_professor_demo_retorna_token() {
    var res =
        rest.postForEntity(
            "/api/v1/auth/entrar",
            Map.of("email", "prof1@demo.com", "senha", "senha123"),
            String.class);
    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(res.getBody()).contains("accessToken");
  }

  @Test
  void cadastro_persiste_no_modelo_unico_de_usuarios_e_permite_login() {
    String email = "novo.aluno@teste.local";
    var cadastro =
        rest.postForEntity(
            "/api/v1/auth/registrar",
            Map.of(
                "email", email,
                "senha", "senha123",
                "nome", "Novo Aluno",
                "perfil", "ALUNO",
                "instituicaoId", 1,
                "telefone", "(31) 99999-8888"),
            String.class);

    assertThat(cadastro.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(cadastro.getBody())
        .contains("\"email\":\"novo.aluno@teste.local\"")
        .contains("\"telefone\":\"31999998888\"")
        .contains("\"perfil\":\"ALUNO\"");

    var login =
        rest.postForEntity(
            "/api/v1/auth/entrar",
            Map.of("email", email, "senha", "senha123"),
            String.class);
    assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(login.getBody()).contains("accessToken");
  }

  @Test
  void cadastro_rejeita_perfil_ausente() {
    var res =
        rest.postForEntity(
            "/api/v1/auth/registrar",
            Map.of(
                "email", "sem.perfil@teste.local",
                "senha", "senha123",
                "nome", "Sem Perfil",
                "instituicaoId", 1),
            String.class);

    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(res.getBody()).contains("perfil");
  }
}
