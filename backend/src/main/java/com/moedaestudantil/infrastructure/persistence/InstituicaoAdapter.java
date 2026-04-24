package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.Instituicao;
import com.moedaestudantil.domain.port.InstituicaoPort;
import com.moedaestudantil.infrastructure.persistence.jpa.InstituicaoJpaEntity;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class InstituicaoAdapter implements InstituicaoPort {

  private final InstituicaoSpringDataRepository repo;

  @Override
  public List<Instituicao> listarTodas() {
    return repo.findAll().stream().map(this::map).toList();
  }

  @Override
  public Instituicao buscarObrigatario(Long id) {
    return repo
        .findById(id)
        .map(this::map)
        .orElseThrow(() -> new RegraDeNegocio("Instituição inexistente."));
  }

  private Instituicao map(InstituicaoJpaEntity e) {
    return Instituicao.builder().id(e.getId()).nome(e.getNome()).build();
  }
}
