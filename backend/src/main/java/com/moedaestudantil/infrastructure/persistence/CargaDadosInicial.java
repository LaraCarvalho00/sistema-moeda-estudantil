package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.infrastructure.persistence.jpa.InstituicaoJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
class CargaDadosInicial {

  private final InstituicaoSpringDataRepository instituicoes;

  @Bean
  CommandLineRunner inserirInstituicaoExemplo() {
    return ars -> {
      if (instituicoes.count() == 0) {
        var i = new InstituicaoJpaEntity();
        i.setNome("Instituição de Ensino (exemplo)");
        instituicoes.save(i);
      }
    };
  }
}
