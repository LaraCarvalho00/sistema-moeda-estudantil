package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.domain.port.UsuarioDadosAcessoPort;
import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class UsuarioAcessoAdapter implements UsuarioDadosAcessoPort {

  private final UsuarioSpringDataRepository repo;

  @Override
  public Optional<UsuarioComSenha> buscarComSenhaPorEmail(String email) {
    return repo.findByEmail(email).map(UsuarioAcessoAdapter::toAuth);
  }

  private static UsuarioComSenha toAuth(UsuarioJpaEntity e) {
    return UsuarioComSenha.builder()
        .id(e.getId())
        .email(e.getEmail())
        .hashSenha(e.getSenhaHash())
        .perfil(e.getPerfil())
        .build();
  }
}
