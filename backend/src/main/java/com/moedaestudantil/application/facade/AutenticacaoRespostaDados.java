package com.moedaestudantil.application.facade;

import com.moedaestudantil.domain.model.TipoPerfil;

/**
 * Carga pública pós autenticação, sem expor o hash; encaminhada ao controlador (DTO de borda).
 */
public record AutenticacaoRespostaDados(
    String accessToken,
    String tokenType,
    long expiresIn,
    long usuarioId,
    String email,
    String nome,
    TipoPerfil perfil,
    long instituicaoId,
    String nomeInstituicao,
    long saldoMoedas) {

  public static AutenticacaoRespostaDados de(
      String token, int minutos, com.moedaestudantil.domain.model.Usuario u) {
    var inst = u.getInstituicaoId() == null ? 0L : u.getInstituicaoId();
    return new AutenticacaoRespostaDados(
        token,
        "Bearer",
        60L * 60L * minutos,
        u.getId(),
        u.getEmail(),
        u.getNome(),
        u.getPerfil(),
        inst,
        u.getNomeInstituicao() != null ? u.getNomeInstituicao() : "",
        u.getSaldoMoedas());
  }
}
