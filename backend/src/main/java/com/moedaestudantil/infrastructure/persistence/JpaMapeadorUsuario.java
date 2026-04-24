package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.infrastructure.persistence.jpa.InstituicaoJpaEntity;
import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import org.springframework.stereotype.Component;

@Component
class JpaMapeadorUsuario {

  Usuario paraDominio(UsuarioJpaEntity e) {
    InstituicaoJpaEntity i = e.getInstituicao();
    Long instId = i == null ? null : i.getId();
    String instNome = i == null ? null : i.getNome();
    return Usuario.builder()
        .id(e.getId())
        .email(e.getEmail())
        .nome(e.getNome())
        .perfil(e.getPerfil())
        .saldoMoedas(e.getSaldoMoedas())
        .instituicaoId(instId)
        .nomeInstituicao(instNome)
        .chaveSemestreUltimaDistribuicao(e.getSemestreUltimaDistribuicao())
        .build();
  }
}
