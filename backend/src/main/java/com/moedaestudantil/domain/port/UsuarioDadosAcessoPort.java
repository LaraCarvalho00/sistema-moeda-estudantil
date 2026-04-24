package com.moedaestudantil.domain.port;

import com.moedaestudantil.domain.model.TipoPerfil;
import java.util.Optional;
import lombok.Builder;
import lombok.Value;

/**
 * Leitura de credenciais para autenticação; mantém o hash fora de {@code Usuario} de domínio
 * exibido à API.
 */
public interface UsuarioDadosAcessoPort {

  Optional<UsuarioComSenha> buscarComSenhaPorEmail(String email);

  @Value
  @Builder
  class UsuarioComSenha {
    Long id;
    String email;
    String hashSenha;
    TipoPerfil perfil;
  }
}
